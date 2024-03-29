<template>
  <div class="app-container">
    <el-card>
      <div class="flex justify-between items-center mb-3">
        <el-button
          type="text"
          size="medium"
          icon="el-icon-arrow-left"
          class="text-title linkTextColor"
          @click="onBackClick"
        >
          {{ $t('general.Back') }}
        </el-button>
        <span class="text-title">{{ `${$t('Issue.IssueList')}：${userName}` }}</span>
        <el-input
          v-if="isSearchVisible"
          v-model="keyword"
          size="small"
          prefix-icon="el-icon-search"
          :placeholder="$t('general.Search') + $t('Issue.name')"
          style="width: 210px"
          clearable
          @blur="isSearchVisible = !isSearchVisible"
        />
        <el-button
          v-else
          type="text"
          icon="el-icon-search"
          @click="isSearchVisible = !isSearchVisible"
        >
          {{ $t('general.Search') + (keyword ? ': ' + keyword : '') }}
        </el-button>
      </div>
      <div class="flex justify-between items-center mb-2">
        <el-checkbox
          v-model="isCheckedAllIssues"
          class="ml-5"
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
            {{ `${$t('Issue.batchTransfer')} (${checkedIssues.length})` }}
          </el-button>
          <el-button
            size="mini"
            :type="hasCheckedIssues ? 'danger' : ''"
            plain
            :disabled="!hasCheckedIssues"
            @click="onBatchCloseClick"
          >
            {{ `${$t('Issue.batchClose')} (${checkedIssues.length})` }}
          </el-button>
        </div>
      </div>
      <el-table
        ref="dataTable"
        v-loading="listLoading"
        :data="filteredData"
        fit
        @row-contextmenu="handleContextMenu"
      >
        <el-table-column width="55">
          <template slot="header">
            <el-checkbox
              v-model="isCheckedAllIssuesByPage"
              @change="handleSinglePageChange"
            />
          </template>
          <template slot-scope="scope">
            <el-checkbox
              :value="isCheckedIssue(scope.row.id)"
              @change="toggleIssue(scope.row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="tracker.name"
          align="center"
          :label="$t('general.Type')"
          width="130"
        >
          <template slot-scope="{row}">
            <Tracker
              v-if="row.tracker.name"
              :name="$t(`Issue.${row.tracker.name}`)"
              :type="row.tracker.name"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('Issue.Id')"
          header-align="center"
          min-width="280"
          show-overflow-tooltip
          prop="id"
        >
          <template slot-scope="scope">
            <span class="text-success mr-2">#{{ scope.row.id }}</span>
            <el-tag
              v-for="item in scope.row.tags"
              :key="item.id"
              size="mini"
              class="mr-1"
            >[{{ item.name }}]</el-tag>{{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column
          prop="priority.name"
          :label="$t('Issue.Priority')"
          align="center"
          width="150"
        >
          <template slot-scope="{row}">
            <Priority
              v-if="row.priority.name"
              :name="$t(`Issue.${row.priority.name}`)"
              :type="row.priority.name"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="status.name"
          :label="$t('general.Status')"
          align="center"
          width="150"
        >
          <template slot-scope="{row}">
            <Status
              v-if="row.status.name"
              :name="$t(`Issue.${row.status.name}`)"
              :type="row.status.name"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('general.Actions')"
        >
          <template slot-scope="scope">
            <el-tooltip
              placement="bottom"
              :content="$t('general.Transfer')"
            >
              <em
                class="ri-file-transfer-line finished operate-button"
                @click="onTransferClick(scope.row.id)"
              />
            </el-tooltip>
            <el-tooltip
              placement="bottom"
              :content="$t('general.Close')"
            >
              <el-popconfirm
                :title="$t('Notify.confirmClose')"
                :confirm-button-text="$t('general.Close')"
                :cancel-button-text="$t('general.Cancel')"
                icon="el-icon-info"
                icon-color="red"
                @confirm="onCloseClick(scope.row.id)"
              >
                <em
                  slot="reference"
                  class="ri-delete-bin-2-line danger operate-button"
                />
              </el-popconfirm>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="listQuery.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
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
    <el-dialog
      :title="$t('Issue.batchTransfer')"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div class="text-base mb-2">{{ $t('Issue.TransferIssueTo', { value: checkedIssues.length }) }}</div>
      <el-select
        v-model="assigneeId"
        style="width: 100%"
        clearable
        :placeholder="$t('RuleMsg.PleaseSelect')"
        filterable
      >
        <el-option
          v-for="assignee in assigneeList"
          :key="assignee.value"
          :label="assignee.label"
          :value="assignee.value"
        />
      </el-select>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">{{ $t('general.Cancel') }}</el-button>
        <el-button
          class="buttonPrimary"
          @click="batchTransfer"
        >{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserIssueList } from '@/api/user'
import { getProjectAssignable } from '@/api/projects'
import { updateIssue } from '@/api/issue'
import { BasicData, Pagination, ContextMenu, SearchBar } from '@/mixins'
import { Priority, Status, Tracker } from '@/components/Issue'

export default {
  name: 'ProjectIssueTransfer',
  components: { Tracker, Priority, Status },
  mixins: [BasicData, Pagination, ContextMenu, SearchBar],
  data() {
    return {
      userName: '',
      checkedIssues: [],
      isCheckedAllIssues: false,
      isCheckedAllIssuesByPage: false,
      isSearchVisible: false,
      dialogVisible: false,
      assigneeList: [],
      assigneeId: null
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    userId() {
      return this.$route.params.userId
    },
    hasCheckedIssues() {
      return this.checkedIssues.length > 0
    },
    focusedIssues() {
      return this.listData.map((issue) => issue.id)
    }
  },
  mounted() {
    this.fetchAssignee()
  },
  methods: {
    async fetchData() {
      const params = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit,
        from: 'assigned_to_id',
        status_id: 'open',
        project_id: this.selectedProject.id
      }
      return await getUserIssueList(this.userId, params)
        .then((res) => {
          const { issue_list, page } = res.data
          this.listQuery = page
          return issue_list
        })
        .catch((e) => {
          return Promise.reject(e)
        })
    },
    fetchAssignee() {
      getProjectAssignable(this.selectedProject.id)
        .then((res) => {
          this.assigneeList = res.data.user_list
            .map((user) => {
              const { name, login, id } = user
              return { value: id, label: `${name}(${login})` }
            })
          this.setUserName(this.assigneeList)
          this.assigneeList = this.assigneeList.filter((assignee) => assignee.value !== Number(this.userId))
        })
        .catch((err) => {
          console.error(err)
        })
    },
    setUserName(assigneeList) {
      const idx = assigneeList.findIndex((assignee) => assignee.value === Number(this.userId))
      this.userName = assigneeList[idx]['label']
    },
    isCheckedIssue(issueId) {
      return this.checkedIssues.findIndex((item) => item === issueId) > -1
    },
    toggleIssue(issueId) {
      this.isCheckedIssue(issueId) ? this.removeIssue(issueId) : this.addIssue(issueId)
      this.checkIssueChanged()
    },
    addIssue(issueId) {
      if (this.isCheckedIssue(issueId)) return
      this.checkedIssues.push(issueId)
    },
    removeIssue(issueId) {
      if (!this.isCheckedIssue(issueId)) return
      const idx = this.checkedIssues.findIndex((item) => item === issueId)
      this.checkedIssues.splice(idx, 1)
    },
    checkIssueChanged() {
      const checkedCount = this.checkedIssues.length
      this.isCheckedAllIssuesByPage = checkedCount === this.listData.length
      this.isCheckedAllIssues = this.checkedIssues.length === this.listQuery.total
      this.handleSinglePageChecked()
    },
    onBackClick() {
      this.$router.push({ name: 'Project Settings', params: { projectName: this.selectedProject.name }})
    },
    onTransferClick(issueId) {
      this.$router.push({ name: 'IssueDetail', params: { issueId }})
    },
    onCloseClick(issueId) {
      const sendData = new FormData()
      sendData.append('status_id', 6)
      updateIssue(issueId, sendData)
        .then(() => {
          this.loadData()
        })
        .catch((err) => {
          console.error(err)
        })
    },
    async onPagination(listQuery) {
      const { page, limit } = listQuery
      this.listQuery.offset = page * limit - limit
      await this.loadData()
      this.handleSinglePageChecked()
    },
    handleSinglePageChange(val) {
      this.focusedIssues.forEach((id) => {
        val ? this.addIssue(id) : this.removeIssue(id)
      })
      this.isCheckedAllIssues = this.checkedIssues.length === this.listQuery.total
    },
    async handleAllIssuesChange(val) {
      const params = {
        offset: 0,
        from: 'assigned_to_id',
        status_id: 'open',
        project_id: this.selectedProject.id
      }
      this.listLoading = true
      await getUserIssueList(this.userId, params)
        .then((res) => {
          const list = res.data.map((item) => item.id)
          list.forEach((id) => {
            val ? this.addIssue(id) : this.removeIssue(id)
          })
          this.isCheckedAllIssuesByPage = val
        })
        .catch((err) => {
          console.error(err)
        })
        .then(() => {
          this.listLoading = false
        })
    },
    handleSinglePageChecked() {
      this.isCheckedAllIssuesByPage = this.focusedIssues.every(
        (item) => this.checkedIssues.findIndex((id) => id === item) > -1
      )
    },
    onBatchTransferClick() {
      this.dialogVisible = true
    },
    batchTransfer() {
      this.listLoading = true
      this.checkedIssues.forEach((issueId) => {
        const sendData = new FormData()
        sendData.append('assigned_to_id', this.assigneeId)
        updateIssue(issueId, sendData)
          .then(() => {
            this.handleClose()
            this.loadData()
          })
          .catch((err) => {
            console.error(err)
          })
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.assigneeId = null
    },
    onBatchCloseClick() {
      this.listLoading = true
      this.checkedIssues.forEach((issueId) => {
        this.onCloseClick(issueId)
      })
    }
  }
}
</script>
