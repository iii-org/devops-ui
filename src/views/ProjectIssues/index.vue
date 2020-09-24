<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import AddIssue from './components/AddIssue'
import { addIssue } from '@/api/issue'
import { getProjectIssueList } from '@/api/projects'
import { Message } from 'element-ui'
export default {
  components: { 
    AddIssue,
    ProjectListSelector,
    Pagination 
  },
  data() {
    return {
      issueList: [],
      addTopicDialogVisible: false,
      search: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        totalPage: 1
      }
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.issueList.slice(start, end)
    }
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  async created() {
    this.fetchData()
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    async fetchData() {
      this.listLoading = true
      const res = await getProjectIssueList(this.projectSelectedId)
      this.issueList = res.data
      this.listLoading = false
    },
    handleEdit(idx, row) {
      this.$router.push({ path: `list/${row.id}` })
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
    },
    async saveIssue(data) {
      await addIssue(data)
      this.addTopicDialogVisible = false
      Message({
        message: 'add successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
    },
  }
}
</script>
<template>
  <div class="app-container">
    
    <div class="clearfix">
      <div>
        <project-list-selector />
        <span class="newBtn">
          <el-button type="success" style="float:right" @click="addTopicDialogVisible = true">
            <i class="el-icon-plus" />
            Add Issue
          </el-button>
        </span>
      </div>
    </div>
    <el-divider />
    <el-table 
      v-loading="listLoading" 
      :data="pagedData" 
      element-loading-text="Loading" 
      border 
      fit 
      highlight-current-row
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children'}"
    >
      <el-table-column align="center" label="Type" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.issue_category }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Id" width="60px">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Name">
        <template slot-scope="scope">
          {{ scope.row.issue_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="100px">
        <template slot-scope="scope">
          {{ scope.row.issue_status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Assignee">
        <template slot-scope="scope">
          {{ scope.row.assigned_to }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Priority" width="100px">
        <template slot-scope="scope">
          {{ scope.row.issue_priority }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="200px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" /> Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listQuery.totalPage"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <add-issue
      :save-data="saveIssue"
      :dialog-visible.sync="addTopicDialogVisible"
      :project-id="projectSelectedId"
      @add-topic-visible="emitAddTopicDialogVisible"
    />
  </div>
</template>
<style lang="scss">
  .filter-container {
    margin-bottom: 5px;
  }
</style>