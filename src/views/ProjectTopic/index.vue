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
      topicList: [
        {
          'id': 1,
          'type': '使用者案例', 
          'order': 1, 
          'desc': '使用者需求訪談', 
          'status': '已確定',
          'assignee': '陳聰明', 
          'priority': '正常',
          'test_completion': {
            'total': 25,
            'done': 10
          },
          'subTopic': [{
            'id': 2,
            'type': '工作', 
            'order': 2, 
            'desc': '自行註冊', 
            'status': '進行中',
            'assignee': '陳聰明', 
            'priority': '正常',
            'test_completion': {
              'total': 10,
              'done': 10
            }},
            {
            'id': 3,
            'type': '工作', 
            'order': 3, 
            'desc': '單一登入註冊', 
            'status': '進行中',
            'assignee': '陳聰明', 
            'priority': '正常',
            'test_completion': {
              'total': 15,
              'done': 5
            }}
          ]
        },
        {
          'id': 4,
          'type': 'Bug', 
          'order': 4, 
          'desc': '密碼重設信不能正確寄送', 
          'status': '已確定',
          'assignee': '王耀祖', 
          'priority': '正常',
          'test_completion': {
            'total': 5,
            'done': 5
          }
        }
      ],
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
    returnTagType(row) {
      const { success, total } = row.last_test_result
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      return success + ' / ' + total
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
          <router-link :to="'topic-detail/'+scope.row.id" style="color: #409EFF">
            <span>{{ scope.row.issue_category }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Id">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status">
        <template slot-scope="scope">
          {{ scope.row.issue_status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Assignee">
        <template slot-scope="scope">
          {{ scope.row.assigned_to }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Priority">
        <template slot-scope="scope">
          {{ scope.row.issue_priority }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="250px">
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