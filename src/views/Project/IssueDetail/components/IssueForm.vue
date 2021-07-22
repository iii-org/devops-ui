<template>
  <el-form
    ref="form"
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    :model="form"
    :rules="issueFormRules"
    label-position="top"
  >
    <el-form-item :label="$t('Issue.ParentIssue')" prop="parent_id">
      <el-select
        v-model="form.parent_id"
        style="width: 100%"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        clearable
        filterable
        remote
        :remote-method="getSearchIssue"
        :loading="issueLoading"
      >
        <el-option-group
          v-for="group in issueList"
          :key="group.name"
          :label="group.name"
        >
          <el-option
            v-for="item in group.options"
            :key="item.id"
            :label="'#' + item.id +' - '+item.name"
            :value="item.id"
          >
            <el-popover
              placement="left"
              width="250"
              trigger="hover"
            >
              <el-card>
                <template slot="header">
                  <tracker :name="item.tracker.name" />
                  #{{ item.id }} - {{ item.name }}
                </template>
                <b>{{ $t('Issue.Description') }}:</b>
                <p>{{ item.description }}</p>
              </el-card>
              <div slot="reference">
                <span
                  style="float: left; width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
                >
                  <b>#<span v-html="highLight(item.id.toString())" /></b> -
                  <span v-html="highLight(item.name)" />
                </span>
                <span style="float: right; color: #8492a6; font-size: 13px"
                      v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
                />
              </div>
            </el-popover>
          </el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.fixed_version')" prop="fixed_version_id">
      <el-select
        v-model="form.fixed_version_id"
        style="width: 100%"
        :placeholder="$t('RuleMsg.PleaseSelect')"
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
    <el-form-item :label="$t('general.Status')" prop="status_id">
      <el-select v-model="form.status_id" :disabled="isParentIssueClosed" style="width: 100%">
        <el-option
          v-for="option in dynamicStatusList"
          :key="option.id"
          :label="$t('Issue.' + option.name)+((option.message) ? option.message : '')"
          :value="option.id"
          :disabled="option.disabled"
        >
          <status :name="option.name" />
          {{ option.message }}
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.tracker')" prop="tracker_id">
      <el-select v-model="form.tracker_id" style="width: 100%">
        <el-option
          v-for="option in tracker"
          :key="option.id"
          :label="$t('Issue.' + option.name)"
          :value="option.id"
        >
          <tracker :name="option.name" />
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.assigned_to')" prop="assigned_to_id">
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
                   :label="item.name+' ('+item.login+')'"
                   :value="item.id"
        >
          {{ item.name }} ({{ item.login }})
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.priority')" prop="priority_id">
      <el-select v-model="form.priority_id" :disabled="childrenIssue > 0" style="width: 100%">
        <el-option
          v-for="option in priority"
          :key="option.id"
          :label="$t('Issue.' + option.name)"
          :value="option.id"
        >
          <priority :name="option.name" />
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.Estimate')" prop="estimated_hours">
      <el-input-number v-model="form.estimated_hours" :min="0" :max="100" style="width: 100%" />
    </el-form-item>
    <el-form-item :label="$t('Issue.DoneRatio')" prop="done_ratio">
      <el-input-number v-model="form.done_ratio" :min="0" :max="100" :disabled="childrenIssue > 0" style="width: 100%" />
    </el-form-item>
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
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssueStatus, getIssueTracker, getIssuePriority, getCheckIssueClosable } from '@/api/issue'
import { getProjectAssignable, getProjectIssueList, getProjectVersion } from '@/api/projects'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'
import axios from 'axios'

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
    parent: {
      type: Object,
      default: () => ({})
    },
    childrenIssue: {
      type: Number,
      default: 0
    },
    relations: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    const validateParentId = (rule, value, callback) => {
      if (value === this.issueId) {
        callback(new Error('The parent issue is the same issue.'))
      } else {
        callback()
      }
    }
    return {
      issueFormRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        parent_id: [{ validator: validateParentId, trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
      },
      issueQuery: null,
      issueLoading: false,
      issueList: [],
      assigned_to: [],
      fixed_version: [],
      tracker: [],
      status: [],
      priority: [],

      relativeIssueList: [],
      isLoading: false,
      checkClosable: false,
      dynamicStatusList: [],

      cancelToken: null,

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
    ...mapGetters(['userId']),
    isParentIssueClosed() {
      if (Object.keys(this.parent).length <= 0) return false
      return this.parent.status.name === 'Closed'
    },
    dynamicAssigneeList() {
      const hasInactiveAssignee =
        this.form.assigned_to_id !== '' &&
        this.assigned_to.findIndex(item => item.id === this.form.assigned_to_id) === -1
      if (hasInactiveAssignee) {
        const inactiveAssignee = {
          name: `Disabled User (${this.form.assigned_to_id})`,
          id: this.form.assigned_to_id
        }
        const result = Object.assign([], this.assigned_to)
        result.push(inactiveAssignee)
        return result
      } else {
        return this.assigned_to
      }
    },
    originalParentIssue() {
      if (Object.keys(this.parent).length <= 0) return {}
      return { name: this.$t('Issue.OriginalSetting'), options: [this.parent] }
    }
  },
  watch: {
    issueId(value) {
      if (value > 0) {
        this.getClosable()
      }
    },
    parent: {
      deep: true,
      handler() {
        this.getSearchIssue()
      }
    },
    'form.parent_id'(value) {
      if (!value && !this.issueQuery) {
        this.getSearchIssue()
      }
    },
    'form.project_id'() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
    if (this.form.project_id > 0) {
      this.getSearchIssue()
    }
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      if (this.form.project_id) {
        await Promise.all([
          getProjectAssignable(this.form.project_id),
          getIssueTracker(),
          getIssueStatus(),
          getIssuePriority()
        ]).then(res => {
          const [assigned_to, tracker, status, priority] = res.map(
            item => item.data
          )

          this.assigned_to = [
            {
              name: this.$t('Issue.me'),
              login: '-Me-',
              id: this.userId,
              class: 'bg-yellow-100'
            }, ...assigned_to.user_list
          ]
          this.status = status
          this.tracker = tracker
          this.priority = priority
        })
        await this.loadVersionList()
      }
      if (this.issueId > 0) {
        await this.getClosable()
      }
      this.isLoading = false
    },
    async loadVersionList() {
      const params = { status: 'open,locked' }
      if (this.form.fixed_version_id) {
        params['force_id'] = this.form.fixed_version_id
      }
      const versionList = await getProjectVersion(this.form.project_id, params)
      this.fixed_version = versionList.data.versions
    },
    async getClosable() {
      await getCheckIssueClosable(this.issueId)
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
      this.dynamicStatusList = this.status.map((item) => {
        if (!_this.checkClosable && item.is_closed === true) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
        }
        return item
      })
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    async getSearchIssue(query) {
      const params = {
        selection: true,
        status_id: 'open'
      }
      this.issueList = []
      if (query !== '' && query) {
        params['search'] = query
        this.issueQuery = query
        this.issueLoading = true
      } else {
        params['offset'] = 0
        params['limit'] = 5
        this.issueQuery = null
      }
      if (this.cancelToken) {
        this.cancelToken.cancel()
      }
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      const res = await getProjectIssueList(this.form.project_id, params, { cancelToken: CancelToken.token })
      let queryList = res.data
      let key = 'Issue.Result'
      if (!this.issueQuery) {
        if (queryList && queryList.hasOwnProperty('issue_list')) {
          queryList = res.data.issue_list
        } else {
          queryList = []
        }
        key = 'Issue.LastResult'
      }
      this.issueList = [this.originalParentIssue, { name: this.$t(key), options: queryList }]
      this.issueLoading = false
      this.cancelToken = null
    },
    highLight: function (value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function (str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    }
  }
}
</script>

<style scoped>
/* noinspection CssUnusedSymbol */
>>> .el-form-item {
  margin-bottom: 10px;
}
</style>
