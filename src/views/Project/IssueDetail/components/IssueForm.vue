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
        <el-form-item :label="$t('Issue.ParentIssue')" prop="parent_id">
          <el-select
            v-model="form.parent_id"
            style="width: 100%"
            :placeholder="$t('RuleMsg.PleaseSelect')"
            clearable
            filterable
            remote
            :remote-method="getSearchIssue"
            :loading="issueLoading"
          >
            <el-option
              v-for="item in issueList"
              :key="item.id"
              :label="'#' + item.id +' - '+item.name"
              :value="item.id"
            >
              <span style="float: left; width:200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ">
                <b>#<span v-html="highLight(item.id.toString())" /></b> -
                <span v-html="highLight(item.name)" />
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px" v-html="highLight(String(item.assigned_to.name))" />
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
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
              :label="$t('Issue.' + option.label)+((option.message) ? option.message : '')"
              :value="option.value"
              :disabled="option.disabled"
            >
              <status :name="option.label" />
              {{ option.message }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('general.Type')" prop="tracker_id">
          <el-select v-model="form.tracker_id" style="width: 100%">
            <el-option
              v-for="option in typeList"
              :key="option.value"
              :label="$t('Issue.' + option.label)"
              :value="option.value"
            >
              <tracker :name="option.label" />
            </el-option>
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
            filterable
          >
            <el-option v-for="item in dynamicAssigneeList"
                       :key="item.login"
                       :class="item.class"
                       :label="item.label+' ('+item.login+')'"
                       :value="item.value"
            >
              {{ item.label }} ({{ item.login }})
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col>
        <el-form-item :label="$t('Issue.Priority')" prop="priority_id">
          <el-select v-model="form.priority_id" :disabled="childrenIssue > 0" style="width: 100%">
            <el-option
              v-for="option in priorityList"
              :key="option.value"
              :label="$t('Issue.' + option.label)"
              :value="option.value"
            >
              <priority :name="option.label" />
            </el-option>
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
import { getIssueStatus, getIssueTracker, getIssuePriority, checkIssueClosable } from '@/api/issue'
import { getProjectAssignable, getProjectIssueList, getProjectVersion } from '@/api/projects'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'

export default {
  name: 'IssueForm',
  components: { Status, Tracker, Priority },
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
    parentStatus: {
      type: String,
      default: null
    },
    childrenIssue: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      issueFormRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
      },
      issueQuery: '',
      issueLoading: false,
      issueList: [],
      assigneeList: [],
      versionList: [],
      typeList: [],
      statusList: [],
      priorityList: [],

      parentId: null,
      relativeIssueList: [],
      isLoading: false,
      checkClosable: false,
      dynamicStatusList: [],

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
    ...mapGetters(['selectedProjectId', 'userId']),
    isParentIssueClosed() {
      return this.parentStatus === 'Closed'
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
  watch: {
    issueId(value) {
      if (value > 0) {
        this.getClosable()
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
        getIssuePriority()
      ]).then(res => {
        const [assigneeList, versionList, typeList, statusList, priorityList] = res.map(
          item => item.data
        )

        this.assigneeList = [
          {
            label: this.$t('Issue.me'),
            login: 'me',
            value: this.userId,
            class: 'bg-yellow-100'
          }, ...assigneeList.user_list.map(item => ({
            label: item.name,
            login: item.login,
            value: item.id
          }))
        ]
        this.versionList = versionList.versions.map(item => ({
          label: item.name,
          value: item.id,
          status: item.status
        }))
        this.statusList = statusList.map(item => ({ label: item.name, value: item.id }))
        this.typeList = this.issueTypeList = typeList.map(item => ({ label: item.name, value: item.id }))
        this.priorityList = priorityList.map(item => ({ label: item.name, value: item.id }))
      })
      this.isLoading = false
    },
    async getClosable() {
      await checkIssueClosable(this.issueId)
        .then((res) => {
          this.checkClosable = res.data
        })
      await this.getDynamicStatusList()
    },
    clearDueDate(val) {
      this.$nextTick(() => {
        if (val === null) this.form.due_date = ''
      })
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    },
    getDynamicStatusList() {
      const _this = this
      this.dynamicStatusList = this.statusList.map((item) => {
        if (!_this.checkClosable && item.label === 'Closed') {
          item.disabled = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
        }
        return item
      })
    },
    getSearchIssue(query) {
      if (query !== '') {
        this.issueQuery = query
        this.issueLoading = true
        this.issueList = []
        getProjectIssueList(this.selectedProjectId, { search: query, selection: true })
          .then((res) => {
            this.issueList = res.data
          })
          .finally(() => {
            this.issueLoading = false
          })
      } else {
        this.issueQuery = ''
        this.issueLoading = false
      }
    },
    highLight: function(value) {
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function(str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    }
  }
}
</script>
