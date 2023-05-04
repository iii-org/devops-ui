<template>
  <el-row v-show="visible">
    <div style="padding: 10px 5px; font-weight: bold">
      <span>{{ subIssue ? $t('Issue.AddSubIssue') : $t('Issue.AddIssue') }}: </span>
      <el-link
        :disabled="isLoading"
        class="link"
        :size="isTable ? 'small' : ''"
        @click="onAdvancedSettingsClick"
      >
        {{ $t('general.AdvancedSettings') }}
      </el-link>
    </div>

    <el-form
      ref="quickAddIssueForm"
      inline
      :model="formData"
      :rules="formRules"
    >
      <el-form-item prop="tracker_id">
        <el-select
          v-model="formData.tracker_id"
          :size="isTable ? 'small' : ''"
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
          :size="isTable ? 'small' : ''"
          :placeholder="$t('Issue.name')"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          v-if="!isTable"
          type="primary"
          :loading="isLoading"
          @click="onSaveClick"
        >
          {{ $t('general.Save') }}
        </el-button>
        <el-button
          v-if="isTable"
          type="success"
          :loading="isLoading"
          style="padding: 9px 8px;"
          size="small"
          icon="el-icon-check"
          @click="onSaveClick"
        />
        <el-button
          v-if="isTable && showClose"
          :disabled="isLoading"
          style="padding: 9px 8px;"
          size="small"
          icon="el-icon-close"
          type="danger"
          @click="$emit('close')"
        />
      </el-form-item>
    </el-form>
    <el-dialog
      :visible.sync="showDialog"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :show-close="false"
      append-to-body
      width="50%"
      top="5px"
    >
      <template slot="title">
        <el-row slot="title" type="flex" align="middle">
          <el-col :xs="24" :md="16">
            <span class="text-title">
              {{ $t('Issue.AddIssue') }}
            </span>
          </el-col>
          <el-col :xs="24" :md="8" class="text-right">
            <el-button
              v-if="parent.id"
              class="buttonPrimary"
              @click="handleAdvancedImport"
            >
              {{ $t('Issue.ImportParentIssueData') }}
            </el-button>
            <el-button
              class="buttonSecondaryReverse"
              @click="showDialog = false"
            >
              {{ $t('general.Close') }}
            </el-button>
          </el-col>
        </el-row>
      </template>
      <AddIssue
        ref="addIssueDialog"
        :project-id="projectId"
        :parent-id="parent.id"
        :parent-name="parent.name"
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
  name: '',
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
    },
    parent: {
      type: Object,
      default: () => ({})
    },
    isTable: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    subIssue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
  mounted() {
    const { tracker } = this.filterConditions
    if (tracker && this.trackerList.map(a => a.id).includes(tracker)) this.formData.tracker_id = tracker
  },
  methods: {
    onSaveClick() {
      // this.formData.tracker_id = this.tracker_id
      this.$refs.quickAddIssueForm.validate(async (valid) => {
        if (!valid) return
        const sendData = Object.assign({}, this.formData, {
          project_id: this.projectId
        })
        if (this.parent.hasOwnProperty('id')) this.$set(sendData, 'parent_id', this.parent.id)
        const formData = this.getFormData(sendData)
        this.handleIssueSave(formData)
      })
    },
    onAdvancedSettingsClick() {
      const { priority, status, tracker, fixed_version } = this.filterConditions
      if (tracker) this.formData.priority_id = tracker
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
    },
    setFormData(data) {
      const {
        project,
        assigned_to,
        fixed_version,
        name,
        tracker,
        status,
        priority,
        estimated_hours,
        done_ratio,
        start_date,
        due_date,
        description
      } = data
      // this.formData = {}
      this.formData.project_id = project ? project.id : ''
      this.formData.assigned_to_id = assigned_to ? assigned_to.id : ''
      this.formData.name = this.formData.name !== '' ? this.formData.name : name + ' (' + this.$t('Issue.Copy') + ')'
      this.formData.fixed_version_id = fixed_version ? fixed_version.id : ''
      this.formData.tracker_id = this.formData.tracker_id !== null ? this.formData.tracker_id : tracker.id
      this.formData.status_id = status.id
      this.formData.priority_id = priority.id
      this.formData.estimated_hours = estimated_hours
      this.formData.done_ratio = done_ratio
      this.formData.start_date = start_date === null ? '' : start_date
      this.formData.due_date = due_date === null ? '' : due_date
      this.formData.description = description === null ? '' : description
    },
    handleAdvancedImport() {
      this.setFormData(this.parent)
      this.$refs['addIssueDialog'].handleImport()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';
.link {
  color: $buttonPrimary
}
</style>
