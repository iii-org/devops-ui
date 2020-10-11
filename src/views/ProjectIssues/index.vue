<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import AddIssue from './components/AddIssue'
import { addIssue, deleteIssue } from '@/api/issue'
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
        limit: 10
      },
      listTotal: 0, //總筆數
      searchData: ''
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole']),
    pagedData() {
      const listData = this.issueList.filter((data) => {
        if (this.searchData == '' || data.issue_name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
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
      if (this.userRole === 'Project Manager') {
        this.$router.push({ path: `list/${row.id}` })
      } else if (this.userRole === 'Engineer') {
        this.$router.push({ path: `listrd/${row.id}/setup` })
      }
    },
    async handleDelete(idx, row) {
      this.listLoading = true
      await deleteIssue(row.id)
      Message({
        message: 'Delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.fetchData()
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
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <div>
        <project-list-selector />
        <span class="newBtn">
          <el-button type="success" style="float: right" @click="addTopicDialogVisible = true">
            <i class="el-icon-plus" />
            Add Issue
          </el-button>
        </span>
        <el-input
          v-model="searchData"
          class="ob-search-input ob-shadow search-input mr-3"
          placeholder="Please input issue name"
          style="width: 250px; float: right"
          ><i slot="prefix" class="el-input__icon el-icon-search"></i
        ></el-input>
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
      :tree-props="{ children: 'children' }"
    >
      <el-table-column align="center" label="Id" width="100px">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Type" :show-overflow-tooltip="true" width="140px">
        <template slot-scope="scope">
          {{ scope.row.issue_category }}
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
      <el-table-column align="center" label="Status" width="120px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.issue_status === 'Active'" type="active" size="big">{{
            scope.row.issue_status
          }}</el-tag>
          <el-tag v-else-if="scope.row.issue_status === 'Assigned'" type="assigned" size="big">{{
            scope.row.issue_status
          }}</el-tag>
          <el-tag v-else-if="scope.row.issue_status === 'Solved'" type="solved" size="big">{{
            scope.row.issue_status
          }}</el-tag>
          <el-tag v-else type="finish" size="big">{{ scope.row.issue_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Assignee">
        <template slot-scope="scope">
          {{ scope.row.assigned_to }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Priority" width="120px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.issue_priority === '特急'" type="danger" size="medium">{{
            scope.row.issue_priority
          }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === '急'" type="warning" size="medium">緊急</el-tag>
          <el-tag v-else type="success" size="medium">{{ scope.row.issue_priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="260px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            class="Issuedel"
            @onConfirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button slot="reference" size="mini" type="danger"> <i class="el-icon-delete" /> Delete </el-button>
          </el-popconfirm>
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
              <i class="el-icon-delete" /> Delete
            </el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
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
.el-popconfirm__action .el-button--primary {
  margin-left: 5px !important;
}
</style>

