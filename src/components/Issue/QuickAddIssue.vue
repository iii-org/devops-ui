<template>
  <el-row v-show="visible">
    <el-form
      ref="issueForm"
      inline
      :model="form"
      :rules="formRules"
    >
      <el-form-item prop="tracker_id">
        <el-select
          v-model="form.tracker_id"
          :placeholder="$t('Issue.SelectType')"
          :disabled="hasSetTracker"
        >
          <el-option
            v-for="option in trackerList"
            :key="option.login"
            :label="$t('Issue.' + option.name)"
            :value="option.id"
          >
            <Tracker
              :name="$t(`Issue.${option.name}`)"
              :type="option.name"
            />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="name">
        <el-input
          v-model="form.name"
          :placeholder="$t('Issue.name')"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          class="buttonPrimary"
          :loading="LoadingConfirm"
          @click="handleSave"
        >
          {{ $t('general.Save') }}
        </el-button>
        <el-button
          :disabled="LoadingConfirm"
          class="buttonSecondaryReverse"
          @click="advancedAddIssue"
        >
          {{ $t('general.AdvancedSettings') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      :title="$t('Issue.AddIssue')"
      :visible.sync="addTopicDialogVisible"
      width="50%"
      top="5px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <AddIssue
        ref="AddIssue"
        :project-id="selectedProjectId"
        :parent-id="parentId"
        :prefill="form"
        :save-data="saveData"
        import-from="list"
        :tracker-list="trackerList"
        @loading="loadingUpdate"
        @add-topic-visible="handleCloseDialog"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button class="buttonSecondaryReverse" @click="handleAdvancedClose">
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button
          :loading="LoadingConfirm"
          class="buttonPrimary"
          @click="handleAdvancedSave"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import Tracker from '@/components/Issue/Tracker'
import { mapGetters } from 'vuex'
import AddIssue from './AddIssue'

export default {
  name: 'QuickAddIssue',
  components: { AddIssue, Tracker },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [Number, String],
      default: 0
    },
    saveData: {
      type: Function,
      default: () => ({})
    },
    trackerName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      addTopicDialogVisible: false,
      LoadingConfirm: false,
      parentId: 0,
      form: {
        tracker_id: 8,
        name: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      },
      advancedForm: {},
      formRules: {
        name: [
          {
            required: true,
            message: this.$t('Validation.Input', [this.$t('general.Name')]),
            trigger: 'blur'
          }
        ],
        tracker_id: [
          { required: true, message: this.$t('Validation.Select', [this.$t('general.Type')]), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userId', 'strictTracker', 'issueFilter']),
    hasSetTracker() {
      return !!this.trackerName
    },
    trackerList() {
      if (this.hasSetTracker) return this.strictTracker.filter((item) => item.name === this.trackerName)
      return this.strictTracker
    }
  },
  watch: {
    issueFilter: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    }
  },
  mounted() {
    this.setFilterValue()
    this.form.tracker_id = this.trackerList[0].id
  },
  methods: {
    setFilterValue() {
      this.form = {
        tracker_id: null,
        name: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      }
      if (this.hasSetTracker) {
        this.form.tracker_id = this.trackerList[0].id
      }
      const dimensions = ['fixed_version', 'tracker']
      dimensions.forEach((item) => {
        if (
          this.issueFilter['list'] &&
          this.issueFilter['list'][item] !== 'null' &&
          this.issueFilter['list'][item] !== '' &&
          !!this.issueFilter['list'][item]
        ) {
          this.$set(this.form, item + '_id', this.issueFilter['list'][item])
        }
      })
    },
    handleSave() {
      this.$refs['issueForm'].validate(async (valid) => {
        if (valid) {
          this.LoadingConfirm = true
          const data = this.cleanFormData()
          await this.sendSaveAction(data)
        }
        return valid
      })
    },
    cleanFormData() {
      const data = JSON.parse(JSON.stringify(this.form))
      Object.keys(data).forEach((item) => {
        if (data[item] === '' || data[item] === 'null' || !data[item]) delete data[item]
      })
      return data
    },
    async sendSaveAction(data) {
      const form = new FormData()
      form.append('project_id', this.projectId)
      Object.keys(data).forEach((objKey) => {
        form.append(objKey, data[objKey])
      })
      await this.saveData(form)
      this.LoadingConfirm = false
      const tracker_id = data.tracker_id
      this.setFilterValue()
      this.form.tracker_id = tracker_id
    },
    handleClose() {
      this.$emit('close-dialog', false)
    },
    handleCloseDialog() {
      this.addTopicDialogVisible = false
    },
    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
      this.setFilterValue()
    },
    handleAdvancedSave() {
      const result = this.$refs['AddIssue'].handleSave()
      if (result) {
        this.setFilterValue()
      }
    },
    advancedAddIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.advancedForm = this.form
    },
    loadingUpdate(value) {
      this.LoadingConfirm = value
    }
  }
}
</script>
