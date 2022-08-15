<template>
  <el-form
    ref="issueForm"
    :model="issueForm"
    :rules="issueFormRules"
    class="custom-list"
  >
    <div class="ml-3 text-base font-bold">
      {{ $t('general.project_name') }}:
      {{ projectName }}
    </div>
    <el-row>
      <el-row v-if="parentId !== 0">
        <el-col :span="24">
          <el-form-item>
            <div style="font-weight: bold">{{ $t('Issue.ParentIssue') }} : {{ parentName }}</div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.name')"
          prop="name"
        >
          <el-input
            id="input-name"
            v-model="issueForm.name"
            :placeholder="$t('general.PleaseInput')"
          />
        </el-form-item>
      </el-col>

      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.assigned_to')"
          prop="assigned_to_id"
        >
          <el-select
            id="input-assignee"
            v-model="issueForm.assigned_to_id"
            style="width: 100%"
            filterable
            clearable
            @change="handleAssigneeChange"
          >
            <el-option
              v-for="item in assigned_to"
              :key="item.login"
              :label="item.name"
              :value="item.id"
              :class="item.class"
            >
              {{ item.name }}{{ `（${item.login}）` }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.fixed_version')"
          prop="fixed_version_id"
        >
          <el-select
            id="input-version"
            v-model="issueForm.fixed_version_id"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="item in fixed_version"
              :key="item.id"
              :label="getSelectionLabel(item)"
              :value="item.id"
              :disabled="item.status !== 'open'"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.tracker')"
          prop="tracker_id"
        >
          <el-select
            id="input-type"
            v-model="issueForm.tracker_id"
            style="width: 100%"
          >
            <el-option
              v-for="item in getTracker"
              :key="item.id"
              :label="$t('Issue.' + item.name)"
              :value="item.id"
            >
              <Tracker
                :name="$t(`Issue.${item.name}`)"
                :type="item.name"
              />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('general.Status')"
          prop="status_id"
        >
          <el-select
            v-model="issueForm.status_id"
            style="width: 100%"
          >
            <el-option
              v-for="item in status"
              :key="item.id"
              :label="$t('Issue.' + item.name)"
              :value="item.id"
            >
              <Status
                :name="$t(`Issue.${item.name}`)"
                :type="item.name"
              />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.Priority')"
          prop="priority_id"
        >
          <el-select
            v-model="issueForm.priority_id"
            style="width: 100%"
          >
            <el-option
              v-for="item in priority"
              :key="item.id"
              :label="$t('Issue.' + item.name)"
              :value="item.id"
            >
              <Priority
                :name="$t(`Issue.${item.name}`)"
                :type="item.name"
              />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.Estimate')"
          prop="estimated_hours"
        >
          <el-input-number
            id="input-estimate"
            v-model="issueForm.estimated_hours"
            label="please input hours"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>

      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.DoneRatio')"
          prop="done_ratio"
        >
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
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.StartDate')"
          prop="start_date"
        >
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

      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('Issue.EndDate')"
          prop="due_date"
        >
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
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('File.Upload')"
          prop="upload"
        >
          <el-upload
            ref="upload"
            drag
            action=""
            :auto-upload="false"
            :on-exceed="handleExceed"
            :on-change="handleChange"
          >
            <div>
              <el-button
                size="small"
                class="mb-2 buttonSecondary"
              >{{ $t('File.ChooseFile') }}</el-button>
              <div class="el-upload__text">{{ $t('File.DragFilesHere') }}</div>
              <div class="text-xs text-gray-400 px-12">
                <div>{{ $t('File.MaxFileSize') }}: {{ fileSizeLimit }}</div>
                <div>{{ $t('File.AllowedFileTypes') }}: {{ fileTypeLimit }}</div>
              </div>
            </div>
          </el-upload>
          <div class="text-xs mt-2">*{{ $t('File.UploadWarning') }}: {{ specialSymbols }}</div>
        </el-form-item>
      </el-col>

      <el-col
        :md="12"
        :span="24"
      >
        <Tags :form.sync="issueForm" />
        <el-form-item
          :label="$t('general.Description')"
          prop="description"
        >
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
import { getProjectAssignable, getProjectVersion, addProjectTags, getProjectInfos } from '@/api/projects'
import {
  getFileTypeLimit,
  getFileTypeList,
  isAllowedFileTypeList,
  fileSizeToMB,
  containSpecialChar
} from '@/utils/extension'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import { mapGetters } from 'vuex'
import Tags from '@/components/Issue/Tags'

const getFormTemplate = () => ({
  name: '',
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
  parent_id: '',
  tags: []
})

export default {
  name: 'AddIssue',
  components: { Tracker, Status, Priority, Tags },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [Number, String],
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
      default: () => ({})
    },
    importFrom: {
      type: String,
      default: null
    },
    trackerList: {
      type: Array,
      default: () => []
    }
  },

  data() {
    const validateAssignedTo = (rule, value, callback) => {
      if ((!value || value === '') && this.issueForm.status_id >= 2) {
        callback(new Error('This Status need a assignee.'))
      } else {
        callback()
      }
    }
    return {
      assigned_to: [],
      fixed_version: [],
      issueForm: getFormTemplate(),
      issueFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        assigned_to_id: [{ validator: validateAssignedTo, trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
      },
      uploadFileList: [],
      pickerOptions(startDate) {
        return {
          disabledDate(time) {
            return time.getTime() < new Date(startDate).getTime()
          }
        }
      },
      fileSizeLimit: '5MB',
      fileTypeLimit: 'JPG、PNG、GIF / ZIP、7z、RAR/MS Office Docs',
      fileTypeList: {},
      specialSymbols: '\ / : * ? " < > | # { } % ~ &',
      tagsString: '',
      projectName: ''
    }
  },

  computed: {
    ...mapGetters([
      'userId',
      'status',
      'priority',
      'groupBy',
      'issueFilter',
      'strictTracker',
      'tracker',
      'selectedProject'
    ]),
    getTracker() {
      if (this.trackerList.length > 0) return this.trackerList
      else if (this.parentId) return this.tracker
      else return this.strictTracker
    }
  },

  watch: {
    projectId() {
      this.fetchData()
    },
    prefill: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    },
    issueFilter: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    }
  },

  mounted() {
    this.fetchProject()
    this.fetchData()
    this.setFilterValue()
  },

  methods: {
    async fetchProject() {
      const project = await getProjectInfos(this.projectId)
      this.projectName = project.data.display || this.selectedProject.display
    },
    async fetchData() {
      this.isLoading = true
      if (this.projectId) {
        await Promise.all([
          getProjectAssignable(this.projectId),
          getProjectVersion(this.projectId, { status: 'open,locked' })
        ]).then((res) => {
          const [assigned_to, fixed_version] = res.map((item) => item.data)

          this.assigned_to = [
            {
              name: this.$t('Issue.me'),
              login: '-Me-',
              id: this.userId,
              class: 'bg-yellow-100'
            },
            ...assigned_to.user_list
          ]
          this.fixed_version = fixed_version.versions
        })
      }
      if (this.issueId > 0) {
        await this.getClosable()
      }
      this.fileTypeLimit = await getFileTypeLimit()
      this.fileTypeList = await getFileTypeList()
      this.isLoading = false
    },
    setFilterValue() {
      if (this.importFrom && this.issueFilter[this.importFrom]) {
        Object.keys(this.issueFilter[this.importFrom]).forEach((item) => {
          if (
            this.issueFilter[this.importFrom][item] !== 'null' &&
            !!this.issueFilter[this.importFrom][item] &&
            this.issueFilter[this.importFrom][item] !== ''
          ) {
            if (item === 'tags' || item === 'start_date' || item === 'due_date') {
              this.$set(this.issueForm, item, this.issueFilter[this.importFrom][item])
            } else {
              this.$set(this.issueForm, item + '_id', this.issueFilter[this.importFrom][item])
            }
          }
        })
        let checkQuickAddIssueForm = ['tracker_id', 'name']
        if (this.importFrom === 'board') {
          checkQuickAddIssueForm = ['tracker_id', 'name', 'assigned_to_id']
          checkQuickAddIssueForm.push(this.groupBy.dimension + '_id')
        }
        checkQuickAddIssueForm.forEach((item) => {
          this.issueForm[item] = this.prefill[item]
        })
      } else {
        this.handleImport()
      }
    },
    isReplaceTrackerId() {
      const trackerIds = this.getTracker.map((item) => item.id)
      const isHasTracker = trackerIds.includes(this.issueForm.tracker_id)
      if (!isHasTracker) { this.issueForm.tracker_id = trackerIds[0] }
    },
    handleImport() {
      Object.keys(this.prefill).forEach((item) => {
        this.issueForm[item] = this.prefill[item]
      })
      if (this.issueForm.tracker_id) { this.isReplaceTrackerId() }
    },

    handleClose() {
      if (this.dialogVisible) {
        this.uploadFileList = []
        this.$nextTick(() => {
          this.$refs['upload'].clearFiles()
          this.$refs['issueForm'].resetFields()
        })
      }
      this.$emit('loading', false)
      this.$emit('add-topic-visible', false)
    },
    handleSave() {
      this.handleUpdateTags()
    },
    async handleUpdateTags() {
      const tags = this.issueForm.tags
      const tagsLength = tags.length
      const addTags = []
      const originTags = []
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          if (typeof tag === 'string') addTags.push(tag)
          else if (typeof tag === 'number') originTags.push(tag)
        })
      }
      if (addTags.length > 0) await this.handleAddProjectTags(addTags, originTags, tagsLength)
      else this.tagsArrayToString(originTags, tagsLength)
    },
    async handleAddProjectTags(addTags, originTags, tagsLength) {
      addTags.map(async (tag) => {
        const tagValue = tag.split('__')[1]
        const formData = this.getAddTagsFormData(tagValue)
        await this.addProjectTags(formData, originTags, tagsLength)
      })
    },
    async addProjectTags(formData, originTags, tagsLength) {
      await addProjectTags(formData).then(async (res) => {
        const id = res.data.tags.id
        originTags.push(id)
        this.tagsArrayToString(originTags, tagsLength)
      })
    },
    tagsArrayToString(tags, tagsLength) {
      this.tagsString = tags.length > 0 ? tags.join() : null
      if (this.tagsString === null) this.issueForm.tags = ''
      else this.issueForm.tags = this.tagsString
      if (tags.length === tagsLength) this.save()
    },
    getAddTagsFormData(tag) {
      const formData = new FormData()
      formData.delete('name')
      formData.delete('project_id')
      formData.append('name', tag)
      formData.append('project_id', this.projectId)
      return formData
    },
    save() {
      let result = false
      this.$refs['issueForm'].validate(async (valid) => {
        if (valid) {
          this.$emit('loading', true)
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.issueForm))
          Object.keys(data).map((item) => {
            if (data[item] === '' || data[item] === 'null' || !data[item]) delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
          if (this.parentId) form.append('parent_id', this.parentId)
          Object.keys(data).forEach((objKey) => {
            form.append(objKey, data[objKey])
          })
          if (this.uploadFileList.length > 0) {
            // form.append('upload_content_type', this.uploadFileList[0].raw.type)
            // form.append('upload_file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
            this.uploadFileList.forEach(list => {
              form.append('upload_files', list.raw)
            })
          }
          await this.saveData(form)
          result = true
          this.handleClose()
        } else {
          return false
        }
      })
      if (this.parentId) this.$emit('has-children')
      return result
    },
    handleExceed() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.SingleFileLimit'),
        type: 'warning'
      })
    },
    async handleChange(file, fileList) {
      const { raw, size, name } = file
      if (!isAllowedFileTypeList(this.fileTypeList, raw.type)) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.UnsupportedFileFormat'),
          type: 'warning'
        })
        this.$refs['upload'].clearFiles()
      } else if (fileSizeToMB(size) > 5) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileSizeLimit', { size: this.fileSizeLimit }),
          type: 'warning'
        })
        this.$refs['upload'].clearFiles()
      } else if (containSpecialChar(name)) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.FileNameLimit'),
          type: 'warning'
        })
        this.$refs['upload'].clearFiles()
      } else {
        this.uploadFileList = fileList
      }
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    clearDueDate(dueDate) {
      if (dueDate === null) this.issueForm.due_date = ''
    },
    checkDueDate(startDate) {
      if (startDate === null) this.issueForm.start_date = ''
      if (new Date(startDate).getTime() >= new Date(this.issueForm.due_date)) this.issueForm.due_date = ''
    },
    handleAssigneeChange() {
      const activeStatusId = this.status.find((status) => status.name === 'Active').id
      const assignedStatusId = this.status.find((status) => status.name === 'Assigned').id
      if (this.issueForm.status_id === 1) {
        this.issueForm.status_id = assignedStatusId
      }
      if (this.issueForm.status_id === assignedStatusId && this.issueForm.assigned_to_id === '') {
        this.issueForm.status_id = activeStatusId
      }
    }
  }
}
</script>

<style lang="scss">
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
