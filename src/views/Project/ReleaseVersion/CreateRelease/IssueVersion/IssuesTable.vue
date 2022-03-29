<template>
  <div style="height: 70%;">
    <p>
      <el-form inline class="flex align-center">
        <el-form-item :label="$t('Issue.Issue')">
          <el-select v-model="selectedCategory" @change="processData">
            <el-option v-for="item in categorySel" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="showClosed"
            :label="`${$t('Issue.Closed')} (${closedIssueCount})`"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="showOpen"
            :label="`${$t('Dashboard.Unfinished')} (${openIssueCount})`"
            checked
          />
        </el-form-item>
        <el-form-item>
          <el-popconfirm
            :title="batchCloseHint"
            :confirm-button-text="$t('general.Confirm')"
            :cancel-button-text="$t('general.Cancel')"
            @confirm="batchClose"
          >
            <el-button slot="reference" class="valign-middle" :disabled="noRowSelected">
              {{ $t('Release.batchClose') }}
            </el-button>
          </el-popconfirm>
        </el-form-item>
        <el-form-item>
          <el-button class="valign-middle" :disabled="noRowSelected" @click="showBatchMoveDialog = true">
            {{ $t('Release.batchMove') }}
          </el-button>
        </el-form-item>
      </el-form>
    </p>
    <p style="height: inherit;">
      <el-table
        ref="theTable"
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        fit
        highlight-current-row
        :data="pagedData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column :label="$t('Issue.id')" prop="id" align="center" width="75" />
        <el-table-column :label="$t('Issue.name')" align="center" prop="name" />
        <el-table-column :label="$t('Project.Version')" align="center" prop="versionName" />
        <el-table-column :label="$t('general.Type')" width="130" sortable="custom">
          <template slot-scope="{row}">
            <Tracker v-if="row.trackerName" :name="$t(`Issue.${row.trackerName}`)" :type="row.trackerName" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150" sortable="custom">
          <template slot-scope="{row}">
            <Status
              v-if="row.statusName"
              :name="$t(`Issue.${row.statusName}`)"
              :type="row.statusName"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('Issue.Assignee')" align="center" prop="assigneeName" />
        <el-table-column :label="$t('general.Actions')" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" :content="$t('Issue.EditIssue')" placement="bottom-start" :open-delay="1000">
              <el-button
                :id="`link-issue-name-${scope.$index}`"
                class="mr-1 buttonPrimary"
                circle
                plain
                size="mini"
                icon="el-icon-edit"
                @click="handleEdit(scope.$index, scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-if="!scope.row.isClosed"
              effect="dark"
              :content="$t('general.Close')"
              placement="bottom-start"
              :open-delay="1000"
            >
              <el-button
                :id="`link-issue-name-${scope.$index}`"
                class="mr-1 buttonPrimaryReverse"
                circle
                plain
                size="mini"
                icon="el-icon-close"
                @click="handleClose(scope.$index, scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
      </el-table>
      <pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="handlePagination"
      />
    </p>
    <el-dialog :visible.sync="showBatchMoveDialog" :title="$t('Release.batchMoveDialogTitle')">
      <el-form>
        <el-form-item :label="$t('Release.futureVersion')">
          <el-select v-model="batchMoveToVersion" :placeholder="$t('Release.selectMoveToVersion')" filterable>
            <el-option
              v-for="item in projectVersionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          {{ $t('Release.batchMoveDialogHint', [selectedIndexes.length]) }}
        </el-form-item>
        <el-button
          v-loading="loading"
          class="buttonPrimary"
          :disabled="!batchMoveToVersion"
          @click="batchMove"
        >
          {{ $t('general.Confirm') }}
        </el-button>
        <el-button type="info" @click="showBatchMoveDialog = false">
          {{ $t('general.Cancel') }}
        </el-button>
      </el-form>
    </el-dialog>
    <el-dialog :visible.sync="showFormDialog" :title="$t('Issue.AskDeleteIssue')">
      <IssueNotesEditor ref="IssueNotesEditor" page="IssuesTable" />
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="handleCloseIssue()">{{ $t('Issue.CloseIssue') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="showClosedChildrenIssueWarning" :title="$t('Issue.ChildrenNotClosed')" @close="handleClick">
      <div v-for="item in notClosedChildrenIssueList" :key="item.id">
        <span>#{{ item.id }}</span>
        <span>-{{ item.name }}</span>
      </div>
      <div style="color: red; margin-top: 20px;">{{ $t('Issue.ChildrenNotClosedWarning') }}</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClick">{{ $t('general.ok') }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="showIssueDetail"
      width="90%"
      top="3vh"
      append-to-body
      destroy-on-close
    >
      <ProjectIssueDetail
        v-if="showIssueDetail"
        ref="children"
        :props-issue-id="edittedIssueId"
        :is-in-dialog="true"
        @update="handleRelationUpdate"
        @delete="handleRelationUpdate"
      />
    </el-dialog>
  </div>
</template>

<script>
import MixinElTableWithCheckbox from '@/mixins/MixinElTableWithCheckbox'
import { updateIssue, getCheckIssueClosable } from '@/api/issue'
import Status from '@/components/Issue/Status'
import Tracker from '@/components/Issue/Tracker'
import { mapGetters } from 'vuex'

export default {
  name: 'IssuesTable',
  components: {
    IssueNotesEditor: () => import('@/views/Project/IssueDetail/components/IssueNotesEditor'),
    Status,
    Tracker,
    ProjectIssueDetail: () => import('@/views/Project/IssueDetail')
  },
  mixins: [MixinElTableWithCheckbox],
  props: {
    allIssues: {
      type: Array,
      required: true
    },
    projectVersionOptions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      issues: [],
      closedIssueCount: 0,
      openIssueCount: 0,
      categories: [],
      issuesByCategory: {},
      selectedCategory: this.$t('Release.allCategories'),
      searchKey: '',
      showOpen: false,
      showClosed: false,
      showBatchMoveDialog: false,
      showFormDialog: false,
      showIssueDetail: false,
      batchMoveToVersion: null,
      loading: false,
      closedIdex: '',
      closedRow: {},
      notClosedChildrenIssueList: [],
      showClosedChildrenIssueWarning: false,
      edittedIssueId: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    batchCloseHint() {
      return this.$t('Release.confirmBatchClose', [this.selectedIndexes.length])
    },
    categorySel() {
      const ret = [this.$t('Release.allCategories')]
      this.categories.forEach(category => ret.push(this.$t(`Issue.${category}`)))
      return ret
    },
    selectedCategoryEn() {
      const id = Number(this.categorySel.findIndex(item => item === this.selectedCategory))
      return id !== 0 ? this.categories[id - 1] : this.$t('Release.allCategories')
    }
  },
  watch: {
    showClosed() {
      this.setData(this.issues)
    },
    showOpen() {
      this.setData(this.issues)
    },
    listData(val) {
      // FIXME: need to find out why filteredData in MixinProjectListSelector always makes listData become [] when first loading
      if (val.length === 0 && this.selectedCategory === this.$t('Release.allCategories') && this.allIssues.length > 0) {
        this.setData(this.allIssues)
      }
    },
    allIssues(val) {
      this.setData(val)
    },
    selectedProjectId(val) {
      if (val) {
        this.batchMoveToVersion = null
      }
    }
  },
  methods: {
    setData(issues) {
      this.issues = issues
      this.categories = []
      this.issuesByCategory = {}
      for (const issue of issues) {
        const cat = issue.trackerName
        if (this.categories.indexOf(cat) < 0) {
          this.categories.push(cat)
        }
        if (!(cat in this.issuesByCategory)) {
          this.issuesByCategory[cat] = []
        }
        this.issuesByCategory[cat].push(issue)
      }
      this.categories.sort()
      this.processData()
    },
    processData() {
      const partialIssues = this.selectedCategory === this.$t('Release.allCategories')
        ? this.issues : this.issues.filter(item => item.trackerName === this.selectedCategoryEn)
      this.closedIssueCount = 0
      this.openIssueCount = 0
      this.listData = this.getListData(partialIssues)
      this.adjustTable(5)
      this.resizeTable()
    },
    getListData(partialIssues) {
      const listData = partialIssues.filter(issue => {
        if (issue.isClosed) {
          this.closedIssueCount++
          return this.showClosed
        } else {
          this.openIssueCount++
          return this.showOpen
        }
      })
      return listData
    },
    resizeTable() {
      // If data reduces, we need to set current page to smaller one making data visible
      this.$nextTick(() => {
        const len = this.listData.length
        const pageSize = this.listQuery.limit
        if ((this.listQuery.page - 1) * pageSize >= len) {
          this.listQuery.page = len > 0 ? 1 + Math.floor((len - 1) / pageSize) : 1
        }
      })
    },
    handleEdit(idx, row) {
      this.showIssueDetail = true
      this.edittedIssueId = row.id
    },
    handleRelationUpdate() {
      this.$emit('onUpdate')
    },
    handleClose(idx, row) {
      this.closedIdex = idx
      this.closedRow = row
      this.showFormDialog = true
    },
    async handleCloseIssue() {
      const isChildrenIssueClosed = await this.isChildrenIssueClosed()
      if (!isChildrenIssueClosed) return
      const notes = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')
      const sendForm = new FormData()
      sendForm.append('notes', notes)
      this.updateIssueForm(sendForm)
    },
    async isChildrenIssueClosed(index) {
      const res = await getCheckIssueClosable(this.closedRow.id || this.listData[index].id)
      if (!res.data) {
        this.showFormDialog = false
        this.notClosedChildrenIssueList.push(this.listData[index] || this.closedRow)
      }
      if (this.notClosedChildrenIssueList.length > 0 && !this.showClosedChildrenIssueWarning) this.showClosedChildrenIssueWarning = true
      return res.data
    },
    handleClick() {
      this.showClosedChildrenIssueWarning = false
      this.notClosedChildrenIssueList = []
    },
    updateIssueForm(sendForm) {
      this.isLoading = true
      const issueId = this.closedRow.id

      updateIssue(issueId, sendForm)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleUpdated()
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
    },
    handleUpdated() {
      this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('reset')
      this.showFormDialog = false
      this.deleteIssue(this.closedIdex, this.closedRow)
    },
    async deleteIssue(idx, row) {
      this.listLoading = true
      await row.close()
      for (const i of this.issues.keys()) {
        if (this.issues[i].id === row.id) {
          this.issues.splice(i, 1, row)
          break
        }
      }
      if (this.pagedData.length === 0 && this.listQuery.page > 1) this.listQuery.page--
      this.processData()
      this.listLoading = false
      this.showFormDialog = false

      // If all issues are closed, change to create release screen
      if (this.openIssueCount === 0) this.$emit('onInit')
    },
    async batchClose() {
      this.listLoading = true
      const indexes = this.selectedIndexes
      for (const index of indexes) {
        await this.isChildrenIssueClosed(index)
        await this.listData[index].close()
      }
      this.multipleSelection = []
      if (!this.showClosedChildrenIssueWarning) this.$emit('onInit')
      this.listLoading = false
    },
    async batchMove() {
      this.loading = true
      const indexes = this.selectedIndexes
      for (const index of indexes) {
        await updateIssue(this.listData[index].id, { fixed_version_id: this.batchMoveToVersion })
      }
      this.multipleSelection = []
      this.$emit('onInit')
      this.loading = false
      this.showBatchMoveDialog = false
    }
  }
}
</script>

<style scoped>
.el-form-item {
  padding: 10px 10px;
  font-weight: bold;
}
</style>
