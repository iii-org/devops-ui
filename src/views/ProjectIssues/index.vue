<script>
import { mapGetters, mapActions } from 'vuex'
import { Message } from 'element-ui'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { addIssue } from '@/api/issue'
import { getProjectIssueListByTree } from '@/api/projects'
import AddIssue from './components/AddIssue'

export default {
  name: 'ProjectIssues',
  components: {
    AddIssue,
    ProjectListSelector,
    Pagination
  },
  data: () => ({
    issueList: [],
    addTopicDialogVisible: false,
    search: '',
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',
    parentId: 0,
    parentName: '',
    parentList: []
  }),
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
        // Sub issue level 1
        if (data.children.length > 0) {
          const children1 = data.children.filter(dataChildren1 => {
            if (dataChildren1.assigned_to === null) {
              dataChildren1.assigned_to = ''
            }
            if (
              dataChildren1.issue_name.toLowerCase().includes(this.searchData.toLowerCase()) ||
              dataChildren1.assigned_to.toLowerCase().includes(this.searchData.toLowerCase())
            ) {
              return dataChildren1
            }
            // Sub issue level 2
            if (dataChildren1.children.length > 0) {
              const children2 = dataChildren1.children.filter(dataChildren2 => {
                if (dataChildren2.assigned_to === null) {
                  dataChildren2.assigned_to = ''
                }
                if (
                  dataChildren2.issue_name.toLowerCase().includes(this.searchData.toLowerCase()) ||
                  dataChildren2.assigned_to.toLowerCase().includes(this.searchData.toLowerCase())
                ) {
                  return dataChildren2
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
      this.listQuery.page = 1
      this.search = ''
    },
    search() {
      this.listQuery.page = 1
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
        message: 'There are no projects currently, please create a new project.'
      })
      this.listLoading = false
    },
    async fetchData() {
      this.listLoading = true
      const res = await getProjectIssueListByTree(this.projectSelectedId)
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
      this.parentId = row.id
      this.parentName = row.issue_name
      this.addTopicDialogVisible = true
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
          return error
        })
      return res
      // this.addTopicDialogVisible = false
    },
    isParentIssue(row) {
      if (row.parent_id === null && row.children.length === 0) return true
      else return false
    }
  }
}
</script>

<template>
  <div class="app-container">
    <router-view />
    <div v-if="this.$route.meta.rolePage" class="role-Page">
      <div class="clearfix">
        <div>
          <project-list-selector />
          <span class="newBtn">
            <el-button
              id="btn-add-issue"
              type="success"
              style="float: right"
              :disabled="projectSelectedId === -1"
              @click=";(addTopicDialogVisible = true), (parentId = 0)"
            >
              <i class="el-icon-plus" />
              {{ $t('Issue.AddIssue') }}
            </el-button>
          </span>
          <el-input
            id="input-search"
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
        :element-loading-text="$t('Loading')"
        border
        fit
        highlight-current-row
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip>
          <template slot-scope="scope">
            <span :class="isParentIssue(scope.row) ? 'ml-6' : ''">
              <el-tooltip effect="dark" :content="$t('Issue.AddSubIssue')" placement="bottom-start">
                <el-button
                  v-if="parentList.includes(scope.row.id) == true && scope.row.issue_status !== 'Closed'"
                  :id="`btn-add-sub-issue-${scope.$index}`"
                  icon="el-icon-plus"
                  type="text"
                  circle
                  plain
                  size="mini"
                  @click="handleParent(scope.$index, scope.row, scope)"
                />
              </el-tooltip>
              <el-tooltip effect="dark" :content="$t('Issue.EditIssue')" placement="bottom-start">
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
              <span class="text-success mr-2">{{ scope.row.id }}</span>
              <span class="font-weight-regular">{{ scope.row.issue_name }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="150">
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
        <el-table-column align="center" :label="$t('general.Status')" width="150">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.issue_status === 'Active'" type="active" size="medium" effect="dark">
              {{ scope.row.issue_status }}
            </el-tag>
            <el-tag v-else-if="scope.row.issue_status === 'Assigned'" type="assigned" size="medium" effect="dark">
              {{ scope.row.issue_status }}
            </el-tag>
            <el-tag v-else-if="scope.row.issue_status === 'Solved'" type="solved" size="medium" effect="dark">
              {{ scope.row.issue_status }}
            </el-tag>
            <el-tag v-else-if="scope.row.issue_status === 'Responded'" type="responded" size="medium" effect="dark">
              {{ scope.row.issue_status }}
            </el-tag>
            <el-tag v-else-if="scope.row.issue_status === 'Closed'" type="close" size="medium" effect="dark">
              {{ scope.row.issue_status }}
            </el-tag>
            <el-tag v-else type="finish" size="medium" effect="dark"> {{ scope.row.issue_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to" />
        <el-table-column align="center" :label="$t('Issue.Priority')" width="150">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.issue_priority === 'Immediate'" type="danger" size="medium" effect="dark">
              {{ scope.row.issue_priority }}
            </el-tag>
            <el-tag v-else-if="scope.row.issue_priority === 'High'" type="warning" size="medium" effect="dark">
              {{ scope.row.issue_priority }}
            </el-tag>
            <el-tag v-else-if="scope.row.issue_priority === 'Normal'" type="success" size="medium" effect="dark">
              {{ scope.row.issue_priority }}
            </el-tag>
            <el-tag v-else type="slow" size="medium" effect="dark">{{ scope.row.issue_priority }}</el-tag>
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
        :parent-id="parentId"
        :parent-name="parentName"
        @add-topic-visible="emitAddTopicDialogVisible"
      />
    </div>
  </div>
</template>
