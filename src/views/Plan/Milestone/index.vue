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
            <em class="el-icon-check" />
            <strong>{{ $t('Milestone.Success') }}: </strong>{{ lastUpdated.time|relativeTime }}
          </span>
          <span v-else-if="lastUpdated&&lastUpdated.error" class="text-danger">
            <em class="el-icon-check" />
            <strong>{{ $t('Milestone.Error') }}: </strong>
            {{ $t(`errorMessage.${lastUpdated.error.response.data.error.code}`,
                  lastUpdated.error.response.data.error.details) }}
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
        <el-button icon="el-icon-download" :disabled="selectedProjectId === -1" @click="downloadExcel()">
          {{ $t('File.Download') }}
        </el-button>
        <el-divider direction="vertical" />
        <el-popover
          placement="bottom"
          trigger="click"
        >
          <el-form class="display-column">
            <el-form-item v-for="item in columnsOptions" :key="item.value">
              <el-checkbox :value="getCheckColumnValue(item.value)" :label="item.label"
                           @change="onCheckColumnChange(item.value)"
              >
                {{ item.label }}
              </el-checkbox>
            </el-form-item>
          </el-form>
          <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ $t('Milestone.Display') }}
            <em class="el-icon-arrow-down el-icon--right" /></el-button>
        </el-popover>
        <el-divider direction="vertical" />
      </SearchFilter>
    </project-list-selector>
    <el-divider />
    <div ref="wrapper" class="wrapper">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane name="WBS" label="WBS" lazy>
          <WBS ref="WBS" :filter-value="filterValue" :keyword="keyword" :columns="columns" :assigned-to="assigned_to"
               :fixed-version="fixed_version" :tags="tags" :table-height="tableHeight"
               @update-loading="handleUpdateLoading"
               @update-status="handleUpdateStatus"
          />
        </el-tab-pane>
        <el-tab-pane
          name="Gantt"
          label="Gantt"
          lazy
        >
          <Gantt
            ref="Gantt"
            :filter-value="filterValue"
            :keyword="keyword"
            :assigned_to="assigned_to"
            :fixed-version="fixed_version"
            :table-height="tableHeight"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Gantt from '@/views/Plan/Milestone/components/Gantt'
import WBS from '@/views/Plan/Milestone/components/WBS'
import SearchFilter from '@/components/Issue/SearchFilter'
import { getProjectAssignable, getProjectVersion, getTagsByProject } from '@/api/projects'
import { getWBSCache, putWBSCache } from '@/api/issue'
import XLSX from 'xlsx'

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
      tags: [],

      activeNames: '',
      searchVisible: false,
      displayClosed: false,
      tableHeight: 0,
      filterValue: {},
      originFilterValue: {},
      displayFields: [],
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
      const getOptions = ['assigned_to', 'fixed_version', 'tags']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
    },
    filterOptions() {
      return [
        {
          id: 1,
          label: this.$t('Issue.FilterDimensions.status'),
          value: 'status',
          placeholder: 'Status',
          tag: true
        },
        {
          id: 2,
          label: this.$t('Issue.FilterDimensions.tags'),
          value: 'tags',
          placeholder: 'Tag'
        },
        // {
        //   id: 3,
        //   label: this.$t('Issue.FilterDimensions.tracker'),
        //   value: 'tracker',
        //   placeholder: 'Type',
        //   tag: true
        // },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.assigned_to'),
          value: 'assigned_to',
          placeholder: 'Member'
        },
        {
          id: 5,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version'
        },
        {
          id: 6,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true
        },
        {
          id: 7,
          label: this.$t('Issue.FilterDimensions.due_date_start'),
          value: 'due_date_start',
          placeholder: 'Date',
          component: 'el-date-picker',
          componentOptions: { type: 'date' },
          tag: true
        },
        {
          id: 8,
          label: this.$t('Issue.FilterDimensions.due_date_end'),
          value: 'due_date_end',
          placeholder: 'Date',
          component: 'el-date-picker',
          componentOptions: { type: 'date' },
          tag: true
        }
      ]
    },
    columnsOptions() {
      return [
        { label: this.$t('Issue.name'), value: 'name' },
        { label: this.$t('Issue.tracker'), value: 'tracker' },
        { label: this.$t('Issue.status'), value: 'status' },
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
      if (this.displayFields.length <= 0) {
        return this.columnsOptions.map(item => item.value)
      }
      return this.displayFields
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
    if (storeKeyword['milestone']) {
      this.keyword = storeKeyword['milestone']
    }
    const storeDisplayClosed = await this.getDisplayClosed()
    if (storeDisplayClosed['milestone']) {
      this.displayClosed = storeDisplayClosed['milestone']
    }
    this.onChangeFilter()
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = this.$refs['wrapper'].clientHeight
    })
    window.onresize = () => {
      this.$nextTick(() => {
        this.tableHeight = this.$refs['wrapper'].clientHeight
      })
    }
  },
  methods: {
    ...mapActions('projects', ['getIssueFilter', 'getKeyword', 'getDisplayClosed', 'setIssueFilter', 'setKeyword', 'setDisplayClosed']),
    loadSelectionList() {
      this.loadVersionList(this.fixedVersionShowClosed)
      this.loadAssignedToList()
      this.loadDisplayColumns()
      this.loadTagsList()
    },
    async loadDisplayColumns() {
      const res = await getWBSCache({ project_id: this.selectedProjectId })
      this.displayFields = res.data
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
    async loadTagsList() {
      const res = await getTagsByProject(this.selectedProjectId)
      this.tags = res.data.tags
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
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
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
    getCheckColumnValue(value) {
      if (this.displayFields.length <= 0) return true
      return this.displayFields.includes(value)
    },
    async onCheckColumnChange(value) {
      if (this.displayFields.length <= 0) this.displayFields = this.columnsOptions.map(item => item.value)
      if (this.displayFields.includes(value)) {
        const columnIndex = this.displayFields.findIndex(item => item === value)
        this.displayFields.splice(columnIndex, 1)
      } else {
        this.displayFields.push(value)
      }
      const res = await putWBSCache({ project_id: this.selectedProjectId, display_fields: this.displayFields })
      this.displayFields = res.data
    },
    onChangeFilter() {
      this.$refs[this.activeTab].loadData()
    },
    prepareExcel(result) {
      const worksheet = XLSX.utils.json_to_sheet(result)
      this.$excel(worksheet, 'WBS')
    },
    async downloadExcel() {
      let result = await this.$refs['WBS'].fetchData()
      result = this.dataCleanExcel(result)
      await this.prepareExcel(result)
    },
    dataCleanExcel(fetchData) {
      const exportColumn = {
        tags: { column: ['name'], root: true },
        name: { column: ['id', 'name'], root: true },
        tracker: { column: ['name'], children: 'tracker' },
        fixed_version: { column: ['name'], children: 'fixed_version' },
        StartDate: { column: ['start_date'], root: true },
        EndDate: { column: ['due_date'], root: true },
        priority: { column: ['name'], children: 'priority' },
        assigned_to: { column: ['name'], children: 'assigned_to' },
        DoneRatio: { column: ['done_ratio'], root: true },
        points: { column: ['points'], root: true }
      }
      const result = []
      fetchData = fetchData.map((item) => {
        const start_date = this.$dayjs(item['start_date'])
        const due_date = this.$dayjs(item['due_date'])
        if (start_date.isValid()) {
          item['start_date'] = start_date.format('YYYY-MM-DD')
        }
        if (due_date.isValid()) {
          item['due_date'] = this.$dayjs(item['due_date']).format('YYYY-MM-DD')
        }
        return item
      })
      fetchData.forEach((item, idx) => {
        const itemResult = { [this.$t('Test.TestPlan.no')]: idx + 1 }
        Object.keys(exportColumn).forEach((column) => {
          let resultArray
          if (exportColumn[column]['root']) {
            resultArray = this.formatColumns(exportColumn[column].column, item)
            resultArray = resultArray.join(' - ')
          }
          if (exportColumn[column]['children']) {
            const childrenSplit = exportColumn[column]['children'].split('.')
            const getChildrenData = childrenSplit.reduce((total, current) => (total[current]), item)
            if (column === 'software_name' || column === 'file_name') {
              resultArray = this.formatColumns(getChildrenData, item, column)
            } else if (column === 'test_result') {
              resultArray = this.getTestResult(getChildrenData)
            } else if (column === 'branch') {
              resultArray = this.getBranch(getChildrenData)
            } else if (Array.isArray(getChildrenData)) {
              resultArray = this.formatColumns(getChildrenData, item).map((check) => this.joinResult(check, ' - '))
            } else {
              resultArray = this.formatColumns(exportColumn[column].column, getChildrenData)
            }
          }
          if (Array.isArray(resultArray)) {
            resultArray = this.joinResult(resultArray, ',')
          }
          itemResult[this.$t('Issue.' + column)] = resultArray
        })
        result.push(itemResult)
      })
      return result
    },
    formatColumns(column, checkDataset, name) {
      return column.map((subColumn) =>
        name ? this.confirmExist(checkDataset, subColumn, name) : this.confirmExist(checkDataset, subColumn))
        .filter(subColumn => subColumn)
    },
    confirmExist(data, column, name) {
      if (!data) {
        return null
      }
      return name ? column[name] : data[column]
    },
    joinResult(columnResult, joinStr) {
      const checkNull = columnResult.reduce((total, current) => (!!total && !!current), true)
      if (!checkNull) return null
      return columnResult.join(joinStr)
    },
    getBranch(data) {
      const result = []
      data.forEach((item) => {
        const last_result = item.the_last_test_result
        if (last_result.hasOwnProperty('branch') && last_result.hasOwnProperty('commit_id')) {
          result.push(last_result.branch + ' - ' + last_result.commit_id)
        } else {
          result.push(null)
        }
      })
      return result
    },
    getTestResult(data) {
      const result = []
      data.forEach((item) => {
        const last_result = item.the_last_test_result
        if (item.software_name === 'Postman') {
          if (last_result.hasOwnProperty('success') && last_result.hasOwnProperty('failure')) {
            result.push(last_result.success + '/' + (last_result.success + last_result.failure))
          } else {
            result.push(null)
          }
        } else if (item.software_name === 'SideeX') {
          if (last_result.result && last_result.result.casesPassed && last_result.result.casesTotal) {
            result.push(last_result.result.casesPassed + '/' + last_result.result.casesTotal)
          } else {
            result.push(null)
          }
        }
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>

.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
}

.display-column {
  .el-form-item {
    margin: 0;
  }
}
</style>
