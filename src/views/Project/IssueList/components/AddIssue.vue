<template>
  <el-form ref="issueForm" :model="issueForm" :rules="issueFormRules" class="custom-list">
    <el-row>
      <el-row v-if="parentId !== 0">
        <el-col :md="12" :span="24">
          <el-form-item>
            <div style="font-weight: bold">{{ $t('Issue.ParentIssue') }} : {{ parentName }}</div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.name')" prop="subject">
          <el-input id="input-name" v-model="issueForm.subject" :placeholder="$t('general.PleaseInput')" />
        </el-form-item>
      </el-col>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.assigned_to')" prop="assigned_to_id">
          <el-select id="input-assignee" v-model="issueForm.assigned_to_id" style="width: 100%" filterable clearable>
            <el-option v-for="item in assigned_to" :key="item.login" :label="item.name" :value="item.id" :class="item.class">
              {{ item.name }}{{ `（${item.login}）` }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.fixed_version')" prop="fixed_version_id">
          <el-select id="input-version" v-model="issueForm.fixed_version_id" style="width: 100%" filterable clearable>
            <el-option
              v-for="item in fixed_version"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              :disabled="item.status !== 'open'"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.tracker')" prop="tracker_id">
          <el-select id="input-type" v-model="issueForm.tracker_id" style="width: 100%">
            <el-option v-for="item in tracker" :key="item.id" :label="$t('Issue.'+item.name)" :value="item.id">
              <tracker :name="item.name" />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.status')" prop="status_id">
          <el-select v-model="issueForm.status_id" style="width: 100%">
            <el-option v-for="item in status" :key="item.id" :label="$t('Issue.'+item.name)" :value="item.id">
              <status :name="item.name" />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
          <el-select v-model="issueForm.priority_id" style="width: 100%">
            <el-option v-for="item in priority" :key="item.id" :label="$t('Issue.'+item.name)" :value="item.id">
              <priority :name="item.name" />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.Estimate')" prop="estimated_hours">
          <el-input-number
            id="input-estimate"
            v-model="issueForm.estimated_hours"
            label="please input hours"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.DoneRatio')" prop="done_ratio">
          <el-input-number
            id="input-done-ratio"
            v-model="issueForm.done_ratio"
            label="please input numbers"
            :min="0"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.StartDate')" prop="start_date">
          <el-date-picker
            id="input-start-date"
            v-model="issueForm.start_date"
            type="date"
            :placeholder="$t('Issue.SelectDate')"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            @change="checkDueDate"
          />
        </el-form-item>
      </el-col>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('Issue.EndDate')" prop="due_date">
          <el-date-picker
            id="input-end-date"
            v-model="issueForm.due_date"
            type="date"
            :placeholder="$t('Issue.SelectDate')"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions(issueForm.start_date)"
            @change="clearDueDate"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :md="12" :span="24">
        <el-form-item :label="$t('File.Upload')" prop="upload">
          <el-upload
            id="input-upload"
            ref="upload"
            class="upload-file2"
            drag
            action=""
            :auto-upload="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleChange"
          >
            <div class="uploadBtn el-button--primary">{{ $t('File.UploadBtn') }}</div>
            <div class="el-upload__text">{{ $t('File.SelectFileOrDragHere') }}</div>
          </el-upload>
        </el-form-item>
      </el-col>

      <el-col :md="12" :span="24">
        <el-form-item :label="$t('general.Description')" prop="description">
          <el-input
            id="input-description"
            v-model="issueForm.description"
            type="textarea"
            :placeholder="$t('general.PleaseInput')"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import dayjs from 'dayjs'
import { getIssueStatus, getIssueTracker, getIssuePriority } from '@/api/issue'
import { getProjectAssignable, getProjectVersion } from '@/api/projects'
import { fileExtension } from '@/utils/extension'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import { mapGetters } from 'vuex'

const getFormTemplate = () => ({
  subject: '',
  description: '',
  priority_id: 3,
  tracker_id: '',
  status_id: 1,
  fixed_version_id: '',
  assigned_to_id: '',
  start_date: dayjs().format('YYYY-MM-DD'),
  due_date: '',
  done_ratio: '',
  estimated_hours: '',
  parent_id: ''
})

export default {
  name: 'AddIssue',
  components: { Tracker, Status, Priority },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: 0
    },
    parentName: {
      type: String,
      default: ''
    },
    parentId: {
      type: Number,
      default: 0
    },
    prefill: {
      type: Object,
      default: () => ({})
    },
    saveData: {
      type: Function,
      default: () => {
      }
    },
    importFrom: {
      type: String,
      default: null
    }
  },

  data() {
    const validateAssignedTo = (rule, value, callback) => {
      if ((!value || value === '') && (this.issueForm.status_id >= 2)) {
        callback(new Error('This Status need a assignee.'))
      } else {
        callback()
      }
    }
    return {
      status: [],
      tracker: [],
      priority: [],
      assigned_to: [],
      fixed_version: [],
      issueForm: getFormTemplate(),
      issueFormRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        assigned_to_id: [{ validator: validateAssignedTo, trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
      },
      LoadingConfirm: false,
      uploadFileList: [],
      extension: {},
      pickerOptions(startDate) {
        return {
          disabledDate(time) {
            return time.getTime() < new Date(startDate).getTime()
          }
        }
      }
    }
  },

  computed: {
    ...mapGetters(['userId', 'kanbanGroupBy', 'kanbanFilter', 'issueListFilter'])
  },

  watch: {
    projectId() {
      this.fetchData()
    },
    LoadingConfirm(value) {
      this.$emit('loading', value)
    },
    prefill: {
      deep: true,
      handler() {
        if (['issueList', 'kanban'].includes(this.importFrom)) {
          this.setFilterValue()
        }
      }
    },
    kanbanFilter: {
      deep: true,
      handler() {
        if (this.importFrom === 'kanban') {
          this.setFilterValue()
        }
      }
    },
    issueListFilter: {
      deep: true,
      handler() {
        if (this.importFrom === 'issueList') {
          this.setFilterValue()
        }
      }
    }
  },

  mounted() {
    this.fetchData()
    this.extension = fileExtension()
    if (['issueList', 'kanban'].includes(this.importFrom)) {
      this.setFilterValue()
    }
  },

  methods: {
    async fetchData() {
      this.isLoading = true
      if (this.projectId) {
        await Promise.all([
          getProjectAssignable(this.projectId),
          getProjectVersion(this.projectId),
          getIssueTracker(),
          getIssueStatus(),
          getIssuePriority()
        ]).then(res => {
          const [assigned_to, fixed_version, tracker, status, priority] = res.map(
            item => item.data
          )

          this.assigned_to = [
            {
              name: this.$t('Issue.me'),
              login: 'me',
              id: this.userId,
              class: 'bg-yellow-100'
            }, ...assigned_to.user_list
          ]
          this.fixed_version = fixed_version.versions
          this.status = status
          this.tracker = tracker
          this.priority = priority
        })
      }
      if (this.issueId > 0) {
        await this.getClosable()
      }
      this.isLoading = false
    },
    setFilterValue() {
      const getFilter = this.importFrom + 'Filter'
      Object.keys(this[getFilter]).forEach((item) => {
        if (this[getFilter][item] !== 'null') { this.$set(this.issueForm, item + '_id', this[getFilter][item]) }
      })
      let checkQuickAddIssueForm = ['tracker_id', 'subject']
      if (this.importFrom === 'kanban') {
        checkQuickAddIssueForm = ['tracker_id', 'subject', 'assigned_to_id']
        checkQuickAddIssueForm.push(this.kanbanGroupBy.dimension + '_id')
      }
      checkQuickAddIssueForm.forEach((item) => {
        this.issueForm[item] = this.prefill[item]
      })
    },
    handleClose() {
      if (this.dialogVisible) {
        this.uploadFileList = []
        this.$nextTick(() => {
          this.$refs['upload'].clearFiles()
          this.$refs['issueForm'].resetFields()
        })
      }
      this.$emit('add-topic-visible', false)
    },
    handleSave() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.issueForm))
          Object.keys(data).map(item => {
            if (data[item] === '') delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
          if (this.parentId) form.append('parent_id', this.parentId)
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          if (this.uploadFileList.length > 0) {
            form.append('upload_content_type', this.uploadFileList[0].raw.type)
            form.append('upload_file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
          }
          this.LoadingConfirm = true
          await this.saveData(form)
          this.LoadingConfirm = false
          this.handleClose()
        } else {
          return false
        }
      })
    },
    handleExceed() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.SingleFileLimit'),
        type: 'warning'
      })
    },
    async handleChange(file, fileList) {
      if (this.extension[file.raw.type] === undefined) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.UnsupportedFileFormat'),
          type: 'warning'
        })
        this.$refs['upload'].clearFiles()
      } else if (file.size / 1024 > 20480) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit'),
          type: 'warning'
        })
        this.$refs['upload'].clearFiles()
      } else {
        this.uploadFileList = fileList
      }
    },
    clearDueDate(dueDate) {
      if (dueDate === null) this.issueForm.due_date = ''
    },
    checkDueDate(startDate) {
      if (startDate === null) this.issueForm.start_date = ''
      if (new Date(startDate).getTime() >= new Date(this.issueForm.due_date)) this.issueForm.due_date = ''
    }
  }
}
</script>

<style lang="scss">
.el-upload-dragger {
  height: 50px;
}

.el-upload__text {
  margin-top: 18px;
}

.uploadBtn {
  font-size: 13px;
  padding: 5px 11px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 2px;
  display: inline-block;
}

.custom-list {
  .el-row {
    font-size: 0;
  }

  .el-col {
    float: none;
    padding: 0 10px;
    vertical-align: top;
    display: inline-block;
    @media (max-width: 767px) {
      width: 100%;
      display: block;
    }
  }

  .el-form-item__label {
    float: none;
    text-align: left;
  }
}
</style>
