<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import { CreateProjectDialog, DeleteProjectDialog } from './components'

export default {
  name: 'ProjectListPM',
  components: { Pagination, CreateProjectDialog, DeleteProjectDialog },
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
  data: () => ({
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',
    dialogStatus: 1,
    editProject: {},
    deleteProject: { id: '', name: '' }
  }),
  computed: {
    ...mapGetters(['projectList', 'projectListTotal', 'userProjectList']),
    pagedData() {
      const listData = this.projectList.filter(data => {
        if (this.searchData === '' || data.display.toLowerCase().includes(this.searchData.toLowerCase())) {
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
    searchData() {
      this.listQuery.page = 1
    }
  },
  async created() {
    this.loadList()
  },
  methods: {
    ...mapActions('projects', ['changeSelectedProjectId', 'changeSelectedProjectObject', 'queryProjectList']),
    async loadList() {
      this.listLoading = true
      await this.queryProjectList()
      this.listLoading = false
    },
    handleAdding() {
      this.$refs.createProjectDialog.showDialog = true
      this.dialogStatus = 1
    },
    handleEdit(row) {
      this.$refs.createProjectDialog.showDialog = true
      this.dialogStatus = 2
      this.editProject = Object.assign(
        {},
        {
          id: row.id,
          name: row.name,
          display: row.display,
          description: row.description,
          disabled: row.disabled
        }
      )
    },
    handleDelete(row) {
      this.$refs.deleteProjectDialog.showDialog = true
      this.deleteProject.id = row.id
      this.deleteProject.name = row.name
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    returnProgress(current, total) {
      const percent = Math.round((current / total) * 100)
      return percent
    },
    handleClick(id) {
      localStorage.setItem('project', id)
      this.changeSelectedProjectId(id)
      this.changeSelectedProjectObject(this.userProjectList.filter(elm => elm.id === id)[0])
      this.$router.push({ name: 'Overview' })
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="d-flex justify-space-between">
      <el-button type="success" icon="el-icon-plus" @click="handleAdding">
        {{ $t('Project.AddProject') }}
      </el-button>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input"
        style="width: 250px"
        :placeholder="$t('Project.SearchProjectName')"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column :label="$t('Project.Name')" :show-overflow-tooltip="true" min-width="250">
        <template slot-scope="scope">
          <el-link type="primary" style="font-size: 16px" :underline="false" @click="handleClick(scope.row.id)">
            {{ scope.row.display }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Project.Identifier')" min-width="200" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span style="color: #949494; font-weight: 400">#{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.Status')" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.project_status === '進行中'" type="success" size="medium" effect="dark">{{
            scope.row.project_status
          }}</el-tag>
          <el-tag v-else type="none" size="medium" effect="dark">{{ scope.row.project_status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.Progress')" width="240">
        <template slot-scope="scope">
          {{ `${scope.row.closed_count} / ${scope.row.total_count}` }}
          <span class="status-bar-track">
            <span
              class="status-bar"
              :style="`width: ${returnProgress(scope.row.closed_count, scope.row.total_count)}%`"
            />
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.UpdateTime')" width="170">
        <template slot-scope="scope">
          {{ scope.row.updated_time | relativeTime }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="GitLab" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.git_url"
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.git_url"
          >
            <i class="el-icon-link" /> GitLab
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Redmine" width="120">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.redmine_url"
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.redmine_url"
          >
            <i class="el-icon-link" /> Redmine
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Harbor" width="120">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.harbor_url"
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            :href="scope.row.harbor_url"
          >
            <i class="el-icon-link" /> Harbor
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="210">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">
            {{ $t('general.Edit') }}
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">
            {{ $t('general.Delete') }}
          </el-button>
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

    <CreateProjectDialog
      ref="createProjectDialog"
      :dialog-status="dialogStatus"
      :edit-project-obj="editProject"
      @update="loadList"
    />
    <DeleteProjectDialog ref="deleteProjectDialog" :delete-project-obj="deleteProject" @update="loadList" />
  </div>
</template>
