<template>
  <div class="app-container">
    <ProjectListSelector :keep-selection="false" :clearable="true" @change="project_id=$event">
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form v-loading="listLoading">
          <template v-for="dimension in filterOptions">
            <el-form-item v-if="!isRequireProjectId(dimension.value)" :key="dimension.id">
              <div slot="label">
                {{ $t('Issue.' + dimension.value) }}
                <el-tag v-if="dimension.value==='fixed_version'" type="info" class="flex-1">
                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                </el-tag>
              </div>
              <el-select
                v-model="filterValue[dimension.value]"
                :placeholder="$t('Issue.Select'+dimension.placeholder)"
                filterable
                clearable
              >
                <el-option
                  v-for="item in (dimension.value==='status')? filterClosedStatus($data[dimension.value]):$data[dimension.value]"
                  :key="item.id"
                  :label="getSelectionLabel(item)"
                  :value="item.id"
                >
                  <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">
            <el-checkbox v-model="displayClosed" />
          </el-form-item>
        </el-form>
        <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}
          <i class="el-icon-arrow-down el-icon--right" /></el-button>
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
        @blur="searchVisible=!searchVisible"
      />
      <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">
        {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
      </el-button>
      <template v-if="isFilterChanged">
        <el-divider direction="vertical" />
        <el-button size="small" icon="el-icon-close" @click="cleanFilter">
          {{ $t('Issue.CleanFilter') }}
        </el-button>
      </template>
    </ProjectListSelector>
    <el-divider />
    <el-row :gutter="10" class="mb-5">
      <el-col v-for="card in dashboardCards" :key="card.id" :span="12" :md="6" class="dashboard-card">
        <div class="item"
             :class="{'active': activeDashboard===card.id, [card.id]:card.id}"
             @click="activeDashboard=card.id"
        >
          <h3 class="pb-2" :class="{'divider':activeDashboard===card.id}">
            <i v-if="activeDashboard===card.id" class="el-icon-caret-right" />{{ card.name }}</h3>
          <p class="m-0 mb-2 text-right">{{ total[card.id] }}</p>
        </div>
      </el-col>
    </el-row>
    <el-tabs v-model="activeDashboard">
      <el-tab-pane v-for="card in dashboardCards" :key="card.id" :name="card.id" :label="card.name">
        <issue-list :ref="card.id" :project-id="project_id"
                    :display-closed-props="displayClosed"
                    :filter-value-props="filterValue" :from="card.id"
                    :keyword-props="keyword"
                    @total="updateTotalCount(card.id, $event)"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getIssuePriority, getIssueStatus, getIssueTracker } from '@/api/issue'
import { getProjectUserList, getProjectVersion } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'

export default {
  name: 'Dashboard',
  components: {
    ProjectListSelector,
    issueList: () => import('./components/issueList'),
    Tracker: () => import('@/components/Issue/Tracker'),
    Status: () => import('@/components/Issue/Status'),
    Priority: () => import('@/components/Issue/Priority')
  },
  data() {
    return {
      listLoading: false,
      fixed_version_closed: false,
      searchVisible: false,
      displayClosed: false,
      project_id: null,
      activeDashboard: 'assigned_to_id',
      fixed_version: [],
      tracker: [],
      assigned_to: [],
      status: [],
      priority: [],
      filterValue: {},
      originFilterValue: {},
      keyword: null,
      total: { 'assigned_to_id': 0, 'author_id': 0 }
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'projectList', 'issueListFilter', 'issueListKeyword', 'issueListDisplayClosed',
      'issueListListQuery', 'issueListPageInfo', 'initIssueList', 'fixedVersionShowClosed']),
    dashboardCards() {
      return [
        { id: 'assigned_to_id', name: this.$t('MyWork.AssignedToMe') },
        { id: 'author_id', name: this.$t('MyWork.ReportedIssue') }
      ]
    },
    filterOptions() {
      return [
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
      ]
    },
    contextOptions() {
      const result = {}
      this.filterOptions.forEach((item) => {
        result[item.value] = this[item.value]
      })
      return result
    },
    listFilter() {
      const result = []
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          const value = this[item].find((search) => (search.id === this.filterValue[item]))
          if (value) {
            result.push(this.getSelectionLabel(value))
          }
        }
      })
      return this.$t('general.Filter') + ((result.length > 0) ? ': ' : '') + result.join(', ')
    },
    isFilterChanged() {
      for (const item of Object.keys(this.filterValue)) {
        const checkFilterValue = this.filterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.originFilterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
      return !!this.keyword
    }
  },
  watch: {
    project_id() {
      this.loadProjectSelectionList(this.fixed_version_closed)
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadProjectSelectionList(value)
    }
  },
  mounted() {
    this.loadSelectionList()
    this.getMyProjectList()
  },
  methods: {
    ...mapActions('projects', ['getMyProjectList']),
    async loadSelectionList() {
      await Promise.all([
        getIssueTracker(),
        getIssueStatus(),
        getIssuePriority()
      ]).then(res => {
        const [typeList, statusList, priorityList] = res.map(
          item => item.data
        )
        this.tracker = typeList
        this.status = statusList
        this.priority = priorityList
        if (this.userRole === 'Engineer') {
          this.$set(this.filterValue, 'assigned_to', this.userId)
          this.$set(this.originFilterValue, 'assigned_to', this.userId)
        }
      })
      await this.loadProjectSelectionList(this.fixed_version_closed)
    },
    async loadProjectSelectionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      if (this.project_id && this.project_id !== '') {
        await Promise.all([getProjectVersion(this.project_id, params), getProjectUserList(this.project_id)]).then(res => {
          const [versionList, assigneeList] = res.map(
            item => item.data
          )
          this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.versions]
          this.assigned_to = [
            { name: this.$t('Issue.Unassigned'), id: 'null' },
            ...assigneeList.user_list
          ]
        })
      }
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = null
      this.displayClosed = false
    },
    isRequireProjectId(name) {
      const column = ['fixed_version', 'assigned_to']
      return (column.includes(name) && (!this.project_id || (name === 'assigned_to' && this.activeDashboard === 'assigned_to_id')))
    },
    updateTotalCount(card_id, value) {
      this.$set(this.total, card_id, value)
    }
  }
}
</script>

<style lang="scss" scoped>
> > > .el-tabs__header {
  display: none;
}

.dashboard-card {
  .item {
    @apply p-2 px-5 py-1 md:px-10 md:py-2 rounded-lg bg-gray-200 cursor-pointer hover:shadow-md;
    .divider {
      @apply border-white border-solid border-0 border-b-2;
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
