<template>
  <div>
    <el-row :gutter="10" class="content">
      <el-col :span="24">
        <el-card v-loading="listLoading" :element-loading-text="$t('Loading')">
          <el-form inline>
            <el-form-item :label="$t('ProjectRoadmap.DisplayRange')">
              <el-date-picker
                v-model="chartDateRange"
                type="daterange"
                :clearable="false"
              />
            </el-form-item>
            <el-form-item>
              <el-button icon="el-icon-refresh" @click="refreshData" />
            </el-form-item>
          </el-form>
          <div class="gantt-chart">
            <div id="gantt" />
            <div class="toolbar">
              <el-radio-group v-model="period" type="button">
                <el-radio-button v-for="periodItem in periodOptions" :key="periodItem.period" :label="periodItem.period"
                                 :class="periodItem.class"
                >
                  {{ periodItem.name }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div v-if="listData.length<=0" class="align-middle">
            <el-alert type="warning">
              <h1><i class="el-icon-warning" /> {{ $t('general.NoData') }}</h1>
            </el-alert>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
      :title="$t('Issue.AddIssue')"
      :visible.sync="addTopicDialog.visible"
      width="50%"
      top="5px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <AddIssue ref="AddIssue"
                :project-id="selectedProjectId"
                :parent-id="addTopicDialog.parentId"
                :parent-name="addTopicDialog.parentName"
                :save-data="saveIssue"
                import-from="list"
                @loading="loadingUpdate"
                @add-topic-visible="handleCloseDialog"
      />
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" @click="handleAdvancedClose">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" :loading="addTopicDialog.LoadingConfirm" type="primary"
                   @click="handleAdvancedSave"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close
               :before-close="handleRelationIssueDialogBeforeClose"
    >
      <ProjectIssueDetail v-if="relationIssue.visible"
                          ref="children"
                          :props-issue-id="relationIssue.id"
                          :is-in-dialog="true"
                          @update="handleRelationUpdate"
                          @delete="handleRelationUpdate"
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectIssueList } from '@/api/projects'
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt'
import { addIssue, getIssueFamily } from '@/api/issue'
import moment from 'moment'
import AddIssue from '@/components/Issue/AddIssue'
import ProjectIssueDetail from '../../../Plugin/QA/views/Project/IssueDetail'
import jquery from 'jquery'

const currentStart = moment().startOf('year')
const currentEnd = moment().endOf('year')
const columnWidth = 35
const defaultWidth = columnWidth * 52
const timeRanges = [
  {
    id: 0,
    from: moment('1999-01-01', 'YYYY-MM-DD'),
    to: moment(),
    classes: ['beforeTime'],
    label: '',
    enableDragging: false
  }
]
const defaultSetting = {
  headers: [
    {
      unit: 'month',
      format: 'YYYY-MM'
    },
    {
      unit: 'week',
      format: 'WW'
    }
  ],
  columnUnit: 'week'
}
const defaultFromTo = {
  from: currentStart,
  to: currentEnd
}

export default {
  name: 'Gantt',
  components: {
    AddIssue,
    ProjectIssueDetail
  },
  props: {
    filterValue: {
      type: Object,
      default: () => {}
    },
    keyword: {
      type: String,
      default: null
    },
    assignedTo: {
      type: Array,
      default: () => []
    },
    fixedVersion: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listLoading: false,
      contentLoading: false,
      activeNames: '',
      searchVisible: false,
      displayClosed: false,
      status: [],
      priority: [],

      listData: [],
      activeIndex: [],
      dateRange: null,
      chartDateRange: [],
      period: 'week',
      duration: 52,
      options: {
        rows: [],
        tasks: [],
        timeRanges,
        ...defaultSetting,
        ...defaultFromTo,
        tableHeaders: [
          {
            title: this.$t('Issue.tracker'),
            property: 'label',
            width: 140,
            type: 'tree'
          }
        ],
        minWidth: defaultWidth,
        fitWidth: true,
        columnOffset: 1,
        tableWidth: 240,
        ganttTableModules: [SvelteGanttTable],
        addButton: true,
        onAddButtonClick: (row) => {
          this.addIssue(row.model)
        },
        onTaskButtonClick: (task) => this.onRelationIssueDialog(task.id)
      },
      addTopicDialog: {
        visible: false,
        parentId: 0,
        parentName: null,
        LoadingConfirm: false
      },
      relationIssue: {
        visible: false,
        id: null
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'selectedProject', 'tracker', 'fixedVersionShowClosed']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    periodOptions() {
      return [
        {
          name: this.$t('general.week'),
          period: 'week',
          startOf: 'month',
          value: defaultSetting
        },
        {
          name: this.$t('general.month'),
          period: 'month',
          startOf: 'year',
          value: {
            headers: [
              {
                unit: 'year',
                format: 'YYYY'
              },
              {
                unit: 'month',
                format: 'MM'
              }
            ]
          }
        },
        {
          name: this.$t('general.year'),
          period: 'year',
          startOf: 'year',
          value: {
            headers: [
              {
                unit: 'year',
                format: 'YYYY'
              }
            ]
          }
        }
      ]
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
      for (const item of Object.keys(this.originFilterValue)) {
        const checkFilterValue = this.originFilterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.filterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
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
    period(value) {
      this.setChartPeriod(value)
    },
    dateRange: {
      deep: true,
      immediate: false,
      handler() {
        this.loadData()
      }
    },
    chartDateRange: {
      deep: true,
      handler() {
        this.setDateRange()
        this.setChartPeriod(this.period)
      }
    }
  },
  async mounted() {
    this.$set(this.$data, 'chartDateRange', [currentStart.toDate(), currentEnd.toDate()])
    this.gantt = new SvelteGantt({
      // target a DOM element
      target: document.getElementById('gantt'),
      // svelte-gantt options
      props: this.options
    })
  },
  methods: {
    async loadData() {
      await this.fetchData()
      await this.paintGantt()
    },
    paintGantt() {
      const rows = this.listData.map((issue) => (this.parseRowFormat(issue, this.listData)))
      const tasks = this.flattenTask(this.listData).map((issue) => (this.parseTaskFormat(issue))).filter((task) => (task.from && task.to))
      if (this.gantt) {
        const tracker = this.tracker.find((search) => (search.id === this.filterValue['tracker']))
        if (tracker) {
          this.gantt.$set({ tableHeaders: [
            {
              title: this.$t('Issue.' + tracker.name),
              property: 'label',
              width: 140,
              type: 'tree'
            }
          ] })
        }
        this.gantt.$set({
          rows: rows,
          tasks: tasks,
          zoomLevels: this.periodOptions.map((item) => (item.value))
        })
        this.$nextTick(() => {
          jquery('.sg-timeline-body').animate({ scrollLeft: jquery('.sg-time-range-handle-right').position().left }, 100)
        })
      }
    },
    setChartPeriod(value) {
      const period = this.periodOptions.find((item) => (item.period === value))
      if (period && this.gantt) {
        this.gantt.$set({
          ...period.value,
          minWidth: columnWidth * this.duration.as(this.period),
          columnUnit: this.period
        })
        this.$nextTick(() => {
          jquery('.sg-timeline-body').animate({ scrollLeft: jquery('.sg-time-range-handle-right').position().left }, 100)
        })
      }
    },
    setDateRange() {
      if (this.chartDateRange.length > 0) {
        const due_date = this.chartDateRange.map((item) => (moment(item)))
        this.duration = moment.duration(due_date[1].diff(due_date[0]))
        if (this.gantt) {
          this.gantt.$set({ from: due_date[0], to: due_date[1] })
        }
      }
    },
    refreshData() {
      this.setDateRange()
      this.setChartPeriod(this.period)
    },
    getParams() {
      const result = {
        parent_id: 'null'
      }
      if (this.dateRange) {
        const due_date = this.dateRange.map((item) => (moment(item).format('YYYY-MM-DD')))
        result['due_date_start'] = due_date[0]
        result['due_date_end'] = due_date[1]
      }
      if (this.sort) {
        result['sort'] = this.sort
      }
      if (!this.displayClosed) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          result[item + '_id'] = this.filterValue[item]
        }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    async fetchData() {
      this.listLoading = true
      const resProjectIssue = await getProjectIssueList(this.selectedProjectId, this.getParams())
      // const issues = []
      // for (const issue_data of resProjectIssue.data) {
      //   issues.push(new Issue(issue_data))
      // }
      this.listData = resProjectIssue.data
      this.listLoading = false
    },
    getOptionsData(option_name) {
      return this[option_name]
    },
    parseRowFormat(issue, issueList) {
      return {
        id: issue.id,
        classes: (issue.tracker && issue.tracker.hasOwnProperty('name')) ? [issue.tracker.name] : null,
        label: (issue.name) ? issue.name : issue.subject,
        has_children: issue.has_children,
        click: (issue.has_children) ? this.toggleIssueFamily : null,
        children: (issue.children) ? issue.children.map((subIssue) => (this.parseRowFormat(subIssue, issue.children))) : null,
        issue: issue,
        issueList: issueList
      }
    },
    parseTaskFormat(issue) {
      const _this = this
      const taskLabel = function() {
        if (!(issue.status && issue.status.hasOwnProperty('name'))) return null
        const result = []
        let done_ratio = ''
        result.push('#' + issue.id)
        if (_this.filterValue.hasOwnProperty('tracker') && issue.tracker.id !== _this.filterValue.tracker) {
          result.push(_this.$t('Issue.' + issue.tracker.name))
        }
        if (issue.done_ratio > 0) {
          done_ratio = ' (' + issue.done_ratio + '%)'
        }
        result.push(_this.$t('Issue.' + issue.status.name) + done_ratio)
        return result.join(' - ')
      }
      return {
        id: issue.id,
        resourceId: issue.id,
        classes: (issue.status && issue.status.hasOwnProperty('name')) ? [issue.status.name] : [],
        from: moment(issue.start_date, 'YYYY-MM-DD'),
        to: moment(issue.due_date, 'YYYY-MM-DD'),
        label: taskLabel(),
        enableDragging: false,
        amountDone: issue.done_ratio
      }
    },
    flattenTask(issueList) {
      let result = []
      issueList.forEach((item) => {
        result.push(item)
        if (item.hasOwnProperty('children')) {
          result = result.concat(this.flattenTask(item.children))
        }
      })
      return result
    },
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      if (item.hasOwnProperty('login')) {
        result += ' (' + (item.login) + ')'
      }
      return result
    },
    async toggleIssueFamily(row) {
      this.listLoading = true
      await this.getIssueFamilyData(row.model)
      await this.paintGantt()
      this.listLoading = false
    },
    async getIssueFamilyData(row) {
      try {
        const family = await getIssueFamily(row.id)
        const data = family.data
        if (data.hasOwnProperty('children')) {
          const find = row.issueList.find((issue) => (issue === row.issue))
          this.$set(find, 'children', data.children)
        }
      } catch (e) {
        //   null
      }
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    onChangeFilter() {
      this.loadData()
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
      this.onChangeFilter()
    },
    handleSave() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.form))
          Object.keys(data).map(item => {
            if (data[item] === '' || data[item] === 'null' || !data[item]) delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
          // if (this.parentId) form.append('parent_id', this.parentId)
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          // if (this.uploadFileList.length > 0) {
          //   form.append('upload_file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
          // }
          this.LoadingConfirm = true
          await this.saveIssue(form)
          this.LoadingConfirm = false
          this.form.tracker_id = data.tracker_id
        } else {
          return false
        }
      }
      )
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then(res => {
          // noinspection JSCheckFunctionSignatures
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.loadData()
          this.addTopicDialogVisible = false
          return res
        })
        .catch(error => {
          return error
        })
    },
    handleClose() {
      this.$emit('close-dialog', false)
    },
    handleCloseDialog() {
      this.addTopicDialog.visible = false
    },
    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
    },
    handleAdvancedSave() {
      this.$refs['AddIssue'].handleSave()
    },
    addIssue(row) {
      this.addTopicDialog.visible = true
      this.addTopicDialog.parentId = row.id
      this.addTopicDialog.parentName = row.label
    },
    loadingUpdate(value) {
      this.LoadingConfirm = value
    },
    handleRelationUpdate() {
      this.onCloseRelationIssueDialog()
      this.loadData()
      this.$emit('update-issue')
    },
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
    },
    onCloseRelationIssueDialog() {
      this.$set(this.relationIssue, 'visible', false)
      this.$set(this.relationIssue, 'id', null)
    },
    handleRelationIssueDialogBeforeClose(done) {
      if (this.$refs.children.hasUnsavedChanges()) {
        this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            done()
          })
          .catch(() => {
          })
      } else {
        done()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../node_modules/svelte-gantt/css/svelteGantt.css";
@import '../../../../styles/variables';

.app-container {
  @apply h-screen overflow-hidden;
}

$max_height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);

.content {
  max-height: $max_height !important;
  //navbar, padding, project selector,divider
  .el-col {
    max-height: inherit;

    .el-card {
      max-height: inherit;

      > > > .el-card__body {
        max-height: inherit;
      }

      .gantt-chart {
        max-height: calc(#{$max_height} - 40px - 60px);
        @apply static;
        .toolbar {
          @apply absolute bottom-10 right-10 z-50;
        }

        > > > #gantt {
          max-height: inherit;

          .sg-gantt {
            max-height: inherit;

            .sg-time-range {
              background-image: linear-gradient(-45deg, rgba(0, 0, 0, 0) 46%, #6b728070 49%, #6b728070 51%, rgba(0, 0, 0, 0) 55%) !important;
            }

            .sg-task-reflected {
              display: none;
            }

            .sg-table {
              .add-task {
                display: none;
              }
            }

            .sg-task {
              @apply cursor-pointer;
              color: #333;
              text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;

              &.Active {
                @apply bg-active bg-opacity-75;
              }

              &.Assigned {
                @apply bg-danger bg-opacity-75;
              }

              &.Closed {
                @apply bg-info bg-opacity-75;
              }

              &.Solved {
                @apply bg-secondary bg-opacity-75;
              }

              &.InProgress {
                @apply bg-warning bg-opacity-75;
              }

              &.Finished {
                @apply bg-warning bg-opacity-75;
              }
            }
          }
        }
      }
    }
  }
}
</style>