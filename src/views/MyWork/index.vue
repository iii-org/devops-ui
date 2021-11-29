<template>
  <div class="app-container">
    <ProjectListSelector
      ref="ProjectSelection"
      :project-id="project_id"
      :keep-selection="false"
      :clearable="true"
      @change="project_id = $event"
    >
      <template slot="button">
        <template v-if="project_id === null || project_id === ''">
          <el-button
            v-permission="['Administrator','Project Manager']"
            type="primary"
            icon="el-icon-plus"
            @click="handleAdding"
          >
            {{ $t('Project.AddProject') }}
          </el-button>
        </template>
        <el-button
          v-else
          id="btn-add-issue"
          slot="button"
          v-permission="['Administrator','Project Manager', 'Engineer']"
          type="success"
          icon="el-icon-plus"
          :disabled="project_id === -1"
          @click="handleQuickAddToggle"
        >
          {{ $t('Issue.AddIssue') }}
        </el-button>
      </template>
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form v-loading="listLoading">
          <template v-for="dimension in filterOptions">
            <el-form-item
              v-if="!isRequireProjectId(dimension.value)"
              :key="dimension.id"
            >
              <div slot="label">
                {{ $t('Issue.' + dimension.value) }}
                <el-tag
                  v-if="dimension.value ==='fixed_version'"
                  type="info"
                  class="flex-1"
                >
                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                </el-tag>
              </div>
              <el-select
                v-model="filterValue[dimension.value]"
                :placeholder="$t('Issue.Select' + dimension.placeholder)"
                filterable
                clearable
                @change="onChangeFilter"
              >
                <el-option
                  v-for="item in (dimension.value === 'status')
                    ? filterClosedStatus(getOptionsData(dimension.value)) : getOptionsData(dimension.value)"
                  :key="item.id"
                  :label="getSelectionLabel(item)"
                  :value="item.id"
                >
                  <component
                    :is="dimension.value"
                    v-if="dimension.tag"
                    :name="$t(`Issue.${item.name}`)"
                    :type="item.name"
                  />
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item
            :label="$t('Issue.DisplayClosedIssue')"
            class="checkbox"
          >
            <el-checkbox v-model="displayClosed" @change="onChangeFilter" />
          </el-form-item>
        </el-form>
        <el-button
          slot="reference"
          icon="el-icon-s-operation"
          type="text"
        > {{ displayFilterValue }}
          <em class="el-icon-arrow-down el-icon--right" />
        </el-button>
      </el-popover>
      <el-divider direction="vertical" />
      <el-input
        v-if="searchVisible"
        id="input-search"
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        style="width: 250px;"
        clearable
        @change="onChangeFilter"
        @blur="searchVisible = !searchVisible"
      />
      <el-button
        v-else
        type="text"
        icon="el-icon-search"
        @click="searchVisible=!searchVisible"
      >
        {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
      </el-button>
      <template v-if="isFilterChanged">
        <el-divider direction="vertical" />
        <el-button
          size="small"
          icon="el-icon-close"
          @click="cleanFilter"
        >
          {{ $t('Issue.CleanFilter') }}
        </el-button>
      </template>
    </ProjectListSelector>
    <el-divider />
    <QuickAddIssue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="project_id"
      :visible.sync="quickAddTopicDialogVisible"
      @add-issue="advancedAddIssue"
    />
    <el-row
      :gutter="10"
      class="mb-5"
    >
      <el-col
        v-for="card in dashboardCards"
        :key="card.id"
        :span="12"
        :md="6"
        class="dashboard-card"
      >
        <div
          class="item"
          :class="{'active': activeDashboard === card.id, [card.id]: card.id}"
          @click="activeDashboard = card.id"
        >
          <p class="font-bold m-1">
            <em
              v-if="activeDashboard === card.id"
              class="el-icon-caret-right"
            />{{ card.name }}
            <span class="count">{{ total[card.id] }}</span>
          </p>
        </div>
      </el-col>
    </el-row>
    <el-tabs v-model="activeDashboard">
      <el-tab-pane
        v-for="card in dashboardCards"
        :key="card.id"
        :name="card.id"
        :label="card.name"
      >
        <issue-list
          :ref="card.id"
          :project-id="project_id"
          :display-closed-props="displayClosed"
          :filter-value-props="filterValue"
          :from="card.id"
          :keyword-props="keyword"
          @total="updateTotalCount(card.id, $event)"
        />
      </el-tab-pane>
    </el-tabs>
    <CreateProjectDialog
      ref="createProjectDialog"
      v-permission="['Administrator', 'Project Manager']"
      @update="$router.push({name: 'project-list'})"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getProjectUserList, getProjectVersion } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'
import { QuickAddIssue } from '@/components/Issue'
import { CreateProjectDialog } from '@/views/Overview/ProjectList/components'
import { addIssue } from '@/api/issue'

export default {
  name: 'MyWork',
  components: {
    QuickAddIssue,
    ProjectListSelector,
    CreateProjectDialog,
    issueList: () => import('./components/issueList'),
    Tracker: () => import('@/components/Issue/Tracker'),
    Status: () => import('@/components/Issue/Status'),
    Priority: () => import('@/components/Issue/Priority')
  },
  data() {
    return {
      listLoading: false,
      quickAddTopicDialogVisible: false,
      fixed_version_closed: false,
      searchVisible: false,
      displayClosed: false,
      project_id: null,
      activeDashboard: 'assigned_to_id',
      fixed_version: [],
      assigned_to: [],
      filterOptions: Object.freeze([
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
        { id: 2, label: this.$t('Issue.FilterDimensions.tracker'), value: 'tracker', placeholder: 'Type', tag: true },
        { id: 3, label: this.$t('Issue.FilterDimensions.assigned_to'), value: 'assigned_to', placeholder: 'Member' },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version'
        },
        {
          id: 5,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true
        }
      ]),
      filterValue: {},
      originFilterValue: {},
      keyword: null,
      total: { assigned_to_id: '-', author_id: '-' }
    }
  },
  computed: {
    ...mapGetters([
      'selectedProjectId',
      'userRole',
      'userId',
      'tracker',
      'status',
      'priority',
      'projectList'
    ]),
    dashboardCards() {
      return [
        { id: 'assigned_to_id', name: this.$t('MyWork.AssignedToMe') },
        { id: 'author_id', name: this.$t('MyWork.ReportedIssue') }
      ]
    },
    displayFilterValue() {
      const result = []
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          const value = this[item].find((search) => search.id === this.filterValue[item])
          if (value) {
            result.push(this.getSelectionLabel(value))
          }
        }
      })
      return this.$t('general.Filter') + (result.length > 0 ? ': ' : '') + result.join(', ')
    },
    isFilterChanged() {
      return this.checkFilterValue('originFilterValue') || this.checkFilterValue('filterValue') || !!this.keyword
    }
  },
  watch: {
    async project_id(value) {
      if (value === '') this.project_id = 0
      value && value !== ''
        ? this.$refs['ProjectSelection'].onProjectChange(value) : this.quickAddTopicDialogVisible = false
      try {
        const storedFilterValue = await this.getIssueFilter()
        storedFilterValue['work_project_id'] = value
        await this.setIssueFilter(storedFilterValue)
      } catch (err) {
        console.error(err)
      } finally {
        await this.fetchInitData()
      }
      await this.loadProjectSelectionList(this.fixed_version_closed)
    },
    async activeDashboard(value) {
      const storedFilterValue = await this.getIssueFilter()
      storedFilterValue['work_active_dashboard'] = value
      await this.setIssueFilter(storedFilterValue)
    },
    fixed_version_closed(value) {
      this.loadProjectSelectionList(value)
    },
    filterValue: {
      deep: true,
      async handler(value) {
        const storedFilterValue = await this.getIssueFilter()
        if (value['tags'] && value['tags'].length <= 0) {
          this.$delete(value, 'tags')
        }
        storedFilterValue['work'] = value
        await this.setIssueFilter(storedFilterValue)
      }
    },
    async keyword(value) {
      const storedKeyword = await this.getKeyword()
      storedKeyword['work'] = value
      await this.setKeyword(storedKeyword)
    },
    async displayClosed(value) {
      const storedDisplayClosed = await this.getDisplayClosed()
      storedDisplayClosed['work'] = value
      await this.setDisplayClosed(storedDisplayClosed)
    }
  },
  async created() {
    await this.fetchInitData()
  },
  async mounted() {
    // await this.loadSelectionList()
    const storeListQuery = await this.getListQuery()
    this.dashboardCards.forEach((card) => {
      if (storeListQuery[`MyWork_${card.id}`]) {
        this.$set(this.$refs[card.id][0], 'listQuery', storeListQuery[`MyWork_${card.id}`])
        this.$set(this.$refs[card.id][0].pageInfo, 'offset', storeListQuery[`MyWork_${card.id}`].offset)
        this.$set(this.$refs[card.id][0].pageInfo, 'total', Infinity)
      } else {
        this.$set(this.$refs[card.id][0].listQuery, 'offset', 0)
        this.$set(this.$refs[card.id][0].listQuery, 'limit', 10)
        this.$set(this.$refs[card.id][0].pageInfo, 'offset', 0)
      }
      this.$refs[card.id][0].handleCurrentChange({
        init: this.$refs[card.id][0].listQuery.offset,
        limit: this.$refs[card.id][0].listQuery.limit
      })
    })
  },
  methods: {
    ...mapActions('projects', [
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
      'setIssueFilter',
      'setKeyword',
      'setDisplayClosed',
      'getListQuery'
    ]),
    async fetchInitData() {
      try {
        await this.getInitStoredData()
        await this.loadSelectionList()
      } catch (err) {
        console.error(err)
      } finally {
        await this.loadData()
      }
    },
    getOptionsData(option_name) {
      return this[option_name]
    },
    loadData() {
      this.$nextTick(() => {
        this.dashboardCards.forEach((card) => {
          this.$refs[card.id][0].initTableData()
        })
      })
    },
    async getInitStoredData() {
      const key = 'work'
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      this.filterValue = storedFilterValue[key] ? storedFilterValue[key] : {}
      this.project_id = storedFilterValue[`${key}_project_id`] ? storedFilterValue[`${key}_project_id`] : this.project_id
      this.activeDashboard = storedFilterValue[`${key}_active_dashboard`] || 'assigned_to_id'
      this.keyword = storedKeyword[key] ? storedKeyword[key] : null
      this.displayClosed = storedDisplayClosed[key] ? storedDisplayClosed[key] : false
    },
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed
      await Promise.all([this.getIssueFilter(), this.getKeyword(), this.getDisplayClosed()]).then(res => {
        const [filterValue, keyword, displayClosed] = res.map(item => item)
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed }
    },
    backToFirstPage() {
      this.dashboardCards.forEach((card) => {
        this.$refs[card.id][0].backToFirstPage()
      })
    },
    async loadSelectionList() {
      await this.loadProjectSelectionList(this.fixed_version_closed)
    },
    async loadProjectSelectionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      if (this.project_id && this.project_id !== '') {
        await Promise.all([getProjectVersion(this.project_id, params), getProjectUserList(this.project_id)]).then(
          (res) => {
            const [versionList, assigneeList] = res.map((item) => item.data)
            this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
            this.assigned_to = [{ name: this.$t('Issue.Unassigned'), id: 'null' }, ...assigneeList.user_list]
          }
        )
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
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => item.is_closed === false)
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
    },
    isRequireProjectId(name) {
      const column = ['fixed_version', 'assigned_to']
      return (
        column.includes(name) &&
        (!this.project_id || (name === 'assigned_to' && this.activeDashboard === 'assigned_to_id'))
      )
    },
    checkFilterValue(key) {
      const comparedKey = this.getComparedKey(key)
      for (const item of Object.keys(this[key])) {
        const checkFilterValue = this[key]
        if (checkFilterValue[item] === '') delete checkFilterValue[item]
        if (this[comparedKey][item] !== checkFilterValue[item]) return true
      }
    },
    getComparedKey(key) {
      return key === 'filterValue' ? 'originFilterValue' : 'filterValue'
    },
    updateTotalCount(card_id, value) {
      if (value === Infinity) {
        this.$set(this.total, card_id, '-')
      } else {
        this.$set(this.total, card_id, value)
      }
    },
    onChangeFilter() {
      this.dashboardCards.forEach((card) => {
        this.$set(this.$refs[card.id][0].listQuery, 'offset', 0)
        this.$set(this.$refs[card.id][0].pageInfo, 'offset', 0)
        this.$refs[card.id][0].handleCurrentChange({
          init: this.$refs[card.id][0].listQuery.offset,
          limit: this.$refs[card.id][0].listQuery.limit
        })
      })
    },
    handleQuickAddToggle() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    handleAdding() {
      this.$refs.createProjectDialog.showDialog = true
      this.$refs.createProjectDialog.refreshTemplate()
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then((res) => {
          // noinspection JSCheckFunctionSignatures
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.backToFirstPage()
          this.loadData()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.name = ''
          return res
        })
        .catch((error) => {
          return error
        })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs__header {
  display: none;
}

.dashboard-card {
  .item {
    @apply px-1.5 py-0.5 md:px-3 md:py-1 rounded-lg bg-gray-200 cursor-pointer hover:shadow-md;
    .divider {
      @apply border-white border-solid border-0 border-b-2;
    }

    .count {
      min-width: 30px;
      min-height: 30px;
      width: max-content;
      height: max-content;
      @apply inline-block m-0 p-1.5 bg-gray-500 rounded-full text-white text-center;
    }

    &.active {
      .count {
        @apply inline-block m-0 p-1.5 bg-danger rounded-full text-white text-center;
      }
    }
  }

  .assigned_to_id {
    @apply hover:bg-gradient-to-br hover:text-white hover:from-green-400 hover:to-blue-500;
    &.active {
      @apply bg-gradient-to-br text-white from-green-400 to-blue-500;
    }
  }

  .author_id {
    @apply hover:bg-gradient-to-br hover:text-white hover:from-pink-400 hover:to-indigo-500;
    &.active {
      @apply bg-gradient-to-br text-white from-pink-400 to-indigo-500;
    }
  }
}
</style>
