<template>
  <div class="app-container">
    <el-card>
      <el-row type="flex" align="middle" class="my-3">
        <el-col :span="6">
          <el-button type="text" size="medium" icon="el-icon-arrow-left" class="text-title" @click="onBackClick">
            {{ $t('general.Back') }}
          </el-button>
        </el-col>
        <el-col :span="12" class="text-center">
          <span class="text-xl font-medium">{{ $t('Issue.IssueList') }}：{{ userName }} </span>
        </el-col>
        <!--        <el-col :span="6" class="text-right">-->
        <!--          <el-button v-show="!isSearchVisible" type="text" icon="el-icon-search" @click="showSearchInput">-->
        <!--            {{ $t('general.Search') + (keyword ? ': ' + keyword : '') }}-->
        <!--          </el-button>-->
        <!--          <el-input-->
        <!--            v-show="isSearchVisible"-->
        <!--            ref="inputKeyword"-->
        <!--            v-model="keyword"-->
        <!--            size="small"-->
        <!--            prefix-icon="el-icon-search"-->
        <!--            :placeholder="$t('general.Search') + $t('Issue.name')"-->
        <!--            class="py-1"-->
        <!--            style="width: 210px"-->
        <!--            clearable-->
        <!--            @blur="isSearchVisible = !isSearchVisible"-->
        <!--          />-->
        <!--        </el-col>-->
      </el-row>
      <div class="flex justify-between items-center mb-2">
        <el-checkbox
          v-model="isCheckedAllIssues"
          class="ml-3"
          :disabled="listData.length < 1"
          @change="handleAllIssuesChange"
        >
          <span>{{ $t('general.SelectAll') }}</span>
        </el-checkbox>
        <div>
          <el-button
            size="mini"
            :type="hasCheckedIssues ? 'primary' : ''"
            plain
            :disabled="!hasCheckedIssues"
            @click="onBatchTransferClick"
          >
            {{ `${$t('Issue.batchTransfer')} (${checkedIssueIds.length})` }}
          </el-button>
          <el-button
            size="mini"
            :type="hasCheckedIssues ? 'danger' : ''"
            plain
            :disabled="!hasCheckedIssues"
            @click="onBatchCloseClick"
          >
            {{ `${$t('Issue.batchClose')} (${checkedIssueIds.length})` }}
          </el-button>
        </div>
      </div>
      <el-table
        ref="issueList"
        v-loading="listLoading"
        :data="listData"
        fit
        highlight-current-row
        row-key="id"
        :row-class-name="getRowClass"
        @row-contextmenu="handleContextMenu"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column align="center" width="40">
          <template slot="header">
            <el-checkbox
              v-model="isCheckedAllIssuesByPage"
              :disabled="listData.length < 1"
              @change="handleSinglePageChange"
            />
          </template>
          <template slot-scope="scope">
            <el-checkbox
              :value="isCheckedIssue(scope.row)"
              :disabled="!scope.row.is_closable"
              @change="toggleIssue(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column type="expand" width="30">
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

        <el-table-column :label="$t('Issue.Id')" min-width="200" show-overflow-tooltip prop="id" sortable="custom">
          <template slot-scope="scope">
            <span class="text-success mr-2">#{{ scope.row.id }}</span>
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('Issue.Priority')" align="center" prop="priority.id" width="150" sortable="custom">
          <template slot-scope="scope">
            <priority v-if="scope.row.priority.name" :name="scope.row.priority.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Status')" align="center" width="150" prop="status.id" sortable="custom">
          <template slot-scope="scope">
            <status v-if="scope.row.status.name" :name="scope.row.status.name" />
          </template>
        </el-table-column>

        <el-table-column align="center" :label="$t('general.Actions')" width="190" sortable="custom"
                         show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="onTransferClick(scope.row.id)">
              {{ $t('general.Transfer') }}
            </el-button>
            <el-popconfirm
              :title="$t('Member.confirmRemove')"
              :confirm-button-text="$t('general.Close')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              @onConfirm="onCloseClick(scope.row.id)"
            >
              <el-button slot="reference" size="mini" type="danger" :disabled="!scope.row.is_closable">
                {{ $t('general.Close') }}
              </el-button>
            </el-popconfirm>
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
    </el-card>
    <context-menu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="loadData"
    />
    <el-dialog :visible.sync="dialogVisible" :before-close="handleClose" :close-on-click-modal="false" width="50%">
      <div slot="title" class="text-title">
        {{ $t('Issue.batchTransfer') }}
      </div>
      <div class="text-base mb-2">{{ $t('Issue.TransferIssueTo', { value: checkedIssueIds.length }) }}</div>
      <el-select
        v-model="assigneeId"
        style="width: 100%"
        clearable
        :placeholder="$t('RuleMsg.PleaseSelect')"
        filterable
      >
        <el-option
          v-for="assignee in transferable"
          :key="assignee.value"
          :label="assignee.label"
          :value="assignee.value"
        />
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{ $t('general.Cancel') }}</el-button>
        <el-button :loading="isTransferring" type="primary" @click="batchTransfer">
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserIssueList } from '@/api/user'
import { getProjectAssignable } from '@/api/projects'
import { updateIssue, getCheckIssueClosable } from '@/api/issue'
import { IssueList, ContextMenu, IssueExpand } from '@/newMixins'
import { Priority, Status, Tracker } from '@/components/Issue'
import axios from 'axios'

export default {
  name: 'ProjectIssueTransfer',
  components: { Tracker, Priority, Status },
  mixins: [IssueList, ContextMenu, IssueExpand],
  data() {
    return {
      userName: '',
      checkedIssueIds: [],
      isCheckedAllIssues: false,
      isCheckedAllIssuesByPage: false,
      isSearchVisible: false,
      dialogVisible: false,
      assigneeList: [],
      assigneeId: null,
      isTransferring: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    refTable() {
      return this.$refs['issueList']
    },
    userId() {
      return Number(this.$route.params.userId)
    },
    hasCheckedIssues() {
      return this.checkedIssueIds.length > 0
    },
    transferable() {
      return this.assigneeList.filter(assignee => assignee.value !== this.userId)
    }
  },
  mounted() {
    this.fetchAssignee()
    this.loadData()
  },
  methods: {
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
        from: 'assigned_to_id',
        status_id: 'open',
        project_id: this.selectedProject.id
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
      let data
      try {
        if (this.lastIssueListCancelToken && this.listLoading) {
          this.lastIssueListCancelToken.cancel()
        }
        const cancelTokenSource = axios.CancelToken.source()
        this.lastIssueListCancelToken = cancelTokenSource
        const listData = await getUserIssueList(this.userId, this.getParams(), { cancelToken: cancelTokenSource.token })
        const { issue_list, page } = listData.data
        data = this.formatIssue(issue_list)
        if (listData.data.hasOwnProperty('page')) {
          this.pageInfo = page
        } else {
          this.pageInfo = {
            total: 0
          }
        }
        if (this.expandedRow.length > 0) {
          for (const row of this.expandedRow) {
            const getIssue = issue_list.find((item) => (item.id === row.id))
            await this.getIssueFamilyData(getIssue, this.expandedRow)
          }
        }
      } catch (e) {
        // null
      }
      this.lastIssueListCancelToken = null
      return data
    },
    async formatIssue(issue_list) {
      const result = []
      const issuesAPI = issue_list.map((issue) => (getCheckIssueClosable(issue.id)))
      let issuesCloseable = await Promise.all(issuesAPI)
      issuesCloseable = issuesCloseable.map((issue) => (issue.data))
      for (const [index, issue] of issue_list.entries()) {
        result.push({
          ...issue,
          is_closable: issuesCloseable[index]
        })
      }
      return result
    },
    async fetchAssignee() {
      try {
        const res = await getProjectAssignable(this.selectedProject.id)
        this.assigneeList = res.data.user_list.map(user => {
          const { name, login, id } = user
          return { value: id, label: `${name}(${login})` }
        })
        this.setUserName()
      } catch (err) {
        console.error(err)
      }
    },
    isCheckedIssue(issue) {
      const { id } = issue
      return this.checkedIssueIds.findIndex(item => item === id) > -1
    },
    toggleIssue(issue) {
      this.isCheckedIssue(issue) ? this.removeIssue(issue) : this.addIssue(issue)
      this.checkIssueChanged()
    },
    addIssue(issue) {
      const { id, is_closable } = issue
      if (!is_closable) return
      if (this.isCheckedIssue(issue)) return
      this.checkedIssueIds.push(id)
    },
    removeIssue(issue) {
      const { id } = issue
      if (!this.isCheckedIssue(issue)) return
      const idx = this.checkedIssueIds.findIndex(item => item === id)
      this.checkedIssueIds.splice(idx, 1)
    },
    checkIssueChanged() {
      const checkedCount = this.checkedIssueIds.length
      this.isCheckedAllIssuesByPage = checkedCount === this.listData.length
      this.isCheckedAllIssues = this.checkedIssueIds.length === this.listQuery.total
      this.handleSinglePageChecked()
    },
    onBackClick() {
      this.$router.push({ name: 'Project Settings' })
    },
    onTransferClick(issueId) {
      this.$router.push({ name: 'issue-detail', params: { issueId } })
    },
    async onCloseClick(issueId) {
      try {
        const sendData = new FormData()
        sendData.append('status_id', 6)
        await updateIssue(issueId, sendData)
        await this.loadData()
        await this.removeIssue(issueId)
      } catch (err) {
        console.error(err)
      }
    },
    handleSinglePageChange(val) {
      this.listData.forEach(issue => {
        val ? this.addIssue(issue) : this.removeIssue(issue)
      })
      this.isCheckedAllIssues = this.checkedIssueIds.length === this.listQuery.total
    },
    async handleAllIssuesChange(val) {
      try {
        const params = {
          offset: 0,
          from: 'assigned_to_id',
          status_id: 'open',
          project_id: this.selectedProject.id
        }
        this.listLoading = true
        const res = await getUserIssueList(this.userId, params)
        const list = await this.formatIssue(res.data.map(issue => issue))
        list.forEach(issue => {
          val ? this.addIssue(issue) : this.removeIssue(issue)
        })
        this.isCheckedAllIssuesByPage = val
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    handleSinglePageChecked() {
      const result = this.listData.every(issue => this.checkedIssueIds.findIndex(id => id === issue.id) > -1)
      this.isCheckedAllIssuesByPage = result
    },
    onBatchTransferClick() {
      this.dialogVisible = true
    },
    async batchTransfer() {
      this.isTransferring = true
      try {
        const batchAPI = this.checkedIssueIds.map((issueId) => {
          const sendData = new FormData()
          sendData.append('assigned_to_id', this.assigneeId)
          return updateIssue(issueId, sendData)
        })
        await Promise.all(batchAPI)
        for (const issueId of this.checkedIssueIds) {
          await this.removeIssue(issueId)
        }
        await this.loadData()
        await this.handleClose()
      } catch (err) {
        console.error(err)
      }
      this.isTransferring = false
      this.isCheckedAllIssues = false
      this.isCheckedAllIssuesByPage = false
    },
    handleClose() {
      this.dialogVisible = false
      this.assigneeId = null
    },
    async onBatchCloseClick() {
      this.listLoading = true
      try {
        const batchAPI = this.checkedIssueIds.map((issueId) => {
          const sendData = new FormData()
          sendData.append('status_id', 6)
          return updateIssue(issueId, sendData)
        })
        await Promise.all(batchAPI)
        for (const issueId of this.checkedIssueIds) {
          await this.removeIssue(issueId)
        }
        await this.loadData()
        this.handleClose()
      } catch (err) {
        console.error(err)
      }
    },
    setUserName() {
      const idx = this.assigneeList.findIndex(assignee => assignee.value === this.userId)
      this.userName = this.assigneeList[idx]['label']
    }
  }
}
</script>
