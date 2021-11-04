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
            <gantt-elastic :tasks="listData" :options="options" />
          </div>
          <div v-if="listData.length<=0" class="align-middle">
            <el-alert type="warning">
              <h1><em class="el-icon-warning" /> {{ $t('general.NoData') }}</h1>
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
import { addIssue, getIssueFamily } from '@/api/issue'
import AddIssue from '@/components/Issue/AddIssue'
import ProjectIssueDetail from '@/views/Project/IssueDetail'
import GanttElastic from 'gantt-elastic'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwindsCssConfig'

const fullConfig = resolveConfig(tailwindConfig)

export default {
  name: 'Gantt',
  components: {
    AddIssue,
    ProjectIssueDetail,
    GanttElastic
  },
  props: {
    filterValue: {
      type: Object,
      default: () => ({})
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
    },
    tableHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    const _this = this
    this.bg = Object.freeze(fullConfig.theme.backgroundColor)
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
      treeAttrs: {
        load: this.getIssueFamilyData,
        lazy: true,
        props: {
          label: 'name',
          children: 'children',
          isLeaf: 'has_children'
        }
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
      },
      options: {
        maxHeight: this.tableHeight - 150,
        title: {
          label: 'Your project title as html (link or whatever...)',
          html: false
        },
        row: {
          height: 24
        },
        calendar: {
          hour: {
            display: false
          }
        },
        chart: {
          progress: {
            bar: false
          },
          expander: {
            display: true
          }
        },
        taskList: {
          expander: {
            straight: false
          },
          columns: [
            {
              id: 1,
              label: 'ID',
              value: 'id',
              width: 40
            },
            {
              id: 2,
              label: this.$t('Issue.name'),
              value: issue => `${issue.has_children ? `<em class="el-icon-caret-right" />` : '　'} ${issue.name}`,
              width: 200,
              expander: true,
              html: true,
              events: {
                click({ data }) {
                  if (data.has_children) {
                    _this.getIssueFamilyData(data)
                  }
                }
              },
              style: {
                'task-list-item-value-container': {
                  cursor: 'pointer'
                }
              }
            },
            {
              id: 3,
              label: this.$t('Issue.assigned_to'),
              value: (task) => task.assigned_to.name,
              width: 130,
              html: true
            },
            {
              id: 4,
              label: this.$t('Issue.StartDate'),
              value: (task) => this.$dayjs(task.start).isValid() ? this.$dayjs(task.start).format('YYYY-MM-DD') : null,
              width: 78
            },
            {
              id: 5,
              label: this.$t('Issue.EndDate'),
              value: (task) => this.$dayjs(task.end).isValid() ? this.$dayjs(task.end).format('YYYY-MM-DD') : null,
              width: 78
            },
            {
              id: 6,
              label: this.$t('Issue.tracker'),
              value: (task) => this.$t(`Issue.${task.tracker.name}`),
              width: 68
            },
            {
              id: 7,
              label: '%',
              value: 'progress',
              width: 35,
              style: {
                'task-list-header-label': {
                  'text-align': 'center',
                  width: '100%'
                },
                'task-list-item-value-container': {
                  'text-align': 'center',
                  width: '100%'
                }
              }
            }
          ]
        },
        locale: { name: this.$i18n.locale.toLowerCase() }
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'selectedProject', 'tracker', 'fixedVersionShowClosed']),
    selectedProjectId() {
      return this.selectedProject.id
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
    tableHeight(value) {
      this.options.maxHeight = value - 150
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
  created() {
    this.loadData()
  },
  async mounted() {
    // this.$set(this.$data, 'chartDateRange', [currentStart.toDate(), currentEnd.toDate()])
  },
  methods: {
    async loadData() {
      await this.fetchData()
    },
    refreshData() {
      this.setDateRange()
      this.setChartPeriod(this.period)
    },
    getParams() {
      const result = {
        parent_id: 'null',
        tracker_id: 1
      }
      if (this.sort) {
        result['sort'] = this.sort
      }
      if (!this.displayClosed) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          if (item === 'due_date_start' || item === 'due_date_end') {
            result['due_date_start'] = this.$dayjs(result['due_date_start']).isValid()
              ? this.$dayjs(result['due_date_start']).format('YYYY-MM-DD') : null
            result['due_date_end'] = this.$dayjs(result['due_date_end']).isValid()
              ? this.$dayjs(result['due_date_end']).format('YYYY-MM-DD') : null
          } else if (item === 'tags' && this.filterValue[item].length > 0) {
            result[item] = this.filterValue[item].join()
          } else {
            result[item + '_id'] = this.filterValue[item]
          }
        }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    formatIssue(issue, parentId) {
      issue.label = `${this.$t(`Issue.${issue.status.name}`)} - ${issue.name}`
      issue.start = issue.start_date || new Date()
      issue.end = issue.due_date || new Date()
      issue.progress = issue.done_ratio || 0
      issue.type = 'task'
      issue.style = {
        base: {
          fill: `${this.bg[issue.status.name.toLowerCase()]}75`,
          stroke: `${this.bg[issue.status.name.toLowerCase()]}75`
        }
      }
      if (parentId) {
        issue.parentId = parentId
      }
      return issue
    },
    async fetchData() {
      this.listLoading = true
      const resProjectIssue = await getProjectIssueList(this.selectedProjectId, this.getParams())
      // for (const issue_data of resProjectIssue.data) {
      //   issues.push(new Issue(issue_data))
      // }
      this.listData = resProjectIssue.data.map(issue => this.formatIssue(issue))
      this.listLoading = false
    },
    getOptionsData(option_name) {
      return this[option_name]
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
    async getIssueFamilyData(row) {
      if (row.id) {
        this.listLoading = true
        try {
          const family = await getIssueFamily(row.id)
          const data = family.data
          if (data.hasOwnProperty('children')) {
            data.children.forEach(issue => {
              issue = this.formatIssue(issue, row.id)
              const oldIssueIndex = this.listData.findIndex(subIssue => subIssue.id === issue.id)
              if (oldIssueIndex > 0) {
                this.$set(this.listData, oldIssueIndex, issue)
              } else {
                this.listData.push(issue)
              }
            })
          }
        } catch (e) {
          //   null
        }
        this.listLoading = false
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
          return true
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
