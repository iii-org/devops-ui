<template>
  <el-form
    ref="form"
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    :model="form"
    :rules="issueFormRules"
    label-position="top"
    :disabled="isButtonDisabled"
    :inline="isFromBoard ? true : false"
  >
    <el-form-item
      v-if="hasRelations"
      :label="$t('Project.Project')"
    >
      <el-select
        v-model="form.project_id"
        style="width: 100%"
        @change="updateSelect('project_id')"
      >
        <el-option
          v-for="(project, index) in allRelation"
          :key="index"
          :label="project.display"
          :value="project.id"
        >
          <div>
            {{ project.display }}
          </div>
          <div
            v-if="project.type === 'father'"
            class="round father"
          >
            {{ $t('general.Parent') }}
          </div>
          <div
            v-if="project.type === 'son'"
            class="round son"
          >
            {{ $t('general.Child') }}
          </div>
        </el-option>
      </el-select>
    </el-form-item>
    <Tags
      ref="tags"
      :issue-id="issueId"
      :loading.sync="isLoading"
      :form.sync="form"
      @update="$emit('update')"
    />
    <el-form-item prop="parent_id">
      <template slot="label">
        {{ $t('Issue.ParentIssue') }}
        <el-tag
          v-if="getTrackerFilter.name"
          icon="el-icon-s-operation"
        >
          <el-checkbox v-model="isRecommendRelation" />
          {{ $t('general.Filter') }}: {{ $t('Issue.' + getTrackerFilter.name) }}
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
        @change="updateSelect('parent_id')"
      >
        <el-option-group
          v-for="group in issueList"
          :key="group.name"
          :label="group.name"
        >
          <template v-for="item in group.options">
            <el-option
              v-if="(!form.relation_ids.includes(item.id)) && (item.id !== issueId)"
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
                    <Tracker
                      :name="$t(`Issue.${item.tracker.name}`)"
                      :type="item.tracker.name"
                    />
                    #{{ item.id }} - {{ item.name }}
                  </template>
                  <strong>
                    {{ $t('Issue.Description') }}:
                  </strong>
                  <p>
                    {{ item.description }}
                  </p>
                </el-card>
                <div slot="reference">
                  <span
                    class="truncate"
                    style="float: left; width: 250px;"
                  >
                    <strong>
                      #<span v-html="highLight(item.id.toString())" />
                    </strong> -
                    <span v-html="highLight(item.name)" />
                  </span>
                </div>
              </el-popover>
              <span
                style="float: right; color: #8492a6; font-size: 13px"
                v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
              />
            </el-option>
          </template>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item prop="relation_ids">
      <template slot="label">
        {{ $t('Issue.RelatedIssue') }}
        <span v-if="isIssueStatusChange('relation_ids')">
          <el-button
            class="action"
            type="success"
            size="mini"
            icon="el-icon-check"
            @click="updateRelationIssue"
          />
          <el-button
            class="action"
            type="danger"
            size="mini"
            icon="el-icon-close"
            @click="form.relation_ids = JSON.parse(JSON.stringify(originForm.relationIds))"
          />
        </span>
      </template>
      <el-select
        v-model="form.relation_ids"
        style="width: 100%"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        clearable
        filterable
        remote
        multiple
        :loading="issueLoading"
        :remote-method="getSearchRelationIssue"
        @focus="getSearchRelationIssue()"
      >
        <el-option-group
          v-for="group in relationIssueList"
          :key="group.name"
          :label="group.name"
        >
          <template v-for="item in group.options">
            <el-option
              v-if="(item.id !== form.parent_id) && (item.id !== issueId)"
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
                    <Tracker
                      :name="$t(`Issue.${item.tracker.name}`)"
                      :type="item.tracker.name"
                    />
                    #{{ item.id }} - {{ item.name }}
                  </template>
                  <strong>
                    {{ $t('Issue.Description') }}:
                  </strong>
                  <p>
                    {{ item.description }}
                  </p>
                </el-card>
                <div slot="reference">
                  <span
                    class="truncate"
                    style="float: left; width: 250px;"
                  >
                    <strong>
                      #<span v-html="highLight((item.id)? item.id.toString(): '')" />
                    </strong> -
                    <span v-html="highLight(item.name)" />
                  </span>
                </div>
              </el-popover>
              <span
                style="float: right; color: #8492a6; font-size: 13px"
                v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
              />
            </el-option>
          </template>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('Issue.fixed_version')"
      prop="fixed_version_id"
    >
      <el-select
        v-model="form.fixed_version_id"
        style="width: 100%"
        :placeholder="$t('RuleMsg.PleaseSelect')"
        clearable
        @change="updateSelect('fixed_version_id')"
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
    <el-form-item
      :label="$t('general.Status')"
      prop="status_id"
    >
      <el-select
        v-model="form.status_id"
        :disabled="isParentIssueClosed"
        style="width: 100%"
        @change="updateSelect('status_id')"
      >
        <el-option
          v-for="option in dynamicStatusList"
          :key="option.id"
          :label="$t('Issue.' + option.name)+((option.message) ? option.message : '')"
          :value="option.id"
          :disabled="option.disabled"
        >
          <Status
            :name="$t(`Issue.${option.name}`)"
            :type="option.name"
          />
          {{ option.message }}
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('Issue.tracker')"
      prop="tracker_id"
    >
      <el-select
        v-model="form.tracker_id"
        style="width: 100%"
        @change="updateSelect('tracker_id')"
      >
        <el-option
          v-for="option in tracker"
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
    <el-form-item
      :label="$t('Issue.assigned_to')"
      prop="assigned_to_id"
    >
      <el-select
        v-model="form.assigned_to_id"
        style="width: 100%"
        clearable
        :placeholder="$t('RuleMsg.PleaseSelect')"
        filterable
        @change="updateSelect('assigned_to_id')"
      >
        <el-option
          v-for="item in dynamicAssigneeList"
          :key="item.login"
          :class="item.class"
          :label="item.name+' ('+item.login+')'"
          :value="item.id"
        >
          {{ item.name }} ({{ item.login }})
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('Issue.priority')"
      prop="priority_id"
    >
      <el-select
        v-model="form.priority_id"
        :disabled="childrenIssue > 0"
        style="width: 100%"
        @change="updateSelect('priority_id')"
      >
        <el-option
          v-for="option in priority"
          :key="option.id"
          :label="$t('Issue.' + option.name)"
          :value="option.id"
        >
          <Priority
            :name="$t(`Issue.${option.name}`)"
            :type="option.name"
          />
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="estimated_hours">
      <template slot="label">
        {{ $t('Issue.Estimate') }}
        <span v-if="isIssueStatusChange('estimated_hours')">
          <el-button
            class="action"
            type="success"
            size="mini"
            icon="el-icon-check"
            @click="updateSelect('estimated_hours')"
          />
          <el-button
            class="action"
            type="danger"
            size="mini"
            icon="el-icon-close"
            @click="form.estimated_hours = originForm.estimatedHours"
          />
        </span>
      </template>
      <el-input-number
        v-model="form.estimated_hours"
        :min="0"
        :max="100"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item prop="done_ratio">
      <template slot="label">
        {{ $t('Issue.DoneRatio') }}
        <span v-if="isIssueStatusChange('done_ratio')">
          <el-button
            class="action"
            type="success"
            size="mini"
            icon="el-icon-check"
            @click="updateSelect('done_ratio')"
          />
          <el-button
            class="action"
            type="danger"
            size="mini"
            icon="el-icon-close"
            @click="form.done_ratio = originForm.doneRatio"
          />
        </span>
      </template>
      <el-input-number
        v-model="form.done_ratio"
        :min="0"
        :max="100"
        :disabled="childrenIssue > 0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item prop="start_date">
      <template slot="label">
        {{ $t('Issue.StartDate') }}
        <span v-if="isIssueStatusChange('start_date')">
          <el-button
            class="action"
            type="success"
            size="mini"
            icon="el-icon-check"
            @click="updateSelect('start_date')"
          />
          <el-button
            class="action"
            type="danger"
            size="mini"
            icon="el-icon-close"
            @click="form.start_date = originForm.startDate"
          />
        </span>
      </template>
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
    <el-form-item prop="due_date">
      <template slot="label">
        {{ $t('Issue.EndDate') }}
        <span v-if="isIssueStatusChange('due_date')">
          <el-button
            class="action"
            type="success"
            size="mini"
            icon="el-icon-check"
            @click="updateSelect('due_date')"
          />
          <el-button
            class="action"
            type="danger"
            size="mini"
            icon="el-icon-close"
            @click="form.due_date = originForm.endDate"
          />
        </span>
      </template>
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
import { getProjectAssignable, getProjectIssueList, getProjectVersion } from '@/api/projects'
import { getAllRelation, getHasRelation } from '@/api_v2/projects'
import { getCheckIssueClosable, putIssueRelation, updateIssue } from '@/api/issue'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import { Priority, Tracker, Status, Tags } from '@/components/Issue'

const relationIssueFilter = {
  Feature: 'Test Plan',
  'Test Plan': 'Feature',
  'Fail Management': 'Test Plan'
}

export default {
  name: 'IssueForm',
  components: {
    Status,
    Tracker,
    Priority,
    Tags
  },
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
    },
    issueProject: {
      type: Object,
      default: () => ({
        display: '',
        id: '',
        name: ''
      })
    },
    isFromBoard: {
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
      const foundTracker = this.forceTracker.find((tracker) => tracker.id === this.form.tracker_id)
      if (this.enableForceTracker && foundTracker && !value) {
        const tracker_name = this.$t(`Issue.${foundTracker.name}`)
        callback(new Error(this.$t('Notify.NoParentIssueWarning', { tracker_name })))
      } else if (value && this.issueId && value === this.issueId) {
        callback(new Error('The parent issue is the same issue.'))
      } else {
        callback()
      }
    }
    const validateAssignedTo = (rule, value, callback) => {
      if ((!value || value === '') && this.form.status_id >= 2) {
        this.form.status_id = 1
        callback(new Error('This Status need a assignee.'))
      } else {
        callback()
      }
    }
    return {
      issueFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        parent_id: [{ validator: validateParentId, trigger: 'blur' }],
        assigned_to_id: [{ validator: validateAssignedTo, trigger: 'blur' }],
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
            const start_date = new Date(startDate).setHours(0)
            return time.getTime() < new Date(start_date).getTime()
          }
        }
      },
      allRelation: [],
      hasRelations: false,
      originForm: {
        relationIds: [],
        estimatedHours: 0,
        doneRatio: 0,
        startDate: '',
        endDate: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'tracker',
      'status',
      'priority',
      'forceTracker',
      'enableForceTracker',
      'selectedProject', 
      'selectedProjectId'
    ]),
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
          this.getHasRelation()
        }
      }
    },
    'form.tags'() {
      if (this.form.project_id > 0) this.$refs.tags.getSearchTags()
    },
    'form.assigned_to_id'() {
      if (this.form.assigned_to_id && this.form.status_id === 1) this.form.status_id = 2
      if (!this.form.assigned_to_id) this.form.status_id = 1
    }
  },
  mounted() {
    if (this.form.project_id > 0) {
      this.onChangePId()
    }
    const unwatchForm = this.$watch('form', (value) => {
      this.originForm.relationIds = JSON.parse(JSON.stringify(value.relation_ids))
      this.originForm.estimatedHours = value.estimated_hours
      this.originForm.doneRatio = value.done_ratio
      this.originForm.startDate = value.start_date
      this.originForm.endDate = value.due_date
      unwatchForm()
    }, { deep: true })
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
    highLight(value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function(str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    },
    async getHasRelation() {
      await getHasRelation(this.form.project_id)
        .then((res) => {
          if (res.has_relations) {
            const selectedProject = this.allRelation.find((project) => project.id === this.form.project_id)
            if (selectedProject) delete selectedProject.type
            this.allRelation = []
            this.getAllRelation(selectedProject)
          }
          this.hasRelations = res.has_relations
        })
    },
    async getAllRelation(project) {
      const { display, id, name } = this.getIssueDetailSelectedProject(project)
      const selectedProject = { display, id, name }
      let allRelation = []
      await getAllRelation(this.form.project_id)
        .then((res) => {
          allRelation = res.data
          allRelation.unshift(selectedProject)
          this.allRelation = allRelation
        })
    },
    getIssueDetailSelectedProject(project) {
      if (project && this.hasSelectedProject(project)) return project
      return this.hasSelectedProject(this.issueProject)
        ? this.issueProject
        : this.selectedProject
    },
    hasSelectedProject(project) {
      return !(!project.id || !project.display || !project.name)
    },
    isIssueStatusChange(type) {
      switch (type) {
        case 'relation_ids':
          if (!this.form.relation_ids) return false
          if (this.form.relation_ids.length !== this.originForm.relationIds.length) return true
          return !this.originForm.relationIds.every((item) => this.form.relation_ids.includes(item))
        case 'estimated_hours':
          return this.form.estimated_hours !== this.originForm.estimatedHours
        case 'done_ratio':
          return this.form.done_ratio !== this.originForm.doneRatio
        case 'start_date':
          return this.form.start_date !== this.originForm.startDate
        case 'due_date':
          return this.form.due_date !== this.originForm.endDate
      }
    },
    async updateRelationIssue() {
      if (this.form.relation_ids) {
        const data = {
          issue_id: this.issueId,
          issue_to_ids: this.form.relation_ids
        }
        this.isLoading = true
        await putIssueRelation(data).then(() => {
          this.$emit('update')
        }).then(() => {
          this.originForm.relationIds = JSON.parse(JSON.stringify(this.form.relation_ids))
        })
        this.isLoading = false
      }
    },
    updateSelect(type) {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.isLoading = true
          const sendForm = new FormData()
          if (!this.form[type]) {
            if (type === 'estimated_hours' || type === 'done_ratio') this.form[type] = 0
            if (type === 'start_date' || type === 'due_date') this.form[type] = ''
          }
          sendForm.append(type, this.form[type])
          await updateIssue(this.issueId, sendForm).then(() => {
            this.$emit('update')
          }).then(() => {
            switch (type) {
              case 'estimated_hours' :
                this.originForm.estimatedHours = this.form.estimated_hours
                break
              case 'done_ratio' :
                this.originForm.doneRatio = this.form.done_ratio
                break
              case 'start_date' :
                this.originForm.startDate = this.form.start_date
                break
              case 'due_date' :
                this.originForm.endDate = this.form.due_date
                break
            }
          })
          this.isLoading = false
        }
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

.el-select-dropdown__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.el-button--success{
  color: #85ce61;
  border: 1px solid #989898;
  background: none;
  -webkit-transition: all .6s ease;
  transition: all .6s ease;
  &:hover {
    color: #fff;
    border: 1px solid #67c23a;
    background: #67c23a;
  }
}

.el-button--danger{
  color: #F56C6C;
  border: 1px solid #989898;
  background: none;
  -webkit-transition: all .6s ease;
  transition: all .6s ease;
  &:hover {
    color: #fff;
    border: 1px solid #F56C6C;
    background: #F56C6C;
  }
}

.action {
  margin: 0;
  &.el-button--mini {
    padding: 5px;
  }
}
</style>
