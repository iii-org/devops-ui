<template>
  <div class="app-container">
    <project-list-selector>
      <el-button
        id="btn-add-issue"
        slot="button"
        type="success"
        icon="el-icon-plus"
        :disabled="selectedProjectId === -1"
        @click="handleQuickAddClose"
      >
        {{ $t('Issue.AddIssue') }}
      </el-button>
      <el-popover
        placement="bottom"
        trigger="click"
      >
        <el-form v-loading="listLoading">
          <template v-for="dimension in filterOptions">
            <el-form-item :key="dimension.id">
              <div slot="label">
                {{ $t('Issue.' + dimension.value) }}
                <el-tag v-if="dimension.value==='fixed_version'" type="info" class="flex-1">
                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
                </el-tag>
              </div>
              <el-select
                v-model="filterValue[dimension.value]"
                :placeholder="$t('Issue.Select'+dimension.placeholder)"
                :disabled="selectedProjectId === -1"
                filterable
                clearable
                @change="onChangeFilter"
              >
                <el-option
                  v-for="item in (dimension.value==='status')? filterClosedStatus(getOptionsData(dimension.value)):getOptionsData(dimension.value)"
                  :key="(dimension.value==='assigned_to')? item.login: item.id"
                  :label="getSelectionLabel(item)"
                  :class="{[item.class]:item.class}"
                  :value="item.id"
                >
                  <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">
            <el-checkbox v-model="displayClosed" @change="onChangeFilter" />
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
        @change="onChangeFilter"
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
    </project-list-selector>
    <el-divider />
    <quick-add-issue
      ref="quickAddIssue"
      :save-data="saveIssue"
      :project-id="selectedProjectId"
      :visible.sync="quickAddTopicDialogVisible"
      @add-issue="advancedAddIssue"
    />
    <el-row v-loading="listLoading"
            :element-loading-text="$t('Loading')"
    >
      <el-table
        ref="issueList"
        :data="listData"
        fit
        highlight-current-row
        row-key="id"
        height="60vh"
        :row-class-name="getRowClass"
        @row-contextmenu="handleContextMenu"
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="scope">
            <el-row v-if="scope.row.family"
                    v-loading="scope.row.hasOwnProperty('isLoadingFamily')&&scope.row.isLoadingFamily"
            >
              <div v-if="scope.row.hasOwnProperty('isLoadingFamily') && scope.row.isLoadingFamily" class="p-5" />
              <ul v-else>
                <li v-if="scope.row.hasOwnProperty('parent') && Object.keys(scope.row.parent).length > 0">
                  <b>{{ $t('Issue.ParentIssue') }}:</b>
                  <el-link
                    :style="{ 'font-size': '14px', cursor: 'pointer' }"
                    :underline="false"
                    @click="handleEdit(scope.row.parent.id)"
                    @contextmenu.native="handleContextMenu(scope.row.parent, '', $event)"
                  >
                    <status :name="scope.row.parent.status.name" size="mini" />
                    <tracker :name="scope.row.parent.tracker.name" />
                    #{{ scope.row.parent.id }} - {{ scope.row.parent.name }}
                    <span
                      v-if="scope.row.parent.hasOwnProperty('assigned_to') && Object.keys(scope.row.parent.assigned_to).length > 1"
                    >
                      ({{ $t('Issue.Assignee') }}: {{ scope.row.parent.assigned_to.name }}
                      - {{ scope.row.parent.assigned_to.login }})
                    </span>
                  </el-link>
                  <el-popconfirm
                    :confirm-button-text="$t('general.Remove')"
                    :cancel-button-text="$t('general.Cancel')"
                    icon="el-icon-info"
                    icon-color="red"
                    :title="$t('Issue.RemoveIssueRelation')"
                    @onConfirm="removeIssueRelation(scope.row.id)"
                  >
                    <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                      {{ $t('Issue.Unlink') }}
                    </el-button>
                  </el-popconfirm>
                </li>
                <li v-if="scope.row.hasOwnProperty('children') && scope.row.children.length>0">
                  <b>{{ $t('Issue.ChildrenIssue') }}:</b>
                  <ol>
                    <template v-for="child in scope.row.children">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        <el-link
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                          @contextmenu.native="handleContextMenu(child, '', $event)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }}
                            - {{ child.assigned_to.login }})
                          </span>
                        </el-link>
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @onConfirm="removeIssueRelation(child.id)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                            {{ $t('Issue.Unlink') }}
                          </el-button>
                        </el-popconfirm>
                      </li>
                    </template>
                  </ol>
                </li>
                <li v-if="scope.row.hasOwnProperty('relations') && scope.row.relations.length>0">
                  <b>{{ $t('Issue.RelatedIssue') }}:</b>
                  <ol>
                    <template v-for="child in scope.row.relations">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        <el-link
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                          @contextmenu.native="handleContextMenu(child, '', $event)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})
                          </span>
                        </el-link>
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @onConfirm="removeRelationIssue(child.relation_id)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                            {{ $t('Issue.Unlink') }}
                          </el-button>
                        </el-popconfirm>
                      </li>
                    </template>
                  </ol>
                </li>
              </ul>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="130" prop="tracker.id" sortable="custom">
          <template slot-scope="scope">
            <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip prop="id" sortable="custom">
          <template slot-scope="scope">
            <span class="text-success mr-2">#{{ scope.row.id }}</span>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Priority')" width="150" prop="priority.id" sortable="custom">
          <template slot-scope="scope">
            <priority v-if="scope.row.priority.name" :name="scope.row.priority.name" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150" prop="status.id" sortable="custom">
          <template slot-scope="scope">
            <status
              v-if="scope.row.status.name"
              :name="scope.row.status.name"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to.id"
                         sortable="custom" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.assigned_to.name }}</span>
            <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="pageInfo.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="handleCurrentChange"
      />
    </el-row>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="loadData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import { Table, IssueList, ContextMenu, IssueExpand } from '@/newMixins'
import { QuickAddIssue } from '@/components/Issue'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ProjectIssues',
  components: {
    QuickAddIssue,
    ProjectListSelector
  },
  mixins: [Table, IssueList, ContextMenu, IssueExpand],
  data() {
    return {
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchVisible: false,

      assigned_to: [],
      fixed_version: [],

      form: {}
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'issueListFilter', 'issueListKeyword', 'issueListDisplayClosed',
      'issueListListQuery', 'issueListPageInfo', 'initIssueList', 'fixedVersionShowClosed']),
    refTable() {
      return this.$refs['issueList']
    }
  },
  async created() {
    // TODO: RememberPageProblem
    // if (Object.keys(this.issueListListQuery).length > 0) {
    //   this.listQuery = this.issueListListQuery
    // }
    // if (Object.keys(this.issueListPageInfo).length > 0) {
    //   this.pageInfo = this.issueListPageInfo
    // }
    this.filterValue = this.issueListFilter
    this.keyword = this.issueListKeyword
    this.fixed_version_closed = this.fixedVersionShowClosed
    this.displayClosed = this.issueListDisplayClosed
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', ['setIssueListKeyword', 'setIssueListFilter', 'setFixedVersionShowClosed',
      'setIssueListDisplayClosed', 'setIssueListListQuery', 'setIssueListPageInfo', 'setInitIssueList']),
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit
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
    async onChangeFilter() {
      await this.setIssueListFilter(this.filterValue)
      await this.setIssueListKeyword(this.keyword)
      await this.setIssueListDisplayClosed(this.displayClosed)
      await this.backToFirstPage()
      await this.loadData()
    }
  }
}
</script>
