<template>
  <div class="app-container">
    <div class="flex justify-between">
      <el-button type="success" icon="el-icon-plus" @click="handleAdding">
        {{ $t('Project.AddProject') }}
      </el-button>
      <div>
        <el-popover>
          <el-date-picker
            v-model="selectedDate"
            type="daterange"
            align="right"
            range-separator="~"
            :start-placeholder="getThisYear[0]"
            :end-placeholder="getThisYear[1]"
            value-format="yyyy-MM-dd"
            @change="handleDatePicked"
          />
          <el-button slot="reference" icon="el-icon-date" type="text">
            {{ $t('Project.ProjectPeriod') }}:{{ getThisYear[0] }} ~ {{ getThisYear[1] }}<em class="el-icon-arrow-down el-icon--right" />
          </el-button>
        </el-popover>
        <el-divider direction="vertical" />
        <el-input
          v-if="searchVisible"
          id="input-search"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('Project.SearchProjectNameOrManagerOrOrganization')"
          style="width: 250px;"
          @blur="searchVisible = !searchVisible"
        />
        <el-button v-else type="text" icon="el-icon-search" @click="searchVisible = !searchVisible">
          {{ $t('general.Search') + (keyword ? ': ' + keyword : '') }}
        </el-button>
        <template v-if="keyword !== ''">
          <el-divider direction="vertical" />
          <el-button size="small" icon="el-icon-close" @click="cleanFilter">
            {{ $t('Issue.CleanFilter') }}
          </el-button>
        </template>
        <span v-show="hasSelectedProject">
          <el-divider direction="vertical" />
          <el-button type="text" icon="el-icon-download" @click="downloadCsv(selectedProjectList)">{{
            $t('Dashboard.ADMIN.ProjectList.csv_download')
          }}</el-button>
        </span>
      </div>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      :row-key="handleReserve"
      :cell-style="{ height: rowHeight + 'px' }"
      fit
      highlight-current-row
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" reserve-selection width="55" />
      <el-table-column width="60" align="center" prop="starred">
        <template slot-scope="scope">
          <em
            v-if="scope.row.starred"
            class="el-icon-star-on text-yellow-500 text-2xl"
            @click="setStar(scope.row.id, false)"
          />
          <em v-else class="el-icon-star-off text-gray-400 text-xl" @click="setStar(scope.row.id, true)" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('Dashboard.ADMIN.ProjectList.organization')" prop="department" width="150" />
      <el-table-column
        :label="`${$t('general.project_name')} / ${$t('Project.Identifier')}`"
        :show-overflow-tooltip="true"
        min-width="250"
      >
        <template slot-scope="scope">
          <el-link v-if="userRole !== 'QA'" type="primary" :underline="false" @click="handleClick(scope.row)">
            {{ scope.row.display }}
          </el-link>
          <el-link v-else-if="userRole === 'QA'" type="primary" :underline="false" @click="handleClickQA(scope.row)">
            {{ scope.row.display }}
          </el-link>
          <template v-else>
            {{ scope.row.display }}
          </template>
          <br>
          <span style="color: #949494; font-size: small;">#{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.owner_name')" width="90">
        <template slot-scope="scope">
          <el-link
            type="primary"
            :underline="false"
            @click="handleParticipateDialog(scope.row.owner_id, scope.row.owner_name)"
          >
            {{ scope.row.owner_name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.IssueProgress')" width="140">
        <template slot-scope="scope">
          {{ `${scope.row.closed_count} / ${scope.row.total_count}` }}
          <br>
          <span class="status-bar-track">
            <span
              class="status-bar"
              :style="`width: ${returnProgress(scope.row.closed_count, scope.row.total_count)}%`"
            />
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Dashboard.ADMIN.ProjectList.project_start_date')" prop="start_date" width="120" />
      <el-table-column :label="$t('Dashboard.ADMIN.ProjectList.project_due_date')" prop="due_date" width="120" />
      <el-table-column :label="$t('Dashboard.ADMIN.ProjectList.user_name')" width="90">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" @click="handleRoutingProjectMembers(scope.row)">
            {{ scope.row.members }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.DueDate')" width="80">
        <template slot-scope="scope">
          {{ calculateDays(scope.row.due_date, scope.row.start_date) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            v-if="userRole !== 'QA'"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-button
            :disabled="scope.row.creator_id !== userId"
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >
            {{ $t('general.Delete') }}
          </el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <CreateProjectDialog ref="createProjectDialog" @update="loadData" />
    <EditProjectDialog
      v-if="userRole !== 'QA'"
      ref="editProjectDialog"
      :edit-project-obj="editProject"
      @update="loadData"
    />
    <DeleteProjectDialog ref="deleteProjectDialog" :delete-project-obj="deleteProject" @update="loadData" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { CreateProjectDialog, DeleteProjectDialog, EditProjectDialog } from './components'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { csvTranslate } from '@/utils/csvTableTranslate'
import { deleteStarProject, postStarProject } from '@/api/projects'
import XLSX from 'xlsx'

export default {
  name: 'ProjectListQA',
  components: { CreateProjectDialog, EditProjectDialog, DeleteProjectDialog },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      editProject: {},
      deleteProject: { id: '', name: '' },
      searchKeys: ['display', 'department', 'owner_name'],
      rowHeight: 70,
      selectedProjectList: [],
      selectedDate: '',
      thisYear: new Date(),
      searchVisible: false,
      csvColumnSelected: ['department', 'display', 'start_date', 'due_date', 'owner_name', 'members']
    }
  },
  computed: {
    ...mapGetters(['userId', 'userRole', 'projectList', 'projectListTotal', 'userProjectList', 'selectedProjectId']),
    hasSelectedProject() {
      return this.selectedProjectList.length > 0
    },
    getThisYear() {
      return [`${this.thisYear.getFullYear()}-01-01`, `${this.thisYear.getFullYear() + 1}-12-31`]
    }
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject', 'getMyProjectList']),
    async fetchData(date = this.getThisYear) {
      const params = {
        pj_due_date_start: date[0],
        pj_due_date_end: date[1],
        pj_members_count: true
      }
      await this.getMyProjectList(params)
      return this.projectList
    },
    cleanFilter() {
      this.keyword = ''
    },
    handleAdding() {
      this.$refs.createProjectDialog.showDialog = true
      this.$refs.createProjectDialog.refreshTemplate()
    },
    handleEdit(row) {
      this.editProject = Object.assign({}, row)
      this.$refs.editProjectDialog.showDialog = true
    },
    handleDelete(row) {
      this.deleteProject.id = row.id
      this.deleteProject.name = row.name
      this.$refs.deleteProjectDialog.showDialog = true
    },
    returnProgress(current, total) {
      return Math.round((current / total) * 100)
    },
    handleClick(projectObj) {
      const { id } = projectObj
      localStorage.setItem('projectId', id)
      const selectedProject = this.userProjectList.filter(elm => {
        return elm.id === id
      })[0]
      this.setSelectedProject(selectedProject)
      this.$router.push({ name: 'issue-list' })
    },
    handleClickQA(projectObj) {
      const { id } = projectObj
      localStorage.setItem('projectId', id)
      const selectedProject = this.userProjectList.filter(elm => {
        return elm.id === id
      })[0]
      this.setSelectedProject(selectedProject)
      this.$router.push({ name: 'milestone' })
    },
    copyUrl(id) {
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Copied'),
        type: 'success'
      })
    },
    downloadCsv(selectedProjectList) {
      const selectedColumn = []
      const translateTable = []
      selectedProjectList.forEach(item => {
        const targetObject = {}
        this.csvColumnSelected.map(itemSelected => {
          this.$set(targetObject, itemSelected, item[itemSelected])
        })
        selectedColumn.push(targetObject)
      })
      selectedColumn.forEach(item => {
        const chineseCsv = {}
        const chineseColumnKey = Object.keys(item).map(key => {
          key = csvTranslate.projectlistQA[key]
          return key
        })
        Object.values(item).map((val, index) => {
          this.$set(chineseCsv, chineseColumnKey[index], val)
        })
        translateTable.push(chineseCsv)
      })
      const worksheet = XLSX.utils.json_to_sheet(translateTable)
      this.$csv(worksheet, 'projectlist')
    },
    handleReserve(row) {
      return row.id
    },
    handleSelectionChange(list) {
      this.selectedProjectList = list
    },
    handleDatePicked(date) {
      this.loadData(date)
    },
    calculateDays(endDay, startDay) {
      const start = new Date(startDay)
      const end = new Date(endDay)
      return this.dayDifference(start, end)
    },
    dayDifference(date1, date2) {
      const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
      const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
      const day = 1000 * 60 * 60 * 24
      return (date2utc - date1utc) / day
    },
    handleParticipateDialog(user_id, owner_name) {
      this.$router.push({ name: 'ParticipateProject', params: { user_id, owner_name }})
    },
    handleRoutingProjectMembers(projectObj) {
      const { id } = projectObj
      localStorage.setItem('projectId', id)
      const selectedProject = this.userProjectList.filter(elm => {
        return elm.id === id
      })[0]
      this.setSelectedProject(selectedProject)
      this.$router.push({ name: 'Project Settings' })
    },
    async setStar(id, star) {
      if (star) {
        await postStarProject(id)
        await this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } else {
        await deleteStarProject(id)
        await this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-bar-track {
  background: #f5f5f5;
  border-radius: 5px;
  max-width: 160px;
  width: 100%;
  height: 4px;
  position: relative;
  margin-bottom: 3px;
  margin-left: 5px;
  display: inline-block;
}

.status-bar {
  position: absolute;
  left: 0;
  top: 0;
  background: #3ecbbc;
  height: 4px;
}
</style>
