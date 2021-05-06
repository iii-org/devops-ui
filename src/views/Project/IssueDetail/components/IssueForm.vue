<template>
  <el-form
    ref="form"
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    :model="form"
    :rules="issueFormRules"
    label-position="right"
    label-width="20%"
  >
    <el-row :gutter="10">
      <el-col>
        <el-form-item :label="$t('Version.Version')" prop="fixed_version_id">
          <el-select
            v-model="form.fixed_version_id"
            style="width: 100%"
            :placeholder="$t('RuleMsg.PleaseSelect')"
            clearable
          >
            <el-option
              v-for="item in versionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.status !== 'open'"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('general.Status')" prop="status_id">
          <el-select v-model="form.status_id" :disabled="isParentIssueClosed" style="width: 100%">
            <el-option
              v-for="option in dynamicStatusList"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('general.Type')" prop="tracker_id">
          <el-select v-model="form.tracker_id" style="width: 100%">
            <el-option v-for="option in typeList" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.Assignee')" prop="assigned_to_id">
          <el-select
            v-model="form.assigned_to_id"
            style="width: 100%"
            clearable
            :placeholder="$t('RuleMsg.PleaseSelect')"
          >
            <el-option v-for="item in dynamicAssigneeList" :key="item.value" :label="item.label" :value="item.value">
              {{ item.label }}（{{ item.login }}）
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
          <el-select v-model="form.priority_id" :disabled="childrenIssueList.length > 0" style="width: 100%">
            <el-option v-for="option in priorityList" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.Estimate')" prop="estimated_hours">
          <el-input-number v-model="form.estimated_hours" :min="0" :max="100" style="width: 100%" />
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.DoneRatio')" prop="done_ratio">
          <el-input-number v-model="form.done_ratio" :min="0" :max="100" style="width: 100%" />
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.StartDate')" prop="start_date">
          <el-date-picker
            v-model="form.start_date"
            type="date"
            value-format="yyyy-MM-dd"
            :clearable="false"
            style="width: 100%"
            @change="checkDueDate(form.start_date)"
          />
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.EndDate')" prop="due_date">
          <el-date-picker
            v-model="form.due_date"
            type="date"
            value-format="yyyy-MM-dd"
            style="width: 100%"
            :placeholder="$t('RuleMsg.PleaseSelect')"
            :picker-options="pickerOptions(form.start_date)"
            @change="clearDueDate"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
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
      default: () => {}
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
      return Object.keys(this.parentIssue).length > 0 && this.parentIssue.status.name === 'Closed'
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
      return !this.childrenIssueList.length || this.childrenIssueList.every(item => item.status.name === 'Closed')
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