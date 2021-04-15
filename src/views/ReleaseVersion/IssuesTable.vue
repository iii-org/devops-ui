<script>
import MixinElTableWithCheckbox from '@/components/MixinElTableWithCheckbox'
import { updateIssue } from '@/api/issue'

export default {
  name: 'IssuesTable',
  mixins: [MixinElTableWithCheckbox],
  data: function() {
    return {
      issues: [],
      closedIssueCount: 0,
      openIssueCount: 0,
      categories: [],
      issuesByCategory: {},
      selectedCategory: this.$t('Release.allCategories'),
      searchKey: '',
      showOpen: true,
      showClosed: false,
      CLOSED_STATUS: 'Closed',
      CLOSED_STATUS_ID: 6
    }
  },
  computed: {
    batchCloseHint() {
      return this.$t('Release.confirmBatchClose', [this.selectedRowCount])
    },
    selectedRowCount() {
      let ret = 0
      for (const i in this.multipleSelection) {
        const arr = this.multipleSelection[i]
        ret += arr.length
      }
      return ret
    },
    categorySel() {
      const ret = [this.$t('Release.allCategories')]
      for (const c of this.categories) {
        ret.push(c)
      }
      return ret
    }
  },
  watch: {
    showClosed() {
      this.setData(this.issues)
    },
    showOpen() {
      this.setData(this.issues)
    }
  },
  methods: {
    setData(issues) {
      this.issues = issues
      this.categories = []
      this.issuesByCategory = {}
      for (const issue of issues) {
        const cat = issue['issue_category']
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
      const CLOSED_STATUS = 'Closed'
      let partialIssues
      if (this.selectedCategory === this.$t('Release.allCategories')) {
        partialIssues = this.issues
      } else {
        partialIssues = this.issues.filter(
          item => item['issue_category'] === this.selectedCategory)
      }
      this.closedIssueCount = 0
      this.openIssueCount = 0
      this.listData = partialIssues.filter(issue => {
        if (issue['issue_status'] === CLOSED_STATUS) {
          this.closedIssueCount++
          return this.showClosed
        } else {
          this.openIssueCount++
          return this.showOpen
        }
      })
      this.adjustTable(5)

      // If data reduces, we need to set current page to smaller one making data visible
      this.$nextTick(() => {
        const len = this.listData.length
        const pageSize = this.listQuery.limit
        if ((this.listQuery.page - 1) * pageSize >= len) {
          if (len > 0) {
            this.listQuery.page = 1 + Math.floor((len - 1) / pageSize)
          } else {
            this.listQuery.page = 1
          }
        }
      })
    },
    handleEdit(idx, row) {
      this.$router.push({ path: `/project/issue-list/${row.id}` })
    },
    async handleClose(idx, row) {
      this.listLoading = true
      await updateIssue(row.id, { status_id: this.CLOSED_STATUS_ID })
      row.issue_status = this.CLOSED_STATUS
      for (const i in this.issues) {
        if (this.issues[i].id === row.id) {
          this.issues.splice(parseInt(i), 1, row)
          break
        }
      }
      if (this.pagedData.length === 0 && this.listQuery.page > 1) {
        this.listQuery.page--
      }
      this.openIssueCount--
      this.closedIssueCount++
      this.listLoading = false
    },
    async batchClose() {
      this.listLoading = true
      const indexes = []
      for (const i in this.multipleSelection) {
        const arr = this.multipleSelection[i]
        for (const idx of arr) {
          indexes.push(i * this.listQuery.limit + idx)
        }
      }
      for (const index of indexes) {
        await updateIssue(this.listData[index].id, { status_id: this.CLOSED_STATUS_ID })
      }
      this.$parent.init()
      this.listLoading = false
    },
    async batchMove() {

    }
  }
}
</script>

<template>
  <div style="height: 70%;">
    <p>
      <el-form inline>
        <el-form-item :label="$t('Issue.Issue')">
          <el-select v-model="selectedCategory" @change="processData">
            <el-option
              v-for="item in categorySel"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="showClosed"
            :label="`${$t('Issue.Closed')} (${closedIssueCount})`"
            class="valign-middle"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="showOpen"
            :label="`${$t('Dashboard.Unfinished')} (${openIssueCount})`"
            class="valign-middle"
            checked
          />
        </el-form-item>
        <el-form-item>
          <el-popconfirm
            :title="batchCloseHint"
            :confirm-button-text="$t('general.Confirm')"
            :cancel-button-text="$t('general.Cancel')"
            @onConfirm="batchClose"
          >
            <el-button
              slot="reference"
              class="valign-middle"
              :disabled="selectedRowCount === 0"
            >
              {{ $t('Release.batchClose') }}
            </el-button>
          </el-popconfirm>
        </el-form-item>
        <el-form-item>
          <el-button
            class="valign-middle"
            :disabled="selectedRowCount === 0"
            @click="batchMove"
          >
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
        border
        fit
        highlight-current-row
        :data="pagedData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column :label="$t('Issue.id')" prop="id" align="center" width="75" />
        <el-table-column :label="$t('Issue.name')" align="center" prop="issue_name" />
        <el-table-column :label="$t('Project.Version')" align="center" prop="fixed_version_name" />
        <el-table-column :label="$t('general.Type')" align="center" prop="issue_category" />
        <el-table-column :label="$t('general.Status')" align="center" prop="issue_status" />
        <el-table-column :label="$t('Issue.Assignee')" align="center" prop="assigned_to" />
        <el-table-column :label="$t('general.Actions')" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" :content="$t('Issue.EditIssue')" placement="bottom-start"
                        :open-delay="1000"
            >
              <el-button
                :id="`link-issue-name-${scope.$index}`"
                class="mr-1"
                type="primary"
                circle
                plain
                size="mini"
                icon="el-icon-edit"
                @click="handleEdit(scope.$index, scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              v-if="scope.row.issue_status !== CLOSED_STATUS"
              effect="dark"
              :content="$t('general.Close')"
              placement="bottom-start"
              :open-delay="1000"
            >
              <el-button
                :id="`link-issue-name-${scope.$index}`"
                class="mr-1"
                type="primary"
                circle
                plain
                size="mini"
                icon="el-icon-close"
                @click="handleClose(scope.$index, scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
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
  </div>
</template>

<style scoped>
.valign-middle {
  padding: 10px 10px;
  font-weight: bold;
}
</style>
