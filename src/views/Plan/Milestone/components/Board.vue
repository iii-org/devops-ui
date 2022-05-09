<template>
  <section>
    <div
      class="board"
      :class="{'is-panel':false}"
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
      <el-row>
        <el-table
          ref="issueList"
          v-loading="listLoading"
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
              <!-- <ExpandSection
                :issue="row"
                @update-list="fetchData"
                @on-context-menu="onContextMenu"
                @collapse-expend-row="collapseExpendRow"
              /> -->
              {{ row }}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Issue.Id')"
            min-width="280"
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
      </el-row>
      <contextmenu ref="contextmenu">
        <template v-if="Object.keys(contextMenu.row).length > 2">
          <contextmenu-item class="menu-title">{{ contextMenu.row.name }}</contextmenu-item>
          <contextmenu-submenu
            v-permission="permission"
            :title="$t('Issue.tags')"
          >
            <contextmenu-item
              v-for="item in tags"
              :key="item.id"
              :class="{current:getContextMenuCurrentValue('tags', item), [item.class]:item.class}"
              @click="handleUpdateIssue({value:{'tags':item.id}, row:contextMenu.row})"
            >
              <em
                v-if="getContextMenuCurrentValue('tags', item)"
                class="el-icon-check"
              />
              <em
                v-if="item.id==='null'"
                class="el-icon-circle-close"
              />
              {{ item.name }} {{ item.message }}
            </contextmenu-item>
          </contextmenu-submenu>
          <contextmenu-item
            v-permission="permission"
            divider
          />
          <contextmenu-item @click="onRelationIssueDialog(contextMenu.row.id)">
            {{ $t('route.Issue Detail') }}
          </contextmenu-item>
          <contextmenu-item @click="toggleIssueMatrixDialog(contextMenu.row)">
            {{ $t('Issue.TraceabilityMatrix') }}
          </contextmenu-item>
          <contextmenu-item
            v-permission="permission"
            divider
          />
          <contextmenu-item
            v-permission="permission"
            @click="appendIssue(contextMenu.row)"
          >
            {{ $t('Issue.AddIssue') }}
          </contextmenu-item>
          <contextmenu-submenu
            v-permission="permission"
            :title="$t('Issue.ChildrenIssue')"
          >
            <contextmenu-item
              v-permission="permission"
              @click="toggleRelationDialog('Children')"
            >
              {{ $t('general.Settings', { name: $t('Issue.ChildrenIssue') }) }}
            </contextmenu-item>
            <contextmenu-item
              v-permission="permission"
              @click="appendIssue(contextMenu.row, true)"
            >
              {{ $t('Issue.AddSubIssue') }}
            </contextmenu-item>
          </contextmenu-submenu>
          <contextmenu-item
            v-permission="permission"
            @click="appendIssue(contextMenu.row, false, contextMenu.row)"
          >
            {{ $t('Issue.CopyIssue') }}
          </contextmenu-item>
          <contextmenu-item
            v-permission="permission"
            divider
          />
          <contextmenu-item
            v-permission="permission"
            class="menu-remove"
            @click="handleRemoveIssue(contextMenu.row, 'Delete', false)"
          >
            <em class="el-icon-delete">{{ $t('general.Delete') }}</em>
          </contextmenu-item>
        </template>
      </contextmenu>
    </div>
  </section>
</template>

<script>
import { directive, Contextmenu, ContextmenuItem, ContextmenuSubmenu } from 'v-contextmenu'
import { mapGetters } from 'vuex'
import { CancelRequest } from '@/newMixins'
import { getProjectIssueList } from '@/api_v2/projects'
import { Tracker, Priority, Status } from '@/components/Issue'

export default {
  name: 'Board',
  components: {
    Contextmenu,
    ContextmenuItem,
    ContextmenuSubmenu,
    // eslint-disable-next-line vue/no-unused-components
    Tracker, Priority, Status
  },
  directives: {
    contextmenu: directive
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
      contextMenu: { visible: true, row: {}}
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'priority', 'tracker', 'status', 'userId', 'userRole', 'strictTracker']),
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
    getHeaderBarClassName() {
      return function (name) {
        console.log(name)
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
      console.log(this.getParams())
      console.log(res)
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
        this.$refs.contextmenu.show()
        this.$nextTick(() => {
          const contextmenuPosition = {
            top: eventY,
            left: eventX
          }
          const contextmenuWidth = this.$refs.contextmenu.$el.clientWidth
          const contextmenuHeight = this.$refs.contextmenu.$el.clientHeight
          if (contextmenuWidth <= 50) {
            this.handleContextMenu(row, column, event)
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
          this.$refs.contextmenu.style = {
            top: this.contextMenu.top + 'px',
            left: this.contextMenu.left + 'px'
          }
          document.addEventListener('click', this.hideContextMenu)
        })
      }
    },
    getBoardData(data) {
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped>
.board-column {
  width: 280px;
  margin: 0 5px 20px 5px;
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

  &.is-panel {
    width: calc(100% - 750px);
    transition: width 1s;
  }
}
</style>
