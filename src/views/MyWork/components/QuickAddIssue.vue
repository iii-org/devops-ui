<template>
  <el-row v-show="visible">
    <el-form
      ref="quickAddIssueForm"
      inline
      :model="formData"
      :rules="formRules"
    >
      <el-form-item prop="tracker_id">
        <el-select
          v-model="tracker_id"
          :placeholder="$t('Issue.SelectType')"
        >
          <el-option
            v-for="option in trackerList"
            :key="option.id"
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
          v-model="formData.name"
          :placeholder="$t('Issue.name')"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          class="buttonPrimary"
          :loading="isLoading"
          @click="onSaveClick"
        >
          {{ $t('general.Save') }}
        </el-button>
        <el-button
          :disabled="isLoading"
          class="buttonSecondaryReverse"
          @click="onAdvancedSettingsClick"
        >
          {{ $t('general.AdvancedSettings') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      :title="$t('Issue.AddIssue')"
      :visible.sync="showDialog"
      :close-on-click-modal="false"
      width="50%"
      top="5px"
    >
      <AddIssue
        ref="addIssueDialog"
        :project-id="projectId"
        :parent-id="parentId"
        :prefill="formData"
        :save-data="handleIssueSave"
        import-from="list"
        :tracker-list="trackerList"
        @loading="loadingUpdate"
        @add-topic-visible="showDialog = false"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button class="buttonSecondaryReverse" @click="onDialogCancel">
          {{ $t('general.Cancel') }}
        </el-button>
        <el-button
          :loading="isLoading"
          class="buttonPrimary"
          @click="onDialogConfirm"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { addIssue } from '@/api/issue'
import { Tracker, AddIssue } from '@/components/Issue'

const getDefaultFormData = () => ({
  tracker_id: null,
  name: null,
  assigned_to_id: null,
  status_id: 1,
  priority_id: 3
})

export default {
  name: 'MyWorkQuickAddIssue',
  components: { Tracker, AddIssue },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [Number, String],
      default: 0
    },
    filterConditions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      parentId: 0,
      formData: getDefaultFormData(),
      tracker_id: null,
      isLoading: false,
      showDialog: false,
      formRules: {
        name: [
          {
            required: true,
            message: this.$t('Validation.Input', [this.$t('general.Name')]),
            trigger: 'blur'
          }
        ],
        tracker_id: [
          {
            required: true,
            message: this.$t('Validation.Select', [this.$t('general.Type')]),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'tracker', 'strictTracker', 'enableForceTracker']),
    trackerList() {
      if (this.enableForceTracker) return this.strictTracker
      return this.tracker
    }
  },
  watch: {
    projectId(val) {
      if (val === '') {
        this.$emit('update:visible', false)
      }
      this.formData = getDefaultFormData()
    }
  },
  methods: {
    onSaveClick() {
      this.formData.tracker_id = this.tracker_id
      this.$refs.quickAddIssueForm.validate(async (valid) => {
        if (!valid) return
        const sendData = Object.assign({}, this.formData, {
          project_id: this.projectId
        })
        const formData = this.getFormData(sendData)
        this.handleIssueSave(formData)
      })
    },
    onAdvancedSettingsClick() {
      const { priority, status, tracker, fixed_version } = this.filterConditions
      this.formData.tracker_id = this.tracker_id || tracker
      if (priority) this.formData.priority_id = priority
      if (status) this.formData.status_id = status
      if (fixed_version) this.formData.fixed_version_id = fixed_version
      this.showDialog = true
    },
    onDialogCancel() {
      this.$refs.addIssueDialog.handleClose()
    },
    onDialogConfirm() {
      this.$refs.addIssueDialog.handleSave()
    },
    loadingUpdate(value) {
      this.isLoading = value
    },
    async handleIssueSave(data) {
      const assignedToId = data instanceof FormData
        ? Number(data.get('assigned_to_id'))
        : data.assigned_to_id
      this.isLoading = true
      await addIssue(data)
        .then(() => {
          // this.$message({
          //   title: this.$t('general.Success'),
          //   message: this.$t('Notify.Added'),
          //   type: 'success'
          // })
          this.formData = getDefaultFormData()
          this.$emit('update', assignedToId)
        })
        .catch((error) => {
          return error
        })
      this.isLoading = false
    },
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    }
  }
}
</script>
