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
              icon="el-icon-plus"
              :disabled="selectedProjectId === -1"
              @click="handleAddNewIssue"
            >
              {{ $t('Issue.AddIssue') }}
            </el-button>
          </span>
          <el-input
            id="input-search"
            v-model="searchData"
            prefix-icon="el-icon-search"
            :placeholder="$t('Issue.SearchNameOrAssignee')"
            style="width: 250px; float: right"
          />
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
        height="100%"
      >
        <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip>
          <template slot-scope="scope">
            <span :class="isParentIssue(scope.row) ? 'ml-6' : ''">
              <el-tooltip effect="dark" :content="$t('Issue.AddSubIssue')" placement="bottom-start" :open-delay="1000">
                <el-button
                  v-if="parentList.includes(scope.row.id) && scope.row.status.name !== 'Closed'"
                  :id="`btn-add-sub-issue-${scope.$index}`"
                  icon="el-icon-plus"
                  type="text"
                  circle
                  plain
                  size="mini"
                  @click="handleParent(scope.$index, scope.row, scope)"
                />
              </el-tooltip>
              <el-tooltip effect="dark" :content="$t('Issue.EditIssue')" placement="bottom-start" :open-delay="1000">
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
              <span
                class="font-weight-regular"
                :style="{ 'font-size': '16px', cursor: 'pointer' }"
                :underline="false"
                @click="handleEdit(scope.$index, scope.row)"
              >
                {{ scope.row.name }}
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="130">
          <template slot-scope="scope">
            <span v-if="scope.row.tracker" :class="getCategoryTagType(scope.row.tracker.name)" />
            {{ $t(`Issue.${scope.row.tracker.name}`) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.status.name"
              :type="getStatusTagType(scope.row.status.name)"
              effect="dark"
              class="rounded-xl font-weight-bold"
            >
              {{ $t(`Issue.${scope.row.status.name}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.assigned_to.name }}</span>
            <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Priority')" width="150">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.priority.name" :type="getPriorityTagType(scope.row.priority.name)">
              {{ $t(`Issue.${scope.row.priority.name}`) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
      <add-issue
        :save-data="saveIssue"
        :dialog-visible.sync="addTopicDialogVisible"
        :project-id="selectedProjectId"
        :parent-id="parentId"
        :parent-name="parentName"
        @add-topic-visible="emitAddTopicDialogVisible"
      />
    </div>
  </div>
</template>

<script>
import AddIssue from './components/AddIssue'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import { mapActions, mapGetters } from 'vuex'
import { addIssue } from '@/api/issue'
import { getProjectIssueListByTree } from '@/api/projects'

export default {
  name: 'ProjectIssues',
  components: {
    AddIssue
  },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    addTopicDialogVisible: false,
    search: '',
    parentId: 0,
    parentName: '',
    parentList: []
  }),
  computed: {
    ...mapGetters(['userRole', 'userName']),
    filteredData() {
      return this.listData.filter(data => {
        if (data.assigned_to === null) {
          data.assigned_to = ''
        }
        if (
          this.searchData === '' ||
          data.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
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
              dataChildren1.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
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
                  dataChildren2.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
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
    }
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
      this.listLoading = false
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }

      const data = (await getProjectIssueListByTree(this.selectedProjectId)).data
      this.parentList = []
      data.forEach(item => {
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
      return data
    },
    handleEdit(idx, row) {
      this.$router.push({ name: 'issue-detail', params: { issueId: row.id }})
    },
    handleParent(idx, row) {
      this.parentId = row.id
      this.parentName = row.name
      this.addTopicDialogVisible = true
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then(res => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.loadData()
          this.addTopicDialogVisible = false
          return res
        })
        .catch(error => {
          return error
        })
      // this.addTopicDialogVisible = false
    },
    isParentIssue(row) {
      return row.parent_id === null && row.children.length === 0
    },
    getPriorityTagType(priority) {
      switch (priority) {
        case 'Immediate':
          return 'danger'
        case 'High':
          return 'warning'
        case 'Normal':
          return ''
        case 'Low':
          return 'info'
      }
    },
    getStatusTagType(status) {
      switch (status) {
        case 'Active':
          return ''
        case 'Assigned':
          return 'danger'
        case 'Closed':
          return 'info'
        case 'Solved':
          return 'secondary'
        case 'Responded':
          return 'warning'
        case 'Finished':
          return 'success'
      }
    },
    getCategoryTagType(category) {
      switch (category) {
        case 'Feature':
          return 'point feature'
        case 'Document':
          return 'point document'
        case 'Bug':
          return 'point bug'
        case 'Research':
          return 'point research'
        default:
          return 'point feature'
      }
    },
    handleAddNewIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;
  &.feature {
    background: $feature;
  }
  &.document {
    background: $document;
  }
  &.bug {
    background: $bug;
  }
  &.research {
    background: $research;
  }
}
.el-tag {
  &--secondary {
    background-color: $secondary;
    border-color: $secondary;
  }
}
</style>
