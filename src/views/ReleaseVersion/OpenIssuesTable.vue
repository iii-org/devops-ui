<script>
import MixinElTableWithCheckbox from '@/components/MixinElTableWithCheckbox'
import { updateIssue } from '@/api/issue'

export default {
  name: 'OpenIssuesTable',
  mixins: [MixinElTableWithCheckbox],
  data: function() {
    return {
      issues: [],
      categories: [],
      issuesByCategory: {},
      selectedCategory: this.$t('Release.allCategories'),
      searchKey: ''
    }
  },
  computed: {
    categorySel() {
      const ret = [this.$t('Release.allCategories')]
      for (const c of this.categories) {
        ret.push(c)
      }
      return ret
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
      this.listData = this.issues
      this.adjustTable(5)
    },
    filterByCategory(cat) {
      if (cat === this.$t('Release.allCategories')) {
        this.listData = this.issues
      } else {
        this.listData = this.issues.filter(item => item['issue_category'] === cat)
      }
    },
    handleEdit(idx, row) {
      this.$router.push({ path: `/project/issue-list/${row.id}` })
    },
    async handleClose(idx, row) {
      this.listLoading = true
      const CLOSED_STATUS_ID = 6
      await updateIssue(row.id, { status_id: CLOSED_STATUS_ID })
      for (const i in this.issues) {
        if (this.issues[i].id === row.id) {
          this.issues.splice(parseInt(i), 1)
          break
        }
      }
      if (this.pagedData.length === 0 && this.listQuery.page > 1) {
        this.listQuery.page -= 1
      }
      this.listLoading = false
    }
  }
}
</script>

<template>
  <div style="height: 70%;">
    <p>
      <el-form>
        <el-form-item :label="$t('Issue.Issue')">
          <el-select v-model="selectedCategory" @change="filterByCategory">
            <el-option
              v-for="item in categorySel"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
            <el-tooltip effect="dark" :content="$t('general.Close')" placement="bottom-start"
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

</style>
