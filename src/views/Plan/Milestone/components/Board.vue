<template>
  <section>
    <div
      class="board"
    >
      <div class="header">
        <div
          v-for="headerName in boardHeaderName"
          :id="'card' + headerName.id"
          :key="headerName.id"
        >
          <div
            class="board-column"
            :class="getHeaderBarClassName(headerName.name)"
          >
            <div class="board-column-header">
              <div class="header-bar" />
              <el-row class="flex">
                <el-col class="text-center">
                  {{ getTranslateHeader(headerName.name) }}
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
      <div class="header" style="width: 1450px">
        <el-table
          ref="issueList"
          v-loading="listLoading"
          :element-loading-text="$t('Loading')"
          :data="listData"
          :show-header="false"
          highlight-current-row
          row-key="id"
          :tree-props="{ children: 'child' }"
          @row-contextmenu="handleContextMenu"
          @expand-change="getBoardData"
        >
          <el-table-column type="expand">
            <template slot-scope="{row}">
              <el-row 
                v-loading="row.hasOwnProperty('isLoadingFamily') && row.isLoadingFamily"
                style="background: #e8e8e8"
              >
                <div class="header">
                  <Kanban
                    v-for="classObj in boardHeaderName"
                    :id="'card_' + row.id + '_' + classObj.id"
                    :key="classObj.id"
                    :board-object="{parent_id: row.id, ...classObj}"
                    :list="boardData[row.id] ? boardData[row.id].children[classObj.id] : []"
                    :status="status"
                    :group="group"
                    :dimension="'status'"
                    :from-wbs="true"
                    @relationIssueId="onRelationIssueDialog($event, row.id, classObj.id)"
                    @update="updateIssueStatus"
                    @update-drag="quickUpdateIssue"
                    @contextmenu="handleContextMenu"
                  />
                </div>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Issue.Id')"
            show-overflow-tooltip
            prop="id"
            sortable="custom"
          >
            <template slot-scope="scope">
              <span class="text-success mr-2">#{{ scope.row.id }}</span>
              <el-tag
                v-for="item in scope.row.tags"
                :key="item.id"
                size="mini"
                class="mr-1"
              >
                [{{ item.name }}]
              </el-tag>
              {{ scope.row.name }}
              <Status
                v-if="scope.row.status.name"
                :name="$t(`Issue.${scope.row.status.name}`)"
                :type="scope.row.status.name"
              />
            </template>
          </el-table-column>
          <template slot="empty">
            <el-empty
              :description="$t('general.NoData')"
              :image-size="100"
            />
          </template>
        </el-table>
      </div>
      <transition name="slide-fade">
        <div v-if="relationIssue.visible" class="rightPanel">
          <div
            class="handle-button"
            :style="{'background-color':'#85c1e9'}"
            @click="handleRightPanelVisible"
          >
            <em class="el-icon-d-arrow-right" />
          </div>
          <ProjectIssueDetail
            :props-issue-id="relationIssue.id"
            :is-in-dialog="true"
            :is-from-board="true"
            @delete="handleRelationDelete"
          />
        </div>
      </transition>
      <ContextMenu
        ref="contextmenu"
        :visible="contextMenu.visible"
        :row="contextMenu.row"
        :filter-column-options="filterOptions"
        :selection-options="contextOptions"
      />
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { CancelRequest } from '@/newMixins'
import { getProjectIssueList } from '@/api_v2/projects'
import { Tracker, Priority, Status, ContextMenu } from '@/components/Issue'
import { updateIssue, getIssueFamily } from '@/api/issue'
import { Kanban } from '@/views/Project/IssueBoards/components'
import ProjectIssueDetail from '@/views/Project/IssueDetail/'

const contextMenu = {
  row: {
    fixed_version: { id: 'null' },
    assigned_to: { id: 'null' }
  },
  visible: false,
  left: 0,
  top: 0
}

export default {
  name: 'Board',
  components: {
    ContextMenu,
    Kanban,
    ProjectIssueDetail,
    // eslint-disable-next-line vue/no-unused-components
    Tracker, Priority, Status
  },
  mixins: [CancelRequest],
  props: {
    filterValue: {
      type: Object,
      default: () => ({})
    },
    keyword: {
      type: String,
      default: null
    },
    columns: {
      type: Array,
      default: () => []
    },
    assignedTo: {
      type: Array,
      default: () => []
    },
    fixedVersion: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => []
    },
    tableHeight: {
      type: Number,
      default: 0
    },
    displayClosed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      listLoading: false,
      listData: [],
      updateLoading: false,
      editRowId: null,
      contextMenu: contextMenu,
      isLoadingFamily: false,
      group: 'mission',
      boardData: {},
      originalChildren: {},
      relationIssue: {
        visible: false,
        id: null
      },
      filterOptions: [{
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
      {
        id: 3,
        label: this.$t('Issue.FilterDimensions.tracker'),
        value: 'tracker',
        placeholder: 'Type',
        tag: true
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
      }]
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'priority', 'tracker', 'status', 'userId', 'userRole', 'strictTracker']),
    assigned_to() {
      return this.assignedTo
    },
    fixed_version() {
      return this.fixedVersion
    },
    boardHeaderName() { 
      return [{
        id: 1,
        name: 'Active'
      }, {
        id: 2,
        name: 'Assigned'
      }, {
        id: 3,
        name: 'InProgress'
      }, {
        id: 4,
        name: 'Solved'
      }, {
        id: 5,
        name: 'Verified'
      }]
    },
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version', 'tags']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
    },
    getHeaderBarClassName() {
      return function (name) {
        return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      }
    },
    permission() {
      return ['Administrator', 'Project Manager', 'Engineer']
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    getParams() {
      // const tracker = this.tracker.find((item) => item.name === 'Epic')
      const result = {
        parent_id: 'null',
        with_point: true,
        sort: 'subject:dec'
        // tracker_id: tracker ? tracker.id : 1
      }
      if (!this.displayClosed) {
        result['status_id'] = 'open'
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          if (item === 'due_date_start' || item === 'due_date_end') {
            result['due_date_start'] = this.$dayjs(this.filterValue['due_date_start']).isValid()
              ? this.$dayjs(this.filterValue['due_date_start']).format('YYYY-MM-DD')
              : null
            result['due_date_end'] = this.$dayjs(this.filterValue['due_date_end']).isValid()
              ? this.$dayjs(this.filterValue['due_date_end']).format('YYYY-MM-DD')
              : null
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
      result['only_superproject_issues'] = !!this.filterValue.project
      return result
    },
    async loadData() {
      if (this.listLoading) {
        this.cancelRequest()
      }
      if (this.selectedProjectId === -1) return
      this.listData = []
      this.listData = await this.fetchData()
    },
    async fetchData() {
      if (!this.selectedProjectId) return
      this.listLoading = true
      const res = await getProjectIssueList(this.filterValue.project || this.selectedProjectId, this.getParams(), { cancelToken: this.cancelToken })
      if (res.hasOwnProperty('data')) {
        this.listLoading = false
        const result = res.data.filter(row => row.has_children === true)
        return Promise.resolve(result.map((item) => this.issueFormatter(item)))
      }
    },
    issueFormatter(issue) {
      if (Object.keys(issue.assigned_to).length <= 0) {
        issue.assigned_to = { id: null }
      }
      if (Object.keys(issue.fixed_version).length <= 0) {
        issue.fixed_version = { id: null }
      }
      issue.start_date = issue.start_date ? new Date(issue.start_date) : null
      issue.due_date = issue.due_date ? new Date(issue.due_date) : null
      return issue
    },
    getContextMenuCurrentValue(column, item) {
      return this.contextMenu.row[column].map((subItem) => subItem.id).includes(item.id)
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    handleContextMenu(row, column, event) {
      if (parseInt(row.id)) {
        event.preventDefault()
        const eventX = event.pageX
        const eventY = event.pageY
        this.$refs.contextmenu.$refs.contextmenu.show()
        const contextmenu = this.$refs.contextmenu.$refs.contextmenu
        this.$nextTick(() => {
          const contextmenuPosition = {
            top: eventY,
            left: eventX
          }
          const contextmenuWidth = contextmenu.$el.clientWidth
          const contextmenuHeight = contextmenu.$el.clientHeight
          if (contextmenuWidth <= 50) {
            this.handleContextMenu({ row, column, event })
          }
          if (contextmenuHeight + eventY >= window.innerHeight) {
            contextmenuPosition.top -= contextmenuHeight
          }
          if (contextmenuWidth + eventX >= window.innerWidth) {
            contextmenuPosition.left -= contextmenuWidth
          }
          this.contextMenu.top = contextmenuPosition.top
          this.contextMenu.left = contextmenuPosition.left
          this.contextMenu.row = row
          this.contextMenu.visible = true
          contextmenu.style = {
            top: `${this.contextMenu.top}px`,
            left: `${this.contextMenu.left}px`
          }
          document.addEventListener('click', this.hideContextMenu)
        })
      }
    },
    hideContextMenu() {
      this.contextMenu.visible = false
      document.removeEventListener('click', this.hideContextMenu)
    },
    async getBoardData(row, expandedRows) {
      this.expandedRow = expandedRows
      if (expandedRows.find((item) => item.id === row.id)) {
        try {
          await this.$set(row, 'isLoadingFamily', true)
          const res = await getIssueFamily(row.id)
          this.originalChildren[row.id] = res.data.children
          this.$set(row, 'children', this.classifyIssue(res.data.children))
          this.$set(row, 'isLoadingFamily', false)
          this.boardData[row.id] = row
        } catch (e) {
          //   null
          return Promise.resolve()
        }
      }
      return Promise.resolve()
    },
    classifyIssue(children) {
      const data = this.checkGroupByValueOnBoard()
      children.forEach((issue) => {
        if (issue) {
          const dimensionName = issue.status.id ? issue.status.id : 'null'
          data[dimensionName].push(issue)
        }
      })
      return this.sortIssue(data)
    },
    checkGroupByValueOnBoard() {
      const data = {}
      this.boardHeaderName.forEach((dimension) => {
        data[dimension.id] = []
      })
      return data
    },
    sortIssue(data) {
      const sortUpdateOn = (a, b) => new Date(b.updated_on) - new Date(a.updated_on)
      Object.keys(data).forEach((item) => {
        this.$set(data, item, data[item].sort(sortUpdateOn))
      })
      return data
    },
    async updateIssueStatus(evt, parentId) {
      if (evt.event.hasOwnProperty('added')) {
        try {
          const updatedData = { [`status_id`]: evt.boardObject.id, [`parent_id`]: evt.boardObject.parent_id }
          const issueId = evt.event.added.element.id
          const newData = await this.updatedIssue(issueId, updatedData)
          const oldParentId = evt.event.remove.element.id
          this.setProjectIssueList(newData, parentId, oldParentId)
        } catch (e) {
          // error
        } finally {
          // this.setProjectIssueList(newData, parentId)
          // this.$emit('getRelativeList')
        }
      }
    },
    async updatedIssue(id, updatedData) {
      const res = await updateIssue(id, updatedData)
      return res.data
      // await this.updateRelationIssue(this.originalChildren[parentId], res.data)
    },
    setProjectIssueList(newData, parentId, oldParentId) {
      if (parentId !== oldParentId) {
        const idx = this.originalChildren[oldParentId].findIndex((item) => item.id === newData.id)
        const issue = this.originalChildren[parentId].find((item) => item.id === newData.id)
        this.$delete(this.originalChildren[oldParentId], idx)
        this.originalChildren[parentId].push(issue)
      } else {
        const idx = this.originalChildren[oldParentId].findIndex((item) => item.id === newData.id)
        const issue = this.originalChildren[parentId].find((item) => item.id === newData.id)
        this.$set(this.originalChildren[parentId], idx, issue)
      }
      this.$set(this.boardData[parentId], 'children', this.classifyIssue(this.originalChildren[parentId]))
      // this.$emit('updateIssueList', idx, issue)
    },
    updateRelationIssue(list, updatedIssue) {
      list.forEach((issue) => {
        if (issue.hasOwnProperty('parent') && issue.parent.id === updatedIssue.id) {
          this.$set(issue, 'parent', updatedIssue)
        }
        this.handleUpdatedIssue('children', updatedIssue)
        this.handleUpdatedIssue('relations', updatedIssue)
      })
    },
    handleUpdatedIssue(key, updatedIssue) {
      if (updatedIssue.hasOwnProperty(key)) this.setUpdatedIssue(key, updatedIssue)
    },
    setUpdatedIssue(key, updatedIssue) {
      const idx = updatedIssue[key].findIndex((item) => item.id === issue.id)
      const issue = updatedIssue[key].find((item) => item.id === issue.id)
      this.$set(issue[key], idx, issue)
    },
    async quickUpdateIssue(event) {
      const { id, params } = event
      this.$parent.isLoading = true
      const filterDimension = Object.keys(params)[0]
      const data = this.handleFilterArrayData(params)
      try {
        await this.updatedIssue(id, data)
      } catch (e) {
        // error
      } finally {
        const idx = this.projectIssueList.findIndex((item) => item.id === id)
        const issue = this.projectIssueList.find((item) => item.id === id)
        issue[filterDimension] = params[filterDimension]
        this.$emit('updateIssueList', idx, issue)
      }
      this.$parent.isLoading = false
    },
    handleFilterArrayData(value) {
      const filterDimension = Object.keys(value)[0]
      let data = { [`${filterDimension}_id`]: value[filterDimension].id }
      if (Array.isArray(value[filterDimension])) {
        data = { [filterDimension]: value[filterDimension].map((item) => item.id).join(',') }
      }
      return data
    },
    onRelationIssueDialog(id, rowId, element) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
      this.$emit('relation-issue', true)
      this.scrollTo(rowId, element)
    },
    handleRelationDelete() {
      this.$set(this.relationIssue, 'visible', false)
      this.$set(this.relationIssue, 'id', null)
      this.$emit('relation-issue', false)
    },
    handleRightPanelVisible() {
      this.$set(this.relationIssue, 'visible', false)
      this.$emit('relation-issue', false)
    },
    scrollTo(rowId, target) {
      var element = document.getElementById('card_' + rowId + '_' + target)
      this.$nextTick(() => {
        element.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.board-column {
  width: 280px;
  margin: 10px 5px 10px 5px;
  flex: 0 0 280px;
  // padding-bottom: 20px;
  @apply overflow-hidden bg-white rounded-md border-solid border border-gray-300;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    @apply overflow-hidden;

    .header-bar {
      height: 3px;
      @apply bg-red-500;
    }
  }

  .board-column-content {
    border: 10px solid transparent;
    height: 95%;
    @apply overflow-x-hidden overflow-y-auto space-y-4;

    .quick-add {
      padding: 10px 10px 0 10px;
    }

    .board-item {
      cursor: pointer;
      width: 95%;
      height: auto;
      text-align: left;
      line-height: 20px;
      box-sizing: border-box;
      border: 1px solid #e9e9e9;
      @apply shadow-md bg-white rounded-md border-solid border border-gray-300 mx-auto;
      font-size: 16px;

      &-ban {
        pointer-events: none;
        opacity: 0.4;
      }

      .tags {
        @apply mr-1;
      }

      .add-button {
        transition: transform 0.6s;
        @apply m-3;
        &.rotate {
          transform: rotate(225deg);
        }
      }

      &.item {
        cursor: move;
      }

      .progress-bar {
        @apply bg-active rounded-full;
        height: 5px;

        &.success {
          @apply bg-success;
        }

        &.danger {
          @apply bg-danger;
        }

        &.warning {
          @apply bg-warning;
        }
      }

      .title {
        @apply m-3 flex justify-between content-start;

        .text {
          @apply cursor-pointer text-left text-primary font-bold break-all;
        }

        .action {
          @apply flex cursor-pointer w-5 h-5;
          .icon {
            @apply bg-gray-200 text-black rounded-md text-center align-middle px-1;
          }
        }
      }

      .relation {
        .parent {
          @apply m-3;
          font-size: 0.75em;

          .el-tag {
            font-size: 0.5em;
          }

          .Active {
            @apply bg-active;
          }

          .Assigned {
            @apply bg-assigned;
          }

          .Solved {
            @apply bg-solved;
          }

          .InProgress {
            @apply bg-inProgress;
          }

          .Verified {
            @apply bg-finished;
          }

          .Closed {
            @apply bg-closed;
          }
        }

        .children_list {
          margin: 0;
        }

        >>> .el-collapse-item {
          &__header {
            height: 2.5em;
          }

          &__content {
            padding-bottom: 0;
          }
        }
      }

      .issue-status-tags {
        font-size: 1em;
        @apply mx-3 mb-1;

        .tracker {
          font-size: 0.8em;
        }
      }

      .info {
        @apply flex border-0 border-t border-solid border-gray-200 divide-x divide-solid divide-gray-200 rounded-b-md;
        .detail {
          min-width: 0;
          font-size: 1em;
          line-height: 1em;
          padding: 0 3px;
          @apply ml-1 flex flex-1 py-2 border-0;
          .text {
            @apply truncate;
          }

          em {
            @apply mr-0.5 text-gray-400;
          }
        }

        .due_date {
          .danger {
            font-weight: 900;
            color: #f56c6c;
          }

          .warning {
            font-weight: 500;
            color: #d27e00;
          }
        }
      }

      .no-info {
        @apply mb-3;
      }
    }
  }

  &.active {
    .board-column-header {
      .header-bar {
        @apply bg-active;
      }
    }
  }

  &.assigned {
    .board-column-header {
      .header-bar {
        @apply bg-assigned;
      }
    }
  }

  &.solved {
    .board-column-header {
      .header-bar {
        @apply bg-solved;
      }
    }
  }

  &.inprogress {
    .board-column-header {
      .header-bar {
        @apply bg-inProgress;
      }
    }
  }

  &.verified {
    .board-column-header {
      .header-bar {
        @apply bg-finished;
      }
    }
  }

  &.closed {
    .board-column-header {
      .header-bar {
        @apply bg-closed;
      }
    }
  }
}

.board {
  height: calc(100vh - 70px - 40px - 40px - 25px - 10px);
  overflow-x: auto;
  transition: width 1s;
  .header {
    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
}
.current {
  @apply text-success font-bold;
}

.menu-remove {
  @apply text-danger font-bold;
}

>>> .cursor-context-menu {
  cursor: context-menu;
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
  width: 50px;
  height: 50px;
  position: absolute;
  left: -50px;
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
