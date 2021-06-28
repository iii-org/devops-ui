<template>
  <el-row v-show="visible">
    <el-form ref="issueForm" inline :model="form" :rules="formRules">
      <el-form-item prop="tracker_id">
        <el-select
          v-model="form.tracker_id"
          :placeholder="$t('Issue.SelectType')"
        >
          <el-option
            v-for="option in tracker"
            :key="option.login" :label="$t('Issue.'+option.name)"
            :value="option.id"
          >
            <tracker :name="option.name" />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="subject">
        <el-input v-model="form.subject" :placeholder="$t('Issue.name')" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
        <el-button @click="advancedAddIssue">》進階設定</el-button>
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
      <AddIssue ref="AddIssue"
                :project-id="selectedProjectId"
                :parent-id="parentId"
                :prefill="form"
                :save-data="saveData"
                import-from="issueList"
                @loading="loadingUpdate"
                @add-topic-visible="handleCloseDialog"
      />
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" @click="handleAdvancedClose">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" :loading="LoadingConfirm" type="primary"
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
import { getIssueTracker } from '@/api/issue'
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
      type: Number,
      default: 0
    },
    saveData: {
      type: Function,
      default: () => {
      }
    }
  },
  data() {
    return {
      addTopicDialogVisible: false,
      LoadingConfirm: false,
      tracker: [],
      parentId: 0,
      form: {
        tracker_id: null,
        subject: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      },
      advancedForm: {},
      formRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userId', 'issueListFilter'])
  },
  watch: {
    issueListFilter: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    }
  },
  mounted() {
    this.setFilterValue()
    this.fetchSelection()
  },
  methods: {
    async fetchSelection() {
      await Promise.all([
        getIssueTracker()
      ]).then(res => {
        const [tracker] = res.map(
          item => item.data
        )
        this.tracker = tracker
      })
    },
    setFilterValue() {
      this.form = {
        tracker_id: null,
        subject: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      }
      const dimensions = ['fixed_version', 'tracker']
      dimensions.forEach((item) => {
        if (this.issueListFilter[item] !== 'null' && this.issueListFilter[item] !== '' && !!(this.issueListFilter[item])) { this.$set(this.form, item + '_id', this.issueListFilter[item]) }
      })
    },
    handleSave() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.form))
          Object.keys(data).map(item => {
            if (data[item] === '' || data[item] === 'null' || !data[item]) delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
          // if (this.parentId) form.append('parent_id', this.parentId)
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          // if (this.uploadFileList.length > 0) {
          //   form.append('upload_file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
          // }
          this.LoadingConfirm = true
          await this.saveData(form)
          this.LoadingConfirm = false
          this.setFilterValue()
        } else {
          return false
        }
      }
      )
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
      this.$refs['AddIssue'].handleSave()
      this.setFilterValue()
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

<style lang="scss" scoped>
</style>
