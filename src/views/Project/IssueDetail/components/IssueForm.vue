<template>
  <el-form
    ref="form"
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    :model="form"
    :rules="issueFormRules"
    label-position="top"
    :disabled="isButtonDisabled"
  >
    <el-form-item v-if="hasRelations" :label="$t('Project.Project')">
      <el-select v-model="form.project_id" style="width: 100%">
        <el-option
          v-for="project in allRelation"
          :key="project.id"
          :label="project.display"
          :value="project.id"
        >
          <div>{{ project.display }}</div>
          <div v-if="project.type === 'father'" class="round father">
            {{ $t('general.Parent') }}
          </div>
          <div v-if="project.type === 'son'" class="round son">
            {{ $t('general.Child') }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <Tags ref="tags" :form.sync="form" />
    <el-form-item prop="parent_id">
      <template slot="label">
        {{ $t('Issue.ParentIssue') }}
        <el-tag v-if="getTrackerFilter.name" icon="el-icon-s-operation">
          <el-checkbox v-model="isRecommendRelation" /> &nbsp;{{ $t('general.Filter') }}:
          {{ $t('Issue.' + getTrackerFilter.name) }}
        </el-tag>
      </template>
      <el-select
        v-model="form.parent_id"
        style="width: 100%"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        clearable
        filterable
        remote
        :remote-method="getSearchIssue"
        :loading="issueLoading"
        @focus="getSearchIssue()"
      >
        <el-option-group
          v-for="group in issueList"
          :key="group.name"
          :label="group.name"
        >
          <template v-for="item in group.options">
            <el-option
              v-if="!form.relation_ids.includes(item.id)&&item.id!==issueId"
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
                    <Tracker :name="$t(`Issue.${item.tracker.name}`)" :type="item.tracker.name" />
                    #{{ item.id }} - {{ item.name }}
                  </template>
                  <strong>{{ $t('Issue.Description') }}:</strong>
                  <p>{{ item.description }}</p>
                </el-card>
                <div slot="reference">
                  <span
                    style="float: left; width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
                  >
                    <strong>#<span v-html="highLight(item.id.toString())" /></strong> -
                    <span v-html="highLight(item.name)" />
                  </span>
                  <span style="float: right; color: #8492a6; font-size: 13px"
                        v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
                  />
                </div>
              </el-popover>
            </el-option>
          </template>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.RelatedIssue')" prop="relation_ids">
      <el-select
        v-model="form.relation_ids"
        style="width: 100%"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        clearable
        filterable
        remote
        multiple
        :remote-method="getSearchRelationIssue"
        :loading="issueLoading"
        @focus="getSearchRelationIssue()"
      >
        <el-option-group
          v-for="group in relationIssueList"
          :key="group.name"
          :label="group.name"
        >
          <template v-for="item in group.options">
            <el-option
              v-if="item.id !== form.parent_id&&item.id!==issueId"
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
                    <Tracker :name="$t(`Issue.${item.tracker.name}`)" :type="item.tracker.name" />
                    #{{ item.id }} - {{ item.name }}
                  </template>
                  <strong>{{ $t('Issue.Description') }}:</strong>
                  <p>{{ item.description }}</p>
                </el-card>
                <div slot="reference">
                  <span
                    style="float: left; width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
                  >
                    <strong>#<span v-html="highLight((item.id)? item.id.toString(): '')" /></strong> -
                    <span v-html="highLight(item.name)" />
                  </span>
                  <span style="float: right; color: #8492a6; font-size: 13px"
                        v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
                  />
                </div>
              </el-popover>
            </el-option>
          </template>
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
          <Status
            :name="$t(`Issue.${option.name}`)" :type="option.name"
          />
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
          <Tracker :name="$t(`Issue.${option.name}`)" :type="option.name" />
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
          <Priority :name="$t(`Issue.${option.name}`)" :type="option.name" />
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('Issue.Estimate')" prop="estimated_hours">
      <el-input-number v-model="form.estimated_hours" :min="0" :max="100" style="width: 100%" />
    </el-form-item>
    <el-form-item :label="$t('Issue.DoneRatio')" prop="done_ratio">
      <el-input-number v-model="form.done_ratio" :min="0" :max="100" :disabled="childrenIssue > 0"
                       style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('Issue.StartDate')" prop="start_date">
      <el-date-picker
        v-model="form.start_date"
        type="date"
        value-format="yyyy-MM-dd"
        style="width: 100%"
        :disabled="childrenIssue > 0"
        :placeholder="$t('RuleMsg.PleaseSelect')"
        @change="checkDueDate(form.start_date)"
      />
    </el-form-item>
    <el-form-item :label="$t('Issue.EndDate')" prop="due_date">
      <el-date-picker
        v-model="form.due_date"
        type="date"
        value-format="yyyy-MM-dd"
        style="width: 100%"
        :disabled="childrenIssue > 0"
        :placeholder="$t('RuleMsg.PleaseSelect')"
        :picker-options="pickerOptions(form.start_date)"
        @change="clearDueDate"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { getCheckIssueClosable } from '@/api/issue'
import { getProjectAssignable, getProjectIssueList, getProjectVersion } from '@/api/projects'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import Tags from '@/components/Issue/Tags'
import { getAllRelation, getHasRelation } from '@/api_v2/projects'

const relationIssueFilter = { Feature: 'Test Plan', 'Test Plan': 'Feature', 'Fail Management': 'Test Plan' }

export default {
  name: 'IssueForm',
  components: { Status, Tracker, Priority, Tags },
  props: {
    issueId: {
      type: Number,
      default: 0
    },
    form: {
      type: Object,
      default: () => ({})
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
    },
    isButtonDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateParentId = (rule, value, callback) => {
      // const changeRequest = this.tracker.find((item) => (item.name === 'Change Request'))
      // if (this.form.tracker_id === changeRequest.id && !value) {
      //   this.$message({
      //     type: 'warning',
      //     message: '尚未設定本變更議題之原由議題單(父議題），請先行設定後再存檔'
      //   })
      // } else
      if (value && this.issueId && value === this.issueId) {
        callback(new Error('The parent issue is the same issue.'))
      } else {
        callback()
      }
    }
    return {
      issueFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        parent_id: [{ validator: validateParentId, trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        status_id: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        priority_id: [{ required: true, message: 'Please select priority', trigger: 'blur' }]
      },
      issueQuery: null,
      issueLoading: false,
      issueList: [],
      relationIssueList: [],
      assigned_to: [],
      fixed_version: [],
      relativeIssueList: [],
      isLoading: false,
      isRecommendRelation: false,
      checkClosable: false,
      dynamicStatusList: [],
      cancelToken: null,
      pickerOptions(startDate) {
        return {
          disabledDate(time) {
            return time.getTime() < new Date(startDate).getTime()
          }
        }
      },
      allRelation: [],
      hasRelations: false
    }
  },
  computed: {
    ...mapGetters(['userId', 'tracker', 'status', 'priority', 'selectedProject', 'selectedProjectId']),
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
    },
    originalRelationIssue() {
      if (Object.keys(this.relations).length <= 0) return {}
      return { name: this.$t('Issue.OriginalSetting'), options: this.relations }
    },
    getTrackerFilter() {
      if (this.tracker.length < 0) return { id: null, name: null }
      if (!this.form.tracker_id) return this.getObjectByName(this.tracker, 'Test Plan')
      if (!this.getObjectById(this.tracker, this.form.tracker_id)) return { id: null, name: null }
      const getFilter = this.getObjectByName(this.tracker, relationIssueFilter[this.getObjectById(this.tracker, this.form.tracker_id).name])
      if (!getFilter) {
        return { id: null, name: null }
      }
      return getFilter
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
    'form.project_id': {
      handler(newPId, oldPId) {
        if (newPId > 0) {
          this.onChangePId()
        }
      }
    },
    'form.tags'() {
      if (this.form.project_id > 0) this.$refs.tags.getSearchTags()
    },
    'form.assigned_to_id'() {
      if (this.form.assigned_to_id && this.form.status_id === 1) this.form.status_id = 2
      if (!this.form.assigned_to_id) this.form.status_id = 1
    },
    selectedProjectId: {
      handler(val) {
        this.getHasRelation()
      },
      immediate: true
    }
  },
  mounted() {
    if (this.form.project_id > 0) {
      this.onChangePId()
    }
  },
  methods: {
    async fetchData(pId) {
      this.isLoading = true
      const projectId = pId || this.form.project_id
      if (projectId) {
        await Promise.all([
          getProjectAssignable(projectId)
        ]).then(res => {
          this.getAssignedTo(res)
        })
        await this.loadVersionList(pId)
      }
      if (this.issueId > 0) {
        await this.getClosable()
      } else {
        this.$set(this.$data, 'dynamicStatusList', this.status)
      }
      this.isLoading = false
    },
    getAssignedTo(res) {
      const [assigned_to] = res.map(item => item.data)
      this.assigned_to = [
        {
          name: this.$t('Issue.me'),
          login: '-Me-',
          id: this.userId,
          class: 'bg-yellow-100'
        }, ...assigned_to.user_list
      ]
    },
    async loadVersionList(pId) {
      const projectId = pId || this.form.project_id
      const params = { status: 'open,locked' }
      if (this.form.fixed_version_id) {
        params['force_id'] = this.form.fixed_version_id
      }
      const versionList = await getProjectVersion(projectId, params)
      this.fixed_version = versionList.data.versions
    },
    async getClosable() {
      let result = true
      try {
        if (this.issueId) {
          const checkClosable = await getCheckIssueClosable(this.issueId)
          result = checkClosable.data
        }
      } catch (e) {
        // log
      }
      await this.getDynamicStatusList(result)
    },
    clearDueDate(val) {
      this.$nextTick(() => {
        if (val === null) this.form.due_date = ''
      })
    },
    checkDueDate(startDate) {
      if (new Date(startDate).getTime() >= new Date(this.form.due_date)) this.form.due_date = ''
    },
    getDynamicStatusList(value) {
      const deepStatus = cloneDeep(this.status)
      this.$set(this.$data, 'dynamicStatusList', deepStatus.map((item) => {
        if ((!value) && item.is_closed) {
          item.disabled = true
          item.message = '(' + this.$t('Issue.ChildrenNotClosed') + ')'
        }
        return item
      }))
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    getSearchIssue(query) {
      const issueKey = 'parent'
      this.getIssue(query, issueKey)
    },
    getSearchRelationIssue(query) {
      const issueKey = 'relation'
      this.getIssue(query, issueKey)
    },
    async getIssue(query, issue_key) {
      const params = this.getSearchParams(query, issue_key)
      const cancelToken = this.checkToken()
      await getProjectIssueList(this.form.project_id, params, { cancelToken })
        .then(res => {
          switch (issue_key) {
            case 'parent':
              this.issueList = this.getListLabels(res, issue_key)
              break
            case 'relation':
              this.relationIssueList = this.getListLabels(res, issue_key)
          }
        })
      this.issueLoading = false
      this.cancelToken = null
    },
    getSearchParams(query, issue_key) {
      const params = {
        selection: true,
        status_id: 'open'
      }
      if (query !== '' && query) {
        params['search'] = query
        this.issueQuery = query
        this.issueLoading = true
      } else {
        params['offset'] = 0
        params['limit'] = 5
        this.issueQuery = null
      }
      switch (issue_key) {
        case 'parent':
          // this.issueList = []
          if (this.isRecommendRelation && this.getTrackerFilter.id) {
            params['tracker_id'] = this.getTrackerFilter.id
          }
          break
        case 'relation':
          // if (this.isRecommendRelation && this.getTrackerFilter.id) {
          //   params['tracker_id'] = this.getTrackerFilter.id
          // }
          this.relationIssueList = []
      }
      return params
    },
    getListLabels(res, issue_key) {
      let queryList = res.data
      let key = 'Issue.Result'
      let issueList
      if (!this.issueQuery) {
        if (queryList && queryList.hasOwnProperty('issue_list')) {
          queryList = res.data.issue_list
        } else {
          queryList = []
        }
        key = 'Issue.LastResult'
      }
      switch (issue_key) {
        case 'parent':
          issueList = [this.originalParentIssue, { name: this.$t(key), options: queryList }]
          break
        case 'relation':
          issueList = [this.originalRelationIssue, { name: this.$t(key), options: queryList }]
      }
      return issueList
    },
    checkToken() {
      if (this.cancelToken) this.cancelToken.cancel()
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      return CancelToken.token
    },
    getObjectById(list, id) {
      return list.find((item) => (item.id === id))
    },
    getObjectByName(list, name) {
      return list.find((item) => (item.name === name))
    },
    highLight: function(value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function(str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    },
    async getHasRelation() {
      await getHasRelation(this.selectedProject.id)
        .then((res) => {
          if (res.has_relations) {
            this.getAllRelation()
          }
          this.hasRelations = res.has_relations
        })
    },
    async getAllRelation() {
      const { display, id, name } = this.selectedProject
      const selectedProject = {
        display, id, name
      }
      let allRelation = []
      await getAllRelation(this.selectedProject.id)
        .then((res) => {
          allRelation = res.data
          allRelation.unshift(selectedProject)
          this.allRelation = allRelation
        })
    },
    onChangePId() {
      this.fetchData()
      this.$refs.tags.getSearchTags()
      this.getSearchIssue()
      this.getSearchRelationIssue()
    }
  }
}
</script>

<style lang="scss" scoped>
/* noinspection CssUnusedSymbol */
>>> .el-form-item {
  margin-bottom: 10px;
}
.round {
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  text-align: center;
  font-size: 8px;
  &.father {
    background-color: #f56c6c;
  }
  &.son {
    background-color: #409eff;
  }
}
</style>
