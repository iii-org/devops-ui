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
            @click="handleQuickAddClose"
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
        :prefill="{
          filterValue: filterValue,
          keyword: keyword,
          displayClosed: displayClosed,
          fixed_version_closed: fixed_version_closed,
          originFilterValue: originFilterValue
        }"
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
                {{ $t('general.LastUpdateTime') + ': ' + getLocalTime(downloadInfo.create_at) }}
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
              <ElSelectAll
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
                  <el-checkbox v-model="fixed_version_closed">
                    {{ $t('Issue.DisplayClosedVersion') }}
                  </el-checkbox>
                </el-tag>
              </div>
            </el-form-item>
            <el-form-item
              v-if="groupBy.dimension === 'status'"
              :label="$t('Issue.Issue')"
            >
              <ElSelectAll
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
              <strong slot="filter">
                {{ showSelectedGroupByName }}
              </strong>
            </i18n>
            ({{ showSelectedGroupByLength }})
            <em class="el-icon-arrow-down el-icon--right" />
          </el-button>
        </el-popover>
        <el-divider v-if="activeTab === 'WBS'" direction="vertical" />
        <Columns
          v-if="activeTab==='WBS'"
          :columns-options="columnsOptions"
          :display-fields.sync="displayFields"
          :filter-value="filterValue"
          :type="'wbs_cache'"
        />
        <el-divider direction="vertical" />
      </SearchFilter>
    </ProjectListSelector>
    <el-divider />
    <QuickAddIssue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      @add-issue="advancedAddIssue"
    />
    <div
      ref="wrapper"
      class="wrapper"
      :class="{
        'show-quick':quickAddTopicDialogVisible,
        'is-panel':issueDetail.visible
      }"
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
            :issue-detail-opened-id="issueDetail.id"
            @onOpenIssueDetail="onRelationIssueDialog"
            @update-loading="handleUpdateLoading"
            @update-status="handleUpdateStatus"
            @update-selection-list="loadSelectionList"
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
            @relation-issue="onRelationIssueDialog"
          />
        </el-tab-pane>
      </el-tabs>
      <transition name="slide-fade">
        <div v-show="issueDetail.visible" class="rightPanel">
          <div
            class="handle-button"
            :style="{'background-color':'#85c1e9'}"
            @click="handleRightPanelVisible"
          >
            <em class="el-icon-d-arrow-right" />
          </div>
          <ProjectIssueDetail
            ref="issueDetailDrawer"
            :props-issue-id="issueDetail.id"
            :is-in-dialog="true"
            :is-from-board="true"
            @popup="handleRelationIssueDialogBeforeClose"
            @update="handleRelationUpdate"
            @delete="handleRelationDelete"
          />
        </div>
      </transition>
      <el-dialog
        :visible.sync="isProjectDetailPopUp"
        width="90%"
        top="3vh"
        append-to-body
        destroy-on-close
        :before-close="handleRelationIssueDialogBeforeClose"
      >
        <ProjectIssueDetail
          ref="issueDetailDialog"
          :props-issue-id="issueDetail.id"
          :is-in-dialog="true"
          :is-from-board="false"
          @update="handleRelationUpdate"
          @delete="handleRelationDelete"
        />
      </el-dialog>
    </div>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getIssueListDownload,
  getIssueListLockStatus,
  patchIssueListDownload,
  postIssueListDownload
} from '@/api/projects'
import { addIssue } from '@/api/issue'
import { getLocalTime } from '@/utils/handleTime'
import { BasicData, Columns, SearchFilter } from '@/mixins'
import { ProjectListSelector, ElSelectAll } from '@/components'
import { QuickAddIssue } from '@/components/Issue'
import Board from '@/views/Plan/Milestone/components/Board'
import Gantt from '@/views/Plan/Milestone/components/Gantt'
import WBS from '@/views/Plan/Milestone/components/WBS'
import ProjectIssueDetail from '@/views/Project/IssueDetail'
import XLSX from 'xlsx'

export default {
  name: 'ProjectMilestone',
  components: {
    ProjectListSelector,
    ProjectIssueDetail,
    ElSelectAll,
    QuickAddIssue,
    Board,
    Gantt,
    WBS
  },
  mixins: [BasicData, Columns, SearchFilter],
  data() {
    return {
      quickAddTopicDialogVisible: false,
      listLoading: false,
      contentLoading: false,
      updateLoading: false,
      lastUpdated: null,
      activeNames: '',
      tableHeight: 0,
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
      storageName: 'milestone',
      storageType: ['SearchFilter'],
      parentId: 0,
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
      intervalTimer: null,
      issueDetail: {
        visible: false,
        id: null
      },
      isProjectDetailPopUp: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'status', 'tracker', 'fixedVersionShowClosed']),
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version', 'tags']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
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
    showSelectedGroupByName() {
      return this.groupByOptions.find((item) => item.value === this.groupBy.dimension).label
    },
    showSelectedGroupByLength() {
      if (this.groupByValueList.length === this.groupBy.value.length || this.groupBy.value.length === 0) {
        return this.$t('general.All')
      }
      return this.groupBy.value.length
    }
  },
  async mounted() {
    await this.loadReportStatus()
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
    handleUpdateLoading(value) {
      this.updateLoading = value
      this.$nextTick(() => {
        this.$refs.issueDetailDialog.getData()
      })
    },
    handleUpdateStatus(value) {
      this.lastUpdated = value
    },
    async loadData() {
      if (this.$refs['WBS']) await this.$refs['WBS'].loadData()
      if (this.$refs['Gantt']) await this.$refs['Gantt'].loadData()
      if (this.$refs['Board']) await this.$refs['Board'].loadData()
      // this.$refs[this.activeTab].loadData()
    },
    prepareExcel(result) {
      const worksheet = XLSX.utils.json_to_sheet(result)
      this.$excel(worksheet, 'WBS')
    },
    getLocalTime(time) {
      return getLocalTime(time)
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
    },
    handleQuickAddClose() {
      this.quickAddTopicDialogVisible = !this.quickAddTopicDialogVisible
      if (this.tableHeight) {
        if (this.quickAddTopicDialogVisible) {
          this.tableHeight = this.tableHeight - 62
        } else {
          this.tableHeight = this.tableHeight + 62
        }
      }
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => item.is_closed === false)
    },
    onRelationIssueDialog(id) {
      this.$set(this.issueDetail, 'visible', true)
      this.$set(this.issueDetail, 'id', id)
    },
    handleRelationUpdate() {
      this.$nextTick(() => {
        this.$refs.WBS.loadData()
      })
    },
    handleRelationDelete() {
      this.$set(this.issueDetail, 'visible', false)
      this.$set(this.issueDetail, 'id', null)
      this.$nextTick(() => {
        this.$refs.WBS.loadData()
      })
    },
    handleRightPanelVisible() {
      this.$set(this.issueDetail, 'visible', false)
      this.$set(this.issueDetail, 'id', null)
    },
    handleRelationIssueDialogBeforeClose(done) {
      const ref = done ? 'issueDetailDialog' : 'issueDetailDrawer'
      if (!done) {
        done = () => {
          this.issueDetail.visible = false
          this.isProjectDetailPopUp = true
        }
      }
      if (this.$refs[ref].hasUnsavedChanges()) {
        this.handlePopConfirm(done)
      } else {
        done()
      }
    },
    handlePopConfirm(done) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          done()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
  transition: width 1s;
  width: 100%;
  &.is-panel {
    width: calc(100% - 750px);
    transition: width 1s;
  }
}

.rightPanel {
  width: 100%;
  max-width: 750px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  background: #fff;
}

.slide-fade-enter-active {
  transition: all .5s ease-in-out;
}
.slide-fade-leave-active {
  transition: all .5s ease-in-out;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(800px);
}

.handle-button {
  width: 35px;
  height: 50px;
  position: absolute;
  left: -35px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 50px;
  i {
    font-size: 24px;
    line-height: 50px;
  }
}
</style>
