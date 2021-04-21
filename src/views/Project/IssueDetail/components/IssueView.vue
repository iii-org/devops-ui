<template>
  <el-row>
    <h2>Planning</h2>
    <el-divider />
    <el-row :gutter="10" type="flex" justify="left" class="flex-warp">
      <el-col :span="24">
        <el-col :span="6">
          <b>{{ $t('Issue.Estimate') }}</b>
        </el-col>
        <el-col :span="18">
          {{ form.estimated_hours }}
        </el-col>
      </el-col>
      <el-col :span="24">
        <el-col :span="6">
          <b>{{ $t('Issue.DoneRatio') }}</b>
        </el-col>
        <el-col :span="18">
          {{ form.done_ratio }}
        </el-col>
      </el-col>
      <el-col :span="24">
        <el-col :span="6">
          <b>{{ $t('Issue.StartDate') }}</b>
        </el-col>
        <el-col :span="18">
          {{ form.start_date }}
        </el-col>
      </el-col>
      <el-col :span="24">
        <el-col :span="6">
          <b>{{ $t('Issue.EndDate') }}</b>
        </el-col>
        <el-col :span="18">
          {{ form.due_date }}
        </el-col>
      </el-col>
    </el-row>
    <h2>Description</h2>
    <el-divider />
    <el-row :gutter="10" type="flex" justify="left">
      <el-col>
        {{ form.description }}
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssueStatus, getIssueTracker, getIssuePriority } from '@/api/issue'
import { getProjectAssignable, getProjectVersion, getProjectIssueList, getProjectIssueListByTree } from '@/api/projects'

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
    }
  }
}
</script>

<style lang="scss" scoped>
.info{
  background: #eeeeee;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  padding:15px;
  margin: 10px 0;
}
.flex-warp {
  flex-wrap: wrap;
}
</style>
