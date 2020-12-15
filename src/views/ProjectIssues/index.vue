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
      listTotal: 0, // 總筆數
      searchData: '',
      parentid: 0,
      parentname: '',
      parentList: []
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'userRole', 'userName']),
    pagedData() {
      const listData = this.issueList.filter(data => {
        if (data.assigned_to === null) {
          data.assigned_to = ''
        }
        if (
          this.searchData === '' ||
          data.issue_name.toLowerCase().includes(this.searchData.toLowerCase()) ||
          data.assigned_to.toLowerCase().includes(this.searchData.toLowerCase())
        ) {
          return data
        }
        // Sub issue Leval1
        if (data.children.length > 0) {
          const children1 = data.children.filter(datachildren1 => {
            if (datachildren1.assigned_to === null) {
              datachildren1.assigned_to = ''
            }
            if (
              datachildren1.issue_name.toLowerCase().includes(this.searchData.toLowerCase()) ||
              datachildren1.assigned_to.toLowerCase().includes(this.searchData.toLowerCase())
            ) {
              return datachildren1
            }
            // Sub issue Leval2
            if (datachildren1.children.length > 0) {
              const children2 = datachildren1.children.filter(datachildren2 => {
                if (datachildren2.assigned_to === null) {
                  datachildren2.assigned_to = ''
                }
                if (
                  datachildren2.issue_name.toLowerCase().includes(this.searchData.toLowerCase()) ||
                  datachildren2.assigned_to.toLowerCase().includes(this.searchData.toLowerCase())
                ) {
                  return datachildren2
                }
              })
              if (children2.length > 0) {
                return data
              }
            }
          })
          if (children1.length > 0) {
            return data
          }
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
  created() {
    this.checkProjectSelected()
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    checkProjectSelected() {
      this.projectSelectedId === -1 ? this.showNoProjectWarning() : this.fetchData()
    },
    showNoProjectWarning() {
      this.$message({
        type: 'warning',
        message: 'There are no projects currently, please create a new projec.'
      })
      this.listLoading = false
    },
    async fetchData() {
      this.listLoading = true
      const res = await getProjectIssueList(this.projectSelectedId)
      this.issueList = res.data
      this.listLoading = false
      this.parentList = []
      this.issueList.forEach(item => {
        this.parentList.push(item.id)
        if (item.children.length !== 0) {
          item.children.forEach(item2 => {
            this.parentList.push(item2.id)
          })
        }
      })
      if (this.userRole === 'Engineer') {
        this.searchData = this.userName
      }
    },
    handleEdit(idx, row) {
      this.$router.push({ path: `list/${row.id}` })
    },
    handleParent(idx, row, scope) {
      this.parentid = row.id
      this.parentname = row.issue_name
      this.addTopicDialogVisible = true
    },
    async handleDelete(idx, row) {
      this.listLoading = true
      await deleteIssue(row.id)
        .then(res => {
          Message({
            message: 'Delete successful',
            type: 'success',
            duration: 1 * 1000
          })
          this.fetchData()
        })
        .catch(error => {
          this.listLoading = false
          return error
        })
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
    },
    async saveIssue(data) {
      const res = await addIssue(data)
        .then(res => {
          Message({
            message: 'add successful',
            type: 'success',
            duration: 1 * 1000
          })
          this.fetchData()
          this.addTopicDialogVisible = false
          return res
        })
        .catch(error => {
          // console.log(error.response)
          return error
        })
      return res
      // this.addTopicDialogVisible = false
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
          <el-button
            type="success"
            style="float: right"
            :disabled="projectSelectedId === -1"
            @click=";(addTopicDialogVisible = true), (parentid = 0)"
          >
            <i class="el-icon-plus" />
            {{ $t('Issue.AddIssue') }}
          </el-button>
        </span>
        <el-input
          v-model="searchData"
          class="ob-search-input ob-shadow search-input mr-3"
          :placeholder="$t('Issue.SearchNameOrAssignee')"
          style="width: 250px; float: right"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
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
      <el-table-column :label="$t('Issue.Id')">
        <template slot-scope="scope">
          <div class="d-flex">
            <div class="column-title">
              <span class="text-success">{{ scope.row.id }}</span> {{ scope.row.issue_name }}
            </div>

            <el-button
              v-if="parentList.includes(scope.row.id) == true && scope.row.issue_status !== 'Closed'"
              size="mini"
              class="btn-sub"
              icon="el-icon-plus"
              @click="handleParent(scope.$index, scope.row, scope)"
            >
              Add subissue
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Type')" :show-overflow-tooltip="true" width="120px">
        <template slot-scope="scope">
          <span v-if="scope.row.issue_category === 'Feature'" class="point feature" />
          <span v-else-if="scope.row.issue_category === 'Document'" class="point document" />
          <span v-else-if="scope.row.issue_category === 'Bug'" class="point bug" />
          <span v-else-if="scope.row.issue_category === 'Research'" class="point research" />
          <span v-else class="point feature" />{{ scope.row.issue_category }}
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column> -->
      <el-table-column align="center" :label="$t('general.Status')" width="160px">
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
          <el-tag v-else-if="scope.row.issue_status === 'Responded'" type="responded" size="big">{{
            scope.row.issue_status
          }}</el-tag>
          <el-tag v-else-if="scope.row.issue_status === 'Closed'" type="close" size="big">{{
            scope.row.issue_status
          }}</el-tag>
          <el-tag v-else type="finish" size="big">{{ scope.row.issue_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Issue.Assignee')" width="200px">
        <template slot-scope="scope">
          {{ scope.row.assigned_to }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Issue.Priority')" width="120px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.issue_priority === 'Immediate'" type="danger" size="medium">{{
            scope.row.issue_priority
          }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === 'High'" type="warning" size="medium">{{
            scope.row.issue_priority
          }}</el-tag>
          <el-tag v-else-if="scope.row.issue_priority === 'Normal'" type="success" size="medium">{{
            scope.row.issue_priority
          }}</el-tag>
          <el-tag v-else type="slow" size="medium">{{ scope.row.issue_priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="260px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            {{ $t('general.Edit') }}
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
            <el-button slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" /> {{ $t('general.Delete') }}
            </el-button>
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
      :parentid="parentid"
      :parentname="parentname"
      @add-topic-visible="emitAddTopicDialogVisible"
    />
  </div>
</template>
<style lang="scss">
.filter-container {
  margin-bottom: 5px;
}

.el-table__body-wrapper {
  @media (max-width: 1366px){
    overflow-x: auto;
  }
}

.el-popconfirm__action .el-button--primary {
  margin-left: 5px !important;
}

col:first-child, .el-table__row td:first-child{
  @media (max-width: 1366px){
    width: 500px;
  }
}

.el-table_1_column_1{
  position: relative;
  font-weight: 500;
  .text-success{
    font-weight: 600;
    margin-right: 5px;
  }
}

.column-title{
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.btn-sub{
  color: #989898;
  font-size: 15px;
  font-weight: 400;
  border: none !important;
  margin: 0;
  padding-left: 0;
  padding-right: 16px;
  @media (max-width: 1366px){
    padding-right: 8px;
  }

}
</style>
