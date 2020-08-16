<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import AddTopic from './components/AddTopic'
export default {
  components: { 
    AddTopic,
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
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.topicList.slice(start, end)
    }
  },
  async created() {
    // TODO: get project topic list
    this.listLoading = false
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
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
  }
}
</script>
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="search" placeholder="Filter Name" style="width: 200px;" class="filter-item" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" >
        Search
      </el-button>
      <el-button 
        type="primary" 
        icon="el-icon-plus" 
        circle 
        style="float: right"
        @click="addTopicDialogVisible = true"
      ></el-button>
    </div>
    <el-table 
      v-loading="listLoading" 
      :data="pagedData" 
      element-loading-text="Loading" 
      border 
      fit 
      highlight-current-row
      row-key="order"
      default-expand-all
      :tree-props="{children: 'subTopic'}"
    >
      <el-table-column align="center" label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link :to="'topic-detail/'+scope.row.id" style="color: #409EFF">
            <span>{{ scope.row.type }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Index">
        <template slot-scope="scope">
          {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Description">
        <template slot-scope="scope">
          {{ scope.row.desc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Assignee">
        <template slot-scope="scope">
          {{ scope.row.assignee }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Priority">
        <template slot-scope="scope">
          {{ scope.row.priority }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Test Completion">
        <template slot-scope="scope">
          {{ scope.row.test_completion.done }} / {{ scope.row.test_completion.total }}
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
    <add-topic
      :dialog-visible.sync="addTopicDialogVisible"
      @add-topic-visible="emitAddTopicDialogVisible"
    />
  </div>
</template>
<style lang="scss">
  .filter-container {
    margin-bottom: 5px;
  }
</style>