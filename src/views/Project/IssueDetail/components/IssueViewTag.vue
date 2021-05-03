<template>
  <el-row>
    <el-row type="flex" align="center" class="flex-warp">
      <el-col :span="12" :md="8">
        <template v-if="form.status" :span="18">
          <el-tag
            v-if="form.status.name"
            :type="getStatusTagType(form.status.name)"
            effect="dark"
            class="rounded-xl font-weight-bold"
          >
            {{ $t(`Issue.${form.status.name}`) }}
          </el-tag>
        </template>
        <template v-if="form.priority" :span="18">
          <el-tag v-if="form.priority.name" :type="getPriorityTagType(form.priority.name)">
            {{ $t(`Issue.${form.priority.name}`) }}
          </el-tag>
        </template>
        @
        <template v-if="form.priority" :span="18">
          <b>{{ $t('Version.Version') }}</b> {{ form.fixed_version.name }}</template>
      </el-col>
      <el-col :span="12" :md="8">
        <b><i class="el-icon-s-custom" /> {{ $t('Issue.Assignee') }}</b>
        <el-tag v-if="form.assigned_to">{{ form.assigned_to.name }}({{ form.assigned_to.login }})</el-tag>
      </el-col>
      <el-col :span="24" :md="8">
        <el-row type="flex" align="middle" :gutter="20">
          <el-col :span="4" class="text-right">
            <b>進度</b>
          </el-col>
          <el-col :span="14">
            <el-row type="flex" align="center">
              <el-col :span="11">{{ form.start_date }}</el-col>
              <el-col :span="2" class="text-center">~</el-col>
              <el-col :span="11" class="text-right">{{ form.due_date }}</el-col>
            </el-row>
            <el-progress :text-inside="true" :stroke-width="20" :percentage="form.done_ratio" />
          </el-col>
          <el-col :span="6">
            <b>{{ $t('Issue.Estimate') }}</b>
            {{ form.estimated_hours }}
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row v-if="form.description" class="info">
      {{ form.description }}
    </el-row>
    <el-row v-if="issueFile.length>0">
      <el-col>
        <b>{{ $t('Issue.Files') }}</b>
      </el-col>
      <el-col>
        <el-row class="el-upload-list">
          <el-row v-for="file in issueFile" :key="file.id" class="el-upload-list__item is-ready">
            <el-col :span="20">
              <a class="el-upload-list__item-name" @click="handleDownload(file)">
                <i class="el-icon-document" />{{ file.filename }} ({{ file.created_on }})
              </a>
            </el-col>
            <el-col :span="4" class="text-right">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                :loading="isLoading"
                @click="deleteIssueFile(file)"
              >
                {{ $t('general.Delete') }}
              </el-button>
            </el-col>
          </el-row>
        </el-row>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssueStatus, getIssueTracker, getIssuePriority, deleteIssueFile } from '@/api/issue'
import {
  getProjectAssignable,
  getProjectVersion,
  getProjectIssueList,
  getProjectIssueListByTree,
  downloadProjectFile
} from '@/api/projects'

export default {
  name: 'IssueForm',
  props: {
    issueId: {
      type: Number,
      default: 0
    },
    form: {
      type: Object,
      default: () => {
      }
    },
    issueFile: {
      type: Array,
      default: () => ([])
    }
  },
  data: () => ({
    issueFormRules: {
      subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
      tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
      status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
      priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
    },
    assigneeList: [],
    versionList: [],
    typeList: [],
    statusList: [],
    priorityList: [],

    parentId: null,
    parentIssue: {},
    relativeIssueList: [],
    childrenIssueList: [],
    isLoading: false,

    pickerOptions(startDate) {
      return {
        disabledDate(time) {
          return time.getTime() < new Date(startDate).getTime()
        }
      }
    }
  }),
  computed: {
    ...mapGetters(['selectedProjectId']),
    dynamicStatusList() {
      const listWithoutClosedOption = this.statusList.filter(item => item.label !== 'Closed')
      return this.isChildrenAllClosed() ? this.statusList : listWithoutClosedOption
    },
    isParentIssueClosed() {
      return this.parentIssue !== {} && this.parentIssue.issue_status === 'Closed'
    },
    dynamicAssigneeList() {
      const hasInactiveAssignee =
        this.form.assigned_to_id !== '' &&
        this.assigneeList.findIndex(item => item.value === this.form.assigned_to_id) === -1
      if (hasInactiveAssignee) {
        const inactiveAssignee = {
          label: `Disabled User (${this.form.assigned_to_id})`,
          value: this.form.assigned_to_id
        }
        const result = Object.assign([], this.assigneeList)
        result.push(inactiveAssignee)
        return result
      } else {
        return this.assigneeList
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      await Promise.all([
        getProjectAssignable(this.selectedProjectId),
        getProjectVersion(this.selectedProjectId),
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority(),
        getProjectIssueList(this.selectedProjectId),
        getProjectIssueListByTree(this.selectedProjectId)
      ]).then(res => {
        const [assigneeList, versionList, typeList, statusList, priorityList, issueList, issueListByTree] = res.map(
          item => item.data
        )

        this.assigneeList = assigneeList.user_list.map(item => ({
          label: item.name,
          login: item.login,
          value: item.id
        }))
        this.versionList = versionList.versions.map(item => ({
          label: item.name,
          value: item.id,
          status: item.status
        }))
        this.statusList = statusList.map(item => ({ label: item.name, value: item.id }))
        this.typeList = this.issueTypeList = typeList.map(item => ({ label: item.name, value: item.id }))
        this.priorityList = priorityList.map(item => ({ label: item.name, value: item.id }))
        this.parentIssue = issueList.find(item => item.id === this.parentId) || {}
        this.relativeIssueList = this.createRelativeList(issueListByTree)
        this.updateChildrenList()
      })
      this.isLoading = false
    },
    isChildrenAllClosed() {
      return !this.childrenIssueList.length || this.childrenIssueList.every(item => item.issue_status === 'Closed')
    },
    createRelativeList(list) {
      const result = []

      function flatList(parent) {
        for (let i = 0; i < parent.length; i++) {
          result.push(parent[i])
          const children = parent[i].children
          if (parent[i].children.length) flatList(children)
        }
      }

      flatList(list)
      return result
    },
    updateChildrenList() {
      const idx = this.relativeIssueList.findIndex(item => item.id === this.issueId)
      this.childrenIssueList = this.relativeIssueList[idx].children
    },
    clearDueDate(val) {
      this.$nextTick(() => {
        if (val === null) this.form.due_date = ''
      })
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    },
    async handleDownload(row) {
      const res = await downloadProjectFile({ id: row.id, filename: row.filename })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', row.filename) // or any other extension
      document.body.appendChild(link)
      link.click()
    },
    deleteIssueFile(row) {
      this.isLoading = true
      deleteIssueFile(row.id)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.removeFile(row.id)
        })
        .catch(err => console.err(err))
        .then(() => {
          this.isLoading = false
        })
    },
    removeFile(id) {
      const idx = this.issueFile.findIndex(item => item.id === id)
      this.issueFile.splice(idx, 1)
    },
    getStatusTagType(status) {
      switch (status) {
        case 'Active':
          return ''
        case 'Assigned':
          return 'danger'
        case 'Closed':
          return 'info'
        case 'Solved':
          return 'secondary'
        case 'Responded':
          return 'warning'
        case 'Finished':
          return 'success'
      }
    },
    getPriorityTagType(priority) {
      switch (priority) {
        case 'Immediate':
          return 'danger'
        case 'High':
          return 'warning'
        case 'Normal':
          return ''
        case 'Low':
          return 'info'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  background: #eeeeee;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
}

.flex-warp {
  flex-wrap: wrap;
}
</style>
