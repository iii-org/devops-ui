<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <el-row slot="button">
        <el-col>
          <el-button
            icon="el-icon-refresh"
            size="small"
            class="buttonSecondaryReverse"
            @click="onChangeFilter"
          />
          <el-button
            size="small"
            class="buttonSecondary"
            icon="el-icon-plus"
            @click="handleShowAddDialog"
          >
            {{ $t('Issue.AddIssue') }}
          </el-button>
        </el-col>
      </el-row>
      <SearchFilter
        ref="searchFilter"
        :filter-options="filterOptions"
        :list-loading="listLoading"
        :selection-options="contextOptions"
        :prefill="{ filterValue, keyword, displayClosed, originFilterValue }"
        @change-filter="onChangeFilterForm"
        @change-fixed-version="onChangeFixedVersionStatus"
      >
        <el-popover v-if="activeTab === 'WBS'">
          <el-form>
            <el-form-item label="展開層數">
              <el-select v-model="downloadForm.levels">
                <el-option
                  v-for="level in 5"
                  :key="level"
                  :label="level"
                  :value="level"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                :loading="downloadLock.is_lock"
                class="buttonPrimary"
                @click="generateReport"
              >
                產生Excel報表
              </el-button>
            </el-form-item>
            <template v-if="downloadInfo.create_at">
              <el-divider />
              <el-form-item>
                <el-button
                  :loading="downloadLock.is_lock"
                  class="buttonSecondary"
                  @click="downloadReport"
                >
                  下載Excel報表
                </el-button>
              </el-form-item>
              <div v-if="!downloadLock.is_lock">
                {{ $t('general.LastUpdateTime') }}: {{ momentTime(downloadInfo.create_at) }}
              </div>
            </template>
          </el-form>
          <el-button
            v-if="activeTab === 'WBS'"
            slot="reference"
            icon="el-icon-download"
            class="buttonPrimaryReverse"
            size="small"
            :disabled="selectedProjectId === -1"
          >
            {{ $t('File.Download') }}
          </el-button>
        </el-popover>
        <el-divider v-if="activeTab === 'Board'" direction="vertical" />
        <el-popover
          v-if="activeTab === 'Board'"
          placement="bottom"
          trigger="click"
        >
          <el-form v-loading="listLoading">
            <el-form-item :label="$t('Issue.FilterDimensions.label')">
              <el-select
                v-model="groupBy.dimension"
                class="mr-4"
                filterable
                @change="onChangeGroupByDimension($event)"
              >
                <template v-for="item in groupByOptions">
                  <el-option
                    :key="item.id"
                    :label="item.label"
                    :value="item.value"
                  />
                </template>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select-all
                ref="groupByValue"
                :value="groupBy.value"
                filterable
                multiple
                collapse-tags
                :loading="listLoading"
                :options="groupByValueList"
                value-key="id"
                @change="onChangeGroupByValue($event)"
              />
              <div slot="label">
                {{ $t(`Issue.${groupBy.dimension}`) }}
                <el-tag
                  v-if="groupBy.dimension === 'fixed_version'"
                  type="info"
                  class="flex-1"
                >
                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                </el-tag>
              </div>
            </el-form-item>
            <el-form-item v-if="groupBy.dimension === 'status'" :label="$t('Issue.Issue')">
              <el-select-all
                ref="groupByRow"
                :value="groupBy.list"
                filterable
                multiple
                collapse-tags
                :loading="listLoading"
                :options="groupByRow"
                value-key="id"
                @change="onChangeGroupByRow($event)"
              />
            </el-form-item>
          </el-form>
          <el-button
            v-if="activeTab === 'Board'"
            slot="reference"
            :loading="listLoading"
            class="headerTextColor"
            type="text"
          >
            <i18n path="Issue.GroupBy">
              <strong slot="filter">{{ showSelectedGroupByName }}</strong>
            </i18n>
            ({{ showSelectedGroupByLength }})
            <em class="el-icon-arrow-down el-icon--right" />
          </el-button>
        </el-popover>
        <el-divider v-if="activeTab === 'WBS'" direction="vertical" />
        <el-popover
          v-if="activeTab === 'WBS'"
          placement="bottom"
          trigger="click"
        >
          <el-form class="display-column">
            <el-form-item
              v-for="item in columnsOptions"
              :key="item.field"
            >
              <el-checkbox
                :value="getCheckColumnValue(item.field)"
                :label="item.display"
                @change="onCheckColumnChange(item.field)"
              >
                {{ item.display }}
              </el-checkbox>
            </el-form-item>
          </el-form>
          <el-button
            v-if="activeTab === 'WBS'"
            slot="reference"
            icon="el-icon-s-operation"
            type="text"
            class="headerTextColor"
          >
            {{ $t('Milestone.Display') }}
            <em class="el-icon-arrow-down el-icon--right" />
          </el-button>
        </el-popover>
        <el-divider direction="vertical" />
      </SearchFilter>
    </ProjectListSelector>
    <el-divider />
    <div
      ref="wrapper"
      class="wrapper"
      :class="{'is-panel':relationIssue}"
    >
      <el-tabs
        v-model="activeTab"
        type="border-card"
      >
        <el-tab-pane
          name="WBS"
          label="WBS"
          lazy
        >
          <WBS
            ref="WBS"
            :filter-value="filterValue"
            :keyword="keyword"
            :display-closed="displayClosed"
            :columns="columns"
            :assigned-to="assigned_to"
            :fixed-version="fixed_version"
            :tags="tags"
            :table-height="tableHeight"
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
            :display-closed="displayClosed"
            :assigned_to="assigned_to"
            :fixed-version="fixed_version"
            :table-height="tableHeight"
          />
        </el-tab-pane>
        <el-tab-pane
          name="Board"
          label="Board"
          lazy
        >
          <Board
            ref="Board"
            :filter-value="filterValue"
            :keyword="keyword"
            :display-closed="displayClosed"
            :assigned-to="assigned_to"
            :fixed-version="fixed_version"
            :tags="tags"
            :group-by="groupBy"
            @row-list="setGroupByRow"
            @relation-issue="onRelationIssue"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      :title="$t('Issue.AddIssue')"
      :visible.sync="showAddIssue"
      width="50%"
      top="50px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @close="handleCloseAddDialog"
    >
      <AddIssue
        ref="AddIssue"
        :project-id="projectId"
        :prefill="form"
        :save-data="saveIssue"
        @add-topic-visible="handleCloseAddDialog"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          id="dialog-btn-cancel"
          class="buttonSecondaryReverse"
          :disabled="loadingSave"
          @click="handleAdvancedClose"
        >{{ $t('general.Cancel') }}</el-button>
        <el-button
          id="dialog-btn-confirm"
          :loading="loadingSave"
          class="buttonPrimary"
          @click="handleAdvancedSave"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Gantt from '@/views/Plan/Milestone/components/Gantt'
import WBS from '@/views/Plan/Milestone/components/WBS'
import Board from '@/views/Plan/Milestone/components/Board'
import SearchFilter from '@/components/Issue/SearchFilter'
import {
  getIssueListDownload,
  getIssueListLockStatus,
  getProjectAssignable,
  getProjectVersion,
  getTagsByProject,
  patchIssueListDownload,
  postIssueListDownload
} from '@/api/projects'
import { addIssue, getIssueFieldDisplay, putIssueFieldDisplay } from '@/api/issue'
import XLSX from 'xlsx'
import ElSelectAll from '@/components/ElSelectAll'
import AddIssue from '@/components/Issue/AddIssue'

export default {
  name: 'ProjectMilestone',
  components: {
    SearchFilter,
    WBS,
    Board,
    Gantt,
    ProjectListSelector,
    ElSelectAll,
    AddIssue
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
      relationIssue: false,
      showAddIssue: false,
      loadingSave: false,
      fixed_version_closed: false,
      form: {},
      groupBy: {
        dimension: 'status',
        value: [],
        list: []
      },
      filterOptions: Object.freeze([
        {
          id: 1,
          label: this.$t('Issue.FilterDimensions.tracker'),
          value: 'tracker',
          placeholder: 'Type',
          tag: true
        },
        {
          id: 2,
          label: this.$t('Issue.FilterDimensions.status'),
          value: 'status',
          placeholder: 'Status',
          tag: true
        },
        {
          id: 3,
          label: this.$t('Issue.FilterDimensions.tags'),
          value: 'tags',
          placeholder: 'Tag'
        },
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
      ]),
      columnsOptions: Object.freeze([
        { display: this.$t('Issue.name'), field: 'name' },
        { display: this.$t('Issue.tracker'), field: 'tracker' },
        { display: this.$t('Issue.status'), field: 'status' },
        { display: this.$t('Issue.fixed_version'), field: 'fixed_version' },
        { display: this.$t('Issue.StartDate'), field: 'StartDate' },
        { display: this.$t('Issue.EndDate'), field: 'EndDate' },
        { display: this.$t('Issue.priority'), field: 'priority' },
        { display: this.$t('Issue.assigned_to'), field: 'assigned_to' },
        { display: this.$t('Issue.DoneRatio'), field: 'DoneRatio' },
        { display: this.$t('Issue.points'), field: 'points' }
      ]),
      filterValue: {},
      originFilterValue: {},
      displayFields: [],
      keyword: null,
      listData: [],
      activeTab: 'WBS',
      groupByRow: [],
      addTopicDialog: {
        visible: false,
        parentId: 0,
        parentName: null,
        LoadingConfirm: false
      },
      downloadForm: {
        levels: 3
      },
      downloadInfo: {
        create_at: null
      },
      downloadLock: {
        is_lock: false
      },
      intervalTimer: null
    }
  },
  computed: {
    ...mapGetters(['userId', 'selectedProjectId', 'status', 'tracker', 'fixedVersionShowClosed']),
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version', 'tags']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
    },
    columns() {
      if (this.displayFields.length <= 0) {
        return this.columnsOptions.map((item) => item.field)
      }
      return this.displayFields
    },
    deploy_column() {
      return this.columnsOptions.filter((item) => this.columns.includes(item.field))
    },
    groupByOptions() {
      return [{
        id: 1,
        label: this.$t('Issue.Issue'),
        value: 'status',
        placeholder: 'Status'
      }, {
        id: 2,
        label: this.$t('Issue.assigned_to'),
        value: 'assigned_to',
        placeholder: 'Assignee'
      }, {
        id: 3,
        label: this.$t('Issue.fixed_version'),
        value: 'fixed_version',
        placeholder: 'Version'
      }]
    },
    groupByValueList() {
      return this.getStatusSort.map((item, idx) => ({
        id: idx,
        label: this.getTranslateHeader(item),
        value: item
      }))
    },
    getStatusSort() {
      const dimension = this.groupBy.dimension
      let sort = []
      if (dimension === 'status') {
        sort = this.filterClosedStatus(this[dimension])
      } else if (dimension === 'assigned_to') {
        sort = this[dimension].filter((item) => item.login !== '-Me-')
      } else {
        sort = this[dimension]
      }
      return sort
    },
    filterClosedStatus() {
      return function (statusList) {
        if (this.displayClosed) return statusList
        return statusList.filter((item) => item.is_closed === false)
      }
    },
    showSelectedGroupByName() {
      return this.groupByOptions.find((item) => item.value === this.groupBy.dimension).label
    },
    showSelectedGroupByLength() {
      if (this.groupByValueList.length === this.groupBy.value.length || this.groupBy.value.length === 0) {
        return this.$t('general.All')
      }
      return this.groupBy.value.length
    },
    projectId() {
      return this.filterValue.project || this.selectedProjectId
    }
  },
  watch: {
    selectedProjectId() {
      this.onChangeFilter()
      this.loadSelectionList()
      this.$refs['searchFilter'].cleanFilter()
    },
    fixed_version_closed(value) {
      this.loadVersionList(value)
    }
  },
  async created() {
    this.loadSelectionList()
    const tracker = this.tracker.find((item) => item.name === 'Epic')
    const storeFilterValue = await this.getIssueFilter()
    this.filterValue = storeFilterValue['milestone']
      ? storeFilterValue['milestone'] : { tracker: tracker.id }
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
    this.loadReportStatus()
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
    ...mapActions('projects', [
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
      'setIssueFilter',
      'setKeyword',
      'setDisplayClosed'
    ]),
    onRelationIssue(value) {
      this.relationIssue = value
    },
    loadSelectionList() {
      this.loadVersionList(this.fixedVersionShowClosed)
      this.loadAssignedToList()
      this.loadDisplayColumns()
      this.loadTagsList()
      this.loadReportStatus()
    },
    async loadDisplayColumns() {
      const res = await getIssueFieldDisplay({
        project_id: this.selectedProjectId,
        type: 'wbs_cache'
      })
      this.displayFields = res.data
    },
    async loadAssignedToList() {
      const res = await getProjectAssignable(this.filterValue.project || this.selectedProjectId)
      this.assigned_to = [
        { id: 'null', name: this.$t('Issue.Unassigned') },
        {
          name: this.$t('Issue.me'),
          login: '-Me-',
          id: this.userId,
          class: 'bg-yellow-100'
        },
        ...res.data.user_list
      ]
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.filterValue.project || this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    async loadTagsList() {
      const res = await getTagsByProject(this.filterValue.project || this.selectedProjectId)
      this.tags = res.data.tags
    },
    handleUpdateLoading(value) {
      this.updateLoading = value
    },
    handleUpdateStatus(value) {
      this.lastUpdated = value
    },
    async onChangeFilterForm(value) {
      this.fixed_version_closed = false
      this.loadSelectionList()
      Object.keys(value).forEach((item) => {
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
      if (this.displayFields.includes(value)) {
        const columnIndex = this.displayFields.findIndex((item) => item === value)
        this.displayFields.splice(columnIndex, 1)
      } else {
        this.displayFields.push(value)
      }
      if (this.displayFields.length <= 0) {
        this.displayFields = this.columnsOptions.map((item) => item.field)
      }
      const res = await putIssueFieldDisplay({
        project_id: this.selectedProjectId,
        type: 'wbs_cache',
        display_fields: this.displayFields
      })
      this.displayFields = res.data
    },
    onChangeFilter() {
      if (this.$refs['WBS']) this.$refs['WBS'].loadData()
      if (this.$refs['Gantt']) this.$refs['Gantt'].loadData()
      if (this.$refs['Board']) this.$refs['Board'].loadData()
      // this.$refs[this.activeTab].loadData()
    },
    prepareExcel(result) {
      const worksheet = XLSX.utils.json_to_sheet(result)
      this.$excel(worksheet, 'WBS')
    },
    momentTime(time) {
      const timezoneOffset = this.$dayjs().utcOffset()
      return time === 'None' ? '-'
        : this.$dayjs(time).utc().add(timezoneOffset, 'minute').local().fromNow()
    },
    onChangeFixedVersionStatus() {
      this.$emit('change-fixed-version', this.fixed_version_closed)
    },
    async generateReport() {
      const generateData = { ...this.downloadForm, ...this.$refs['WBS'].getParams(), deploy_column: this.deploy_column }
      const res = await postIssueListDownload(this.selectedProjectId, generateData)
      await this.loadReportStatus()
      return res
    },
    async downloadReport() {
      const res = await patchIssueListDownload(this.selectedProjectId)
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `WBS_Export${this.selectedProjectId}_${this.downloadInfo.create_at}.xlsx`) // or any other extension
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    async loadReportStatus() {
      await this.getLockCheck()
      if (!this.downloadLock.is_lock) {
        if (this.intervalTimer) {
          window.clearInterval(this.intervalTimer)
          this.intervalTimer = null
        }
        await this.getExportFileInfo()
      } else if (!this.intervalTimer) {
        this.intervalTimer = window.setInterval(this.loadReportStatus, 1000)
      }
      return Promise.resolve()
    },
    async getLockCheck() {
      try {
        const res = await getIssueListLockStatus(this.selectedProjectId)
        this.downloadLock = res.data
        return Promise.resolve(res.data)
      } catch (e) {
        console.error(e)
        return Promise.reject(e)
      }
    },
    async getExportFileInfo() {
      try {
        const res = await getIssueListDownload(this.selectedProjectId)
        this.downloadInfo = res.data
        return Promise.resolve(res.data)
      } catch (e) {
        console.error(e)
        return Promise.reject(e)
      }
    },
    onChangeGroupByDimension(value) {
      this.$set(this.groupBy, 'dimension', value)
      this.$set(this.groupBy, 'value', [])
      this.$refs['groupByValue'].selected = []
    },
    onChangeGroupByValue(value) {
      this.$set(this.groupBy, 'value', value)
      this.$set(this.groupBy, 'list', [])
      if (this.$refs['groupByRow']) this.$refs['groupByRow'].selected = []
    },
    onChangeGroupByRow(value) {
      this.$set(this.groupBy, 'list', value)
    },
    setGroupByRow(value) {
      this.groupByRow = value.map((item) => ({
        id: item.id,
        label: item.name,
        value: item
      }))
    },
    getTranslateHeader(value) {
      let label = this.$te('Issue.' + value.name) ? this.$t('Issue.' + value.name) : value.name
      if (this.groupBy.dimension === 'fixed_version') {
        if (value.status === 'closed') {
          label = label + ' (' + this.$t('Version.closed') + ')'
        }
      }
      return label
    },
    handleCloseAddDialog() {
      this.showAddIssue = false
    },
    handleShowAddDialog() {
      this.form = {
        tracker_id: null,
        name: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      }
      const dimensions = ['fixed_version', 'tracker', 'status', 'assigned_to', 'version', 'priority']
      dimensions.forEach((item) => {
        if (
          this.filterValue &&
          this.filterValue[item] !== 'null' &&
          !!this.filterValue[item] &&
          this.filterValue[item] !== ''
        ) {
          this.$set(this.form, item + '_id', this.filterValue[item])
        }
      })
      if (this.filterValue.hasOwnProperty('due_date_start')) {
        if (this.filterValue.due_date_start !== null) {
          this.$set(this.form, 'start_date', this.filterValue.due_date_start)
        }
      }
      if (this.filterValue.hasOwnProperty('due_date_end')) {
        if (this.filterValue.due_date_end !== null) {
          this.$set(this.form, 'due_date', this.filterValue.due_date_end)
        }
      }
      if (this.filterValue.hasOwnProperty('tags')) {
        if (this.filterValue.tags && this.filterValue.tags.length > 0) {
          this.$set(this.form, 'tags', this.filterValue.tags)
        }
      }
      this.showAddIssue = true
    },
    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
    },
    handleAdvancedSave() {
      this.$refs['AddIssue'].handleSave()
    },
    async saveIssue(data) {
      this.loadingSave = true
      await addIssue(data)
        .then((res) => {
          this.onChangeFilter()
          return res
        })
        .catch((error) => {
          return error
        })
        .finally(() => {
          this.showAddIssue = false
          this.loadingSave = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);

  &.is-panel {
    width: calc(100% - 750px);
    transition: width 1s;
  }
}

.display-column {
  .el-form-item {
    margin: 0;
  }
}
</style>
