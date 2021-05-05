<template>
  <div class="app-container">
    <router-view />
    <div v-if="this.$route.meta.rolePage" class="role-Page">
      <div class="clearfix">
        <div>
          <project-list-selector />
          <!--          <el-select-->
          <!--            v-model="versionValue"-->
          <!--            :placeholder="$t('Version.SelectVersion')"-->
          <!--            :disabled="selectedProjectId === -1"-->
          <!--            class="mr-4"-->
          <!--            filterable-->
          <!--            @change="updateData"-->
          <!--          >-->
          <!--            <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />-->
          <!--            <el-option v-for="item in fixed_version" :key="item.id" :label="item.name" :value="item.id" />-->
          <!--          </el-select>-->
          <!--          <el-select-->
          <!--            v-model="trackerValue"-->
          <!--            :placeholder="$t('Issue.SelectType')"-->
          <!--            :disabled="selectedProjectId === -1"-->
          <!--            class="mr-4"-->
          <!--            filterable-->
          <!--            clearable-->
          <!--            @change="updateData"-->
          <!--          >-->
          <!--            <el-option v-for="item in tracker" :key="item.id" :label="$t('Issue.'+item.name)" :value="item.id">-->
          <!--              <tracker :name="item.name" />-->
          <!--            </el-option>-->
          <!--          </el-select>-->
          <el-button
            id="btn-add-issue"
            type="success"
            icon="el-icon-plus"
            :disabled="selectedProjectId === -1"
            @click="handleAddNewIssue"
          >
            {{ $t('Issue.AddIssue') }}
          </el-button>
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
            <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150">
          <template slot-scope="scope">
            <status
              v-if="scope.row.status.name"
              :name="scope.row.status.name"
            />
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
            <priority v-if="scope.row.priority.name" :name="scope.row.priority.name" />
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
import { addIssue, getIssueTracker } from '@/api/issue'
import { getProjectIssueListByTree, getProjectVersion } from '@/api/projects'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import Fuse from 'fuse.js'

export default {
  name: 'ProjectIssues',
  components: {
    AddIssue,
    Priority,
    Status,
    Tracker
  },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    addTopicDialogVisible: false,
    search: '',
    parentId: 0,
    parentName: '',
    versionValue: '-1',
    trackerValue: '',
    fixed_version: [],
    tracker: [],
    listFilterVersionTrackerData: [],
    parentList: []
  }),
  computed: {
    ...mapGetters(['userRole', 'userName']),
    filteredData() {
      return this.listFilterVersionTrackerData.filter(data => {
        if (Object.keys(data.assigned_to).length <= 0) {
          data.assigned_to.name = ''
        }
        if (
          this.searchData === '' ||
          data.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
          data.assigned_to.name.toLowerCase().includes(this.searchData.toLowerCase())
        ) {
          return data
        }

        // Sub issue level 1
        if (data.children.length > 0) {
          const children1 = data.children.filter(dataChildren1 => {
            if (Object.keys(dataChildren1.assigned_to).length <= 0) {
              dataChildren1.assigned_to.name = ''
            }
            if (
              dataChildren1.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
              dataChildren1.assigned_to.name.toLowerCase().includes(this.searchData.toLowerCase())
            ) {
              return dataChildren1
            }
            // Sub issue level 2
            if (dataChildren1.children.length > 0) {
              const children2 = dataChildren1.children.filter(dataChildren2 => {
                if (Object.keys(dataChildren2.assigned_to).length <= 0) {
                  dataChildren2.assigned_to.name = ''
                }
                if (
                  dataChildren2.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
                  dataChildren2.assigned_to.name.toLowerCase().includes(this.searchData.toLowerCase())
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
  watch: {
    listData: {
      deep: true,
      handler() {
        this.resetFilterVersionTrackerData()
      }
    }
  },
  mounted() {
    this.adjustTable()
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
      const versionsRes = await getProjectVersion(this.selectedProjectId)
      this.fixed_version = [{ name: '版本未定', id: '' }, ...versionsRes.data.versions]
      const issueTrackerRes = await getIssueTracker()
      this.tracker = issueTrackerRes.data
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
    resetFilterVersionTrackerData() {
      this.listFilterVersionTrackerData = this.listData
    },
    updateData() {
      console.log('updateData')
      this.resetFilterVersionTrackerData()
      const versionOpt = {
        keys: ['fixed_version.id'],
        useExtendedSearch: true
      }
      const userOpt = {
        keys: ['tracker.id'],
        useExtendedSearch: true
      }
      if (this.versionValue !== '-1') {
        this.searchIssueList(this.versionValue, versionOpt)
      }
      if (this.trackerValue !== '') {
        this.searchIssueList(this.trackerValue, userOpt)
      }
    },
    searchIssueList(value, opt) {
      if (value === '') {
        this.listFilterVersionTrackerData = this.listData.filter(subItem => {
          const findKey = opt['keys'][0].split('.')
          const findName = findKey.reduce((total, current) => total[current], subItem)
          return findName === undefined || findKey[0] === ''
        })
      } else {
        const fuse = new Fuse(this.listData, opt)
        const res = fuse.search(`="${value}"`)
        this.listFilterVersionTrackerData = res.map(items => items.item)
      }
    },
    handleEdit(idx, row) {
      this.$router.push({ path: `issue-list/${row.id}` })
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
    handleAddNewIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
