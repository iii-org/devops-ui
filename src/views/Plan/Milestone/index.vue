<template>
  <el-row class="app-container">
    <project-list-selector>
      <el-row slot="button">
        <el-col class="text-right">
          <el-button icon="el-icon-refresh" size="small" @click="onChangeFilter" />
          <span v-if="updateLoading" class="text-blue-500">
            <em class="el-icon-loading" /> {{ $t('Milestone.Saving') }}......
          </span>
          <span v-else-if="lastUpdated&&lastUpdated.time" class="text-success">
            <em class="el-icon-check" /> <strong>{{ $t('Milestone.Success') }}: </strong>{{ lastUpdated.time|relativeTime }}
          </span>
          <span v-else-if="lastUpdated&&lastUpdated.error" class="text-danger">
            <em class="el-icon-check" /> <strong>{{ $t('Milestone.Error') }}: </strong>{{ $t(`errorMessage.${lastUpdated.error.response.data.error.code}`, lastUpdated.error.response.data.error.details) }}
          </span>
        </el-col>
      </el-row>
      <SearchFilter
        ref="searchFilter"
        :filter-options="filterOptions"
        :list-loading="listLoading"
        :selection-options="contextOptions"
        :prefill="{ filterValue: filterValue, keyword: keyword, displayClosed: displayClosed, originFilterValue:originFilterValue }"
        @change-filter="onChangeFilterForm"
      >
        <el-popover
          placement="bottom"
          trigger="click"
        >
          <el-checkbox v-for="item in columnsOptions" :key="item.value" v-model="checkedColumns[item.value]" :label="item.label">{{ item.label }}</el-checkbox>
          <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ $t('Milestone.Display') }}
            <i class="el-icon-arrow-down el-icon--right" /></el-button>
        </el-popover>
        <el-divider direction="vertical" />
      </SearchFilter>
    </project-list-selector>
    <el-divider />
    <el-tabs v-model="activeTab" type="border-card" @tab-click="onChangeFilter">
      <el-tab-pane name="WBS" label="WBS">
        <WBS ref="WBS" :filter-value="filterValue" :keyword="keyword" :columns="columns" :assigned-to="assigned_to"
             :fixed-version="fixed_version" @update-loading="handleUpdateLoading" @update-status="handleUpdateStatus"
        />
      </el-tab-pane>
      <el-tab-pane name="Gantt" label="Gantt">
        <Gantt ref="Gantt" :filter-value="filterValue" :keyword="keyword" :assigned_to="assigned_to"
               :fixed-version="fixed_version"
        />
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Gantt from '@/views/Plan/Milestone/components/Gantt'
import WBS from '@/views/Plan/Milestone/components/WBS'
import SearchFilter from '@/components/Issue/SearchFilter'
import { getProjectAssignable, getProjectVersion } from '@/api/projects'

export default {
  name: 'ProjectMilestone',
  components: {
    SearchFilter,
    WBS,
    Gantt,
    ProjectListSelector
  },
  data() {
    return {
      listLoading: false,
      contentLoading: false,

      updateLoading: false,
      lastUpdated: null,

      assigned_to: [],
      fixed_version: [],

      activeNames: '',
      searchVisible: false,
      displayClosed: false,
      filterValue: { tracker: 1 },
      originFilterValue: { tracker: 1 },
      checkedColumns: { name: true, tracker: true, fixed_version: true, StartDate: true, EndDate: true,
        priority: true, assigned_to: true, DoneRatio: true, points: true },
      keyword: null,

      listData: [],
      activeTab: 'WBS',
      addTopicDialog: {
        visible: false,
        parentId: 0,
        parentName: null,
        LoadingConfirm: false
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'selectedProjectId', 'tracker', 'fixedVersionShowClosed']),
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
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
    columnsOptions() {
      return [
        { label: this.$t('Issue.name'), value: 'name' },
        { label: this.$t('Issue.tracker'), value: 'tracker' },
        { label: this.$t('Issue.fixed_version'), value: 'fixed_version' },
        { label: this.$t('Issue.StartDate'), value: 'StartDate' },
        { label: this.$t('Issue.EndDate'), value: 'EndDate' },
        { label: this.$t('Issue.priority'), value: 'priority' },
        { label: this.$t('Issue.assigned_to'), value: 'assigned_to' },
        { label: this.$t('Issue.DoneRatio'), value: 'DoneRatio' },
        { label: this.$t('Issue.points'), value: 'points' }
      ]
    },
    columns() {
      const result = []
      Object.keys(this.checkedColumns).forEach(item => {
        if (this.checkedColumns[item]) { result.push(item) }
      })
      return result
    }
  },
  watch: {
    selectedProjectId() {
      this.onChangeFilter()
      this.loadSelectionList()
      this.$refs['searchFilter'].cleanFilter()
    },
    fixedVersionShowClosed(value) {
      this.loadVersionList(value)
    }
  },
  async created() {
    this.loadSelectionList()
    const tracker = this.tracker.find(item => item.name === 'Epic')
    const storeFilterValue = await this.getIssueFilter()
    if (storeFilterValue['milestone']) {
      this.filterValue = storeFilterValue['milestone']
    } else {
      this.fillterValue = { tracker: tracker.id }
    }
    this.originalFillterValue = { tracker: tracker.id }
    const storeKeyword = await this.getKeyword()
    if (storeKeyword['milestone']) { this.keyword = storeKeyword['milestone'] }
    const storeDisplayClosed = await this.getDisplayClosed()
    if (storeDisplayClosed['milestone']) { this.displayClosed = storeDisplayClosed['milestone'] }
    this.onChangeFilter()
  },
  methods: {
    ...mapActions('projects', ['getIssueFilter', 'getKeyword', 'getDisplayClosed', 'setIssueFilter', 'setKeyword', 'setDisplayClosed']),
    loadSelectionList() {
      this.loadVersionList(this.fixedVersionShowClosed)
      this.loadAssignedToList()
    },
    async loadAssignedToList() {
      const res = await getProjectAssignable(this.selectedProjectId)
      this.assigned_to = [
        {
          name: this.$t('Issue.me'),
          login: '-Me-',
          id: this.userId,
          class: 'bg-yellow-100'
        }, ...res.data.user_list
      ]
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    handleUpdateLoading(value) {
      this.updateLoading = value
    },
    handleUpdateStatus(value) {
      this.lastUpdated = value
    },
    async onChangeFilterForm(value) {
      Object.keys(value).forEach(item => {
        this[item] = value[item]
      })
      const storeFilterValue = await this.getIssueFilter()
      storeFilterValue['milestone'] = this.filterValue
      const storeKeyword = await this.getKeyword()
      storeKeyword['milestone'] = this.keyword
      const storeDisplayClosed = await this.getDisplayClosed()
      storeDisplayClosed['milestone'] = this.displayClosed
      await this.setIssueFilter(storeFilterValue)
      await this.setKeyword(storeKeyword)
      await this.setDisplayClosed(storeDisplayClosed)
      await this.onChangeFilter()
    },
    onChangeFilter() {
      this.$refs[this.activeTab].loadData()
    }
  }
}
</script>

<style lang="scss" scoped></style>
