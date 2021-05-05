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
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      height="100%"
      :cell-style="{ height: rowHeight + 'px' }"
    >
      <el-table-column
        :label="$t('Project.Name') + '/' + $t('Project.Identifier')"
        :show-overflow-tooltip="true"
        min-width="250"
      >
        <template slot-scope="scope">
          <el-link v-if="userRole !== 'QA'" type="primary" :underline="false" @click="handleClick(scope.row)">
            {{ scope.row.display }}
          </el-link>
          <template v-else>
            {{ scope.row.display }}
          </template>
          <br>
          <span style="color: #949494; font-size: small;">#{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.Status')" width="100">
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.project_status === '進行中'"
            class="el-tag--circle"
            type="success"
            size="medium"
            effect="dark"
          >
            {{ scope.row.project_status }}
          </el-tag>
          <el-tag v-else class="el-tag--circle" type="none" size="medium" effect="dark">
            {{ scope.row.project_status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.Progress')" width="140">
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
      <el-table-column-time prop="updated_time" />
      <el-table-column align="center" label="GitLab" width="110">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.git_url"
            placement="top"
            width="400"
            trigger="hover"
            :open-delay="300"
            :close-delay="50"
          >
            <p :id="`copy-${scope.$index}`" class="text-center">
              <span class="text-subtitle-1 font-weight-bold">{{ scope.row.git_url }}</span>
            </p>
            <div class="d-flex justify-center">
              <el-button
                class="mr-2"
                icon="el-icon-copy-document"
                circle
                size="mini"
                @click="copyUrl(`copy-${scope.$index}`)"
              />
              <a :href="scope.row.git_url" target="_blank">
                <el-button circle size="mini">
                  <svg-icon icon-class="foreign" />
                </el-button>
              </a>
            </div>
            <el-link slot="reference" :underline="false" style="font-size: 22px">
              <svg-icon icon-class="gitlab" />
            </el-link>
          </el-popover>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Redmine" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.redmine_url"
            target="_blank"
            style="font-size: 22px"
            :underline="false"
            :href="scope.row.redmine_url"
          >
            <svg-icon icon-class="redmine" />
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Harbor" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.harbor_url"
            target="_blank"
            style="font-size: 22px"
            :underline="false"
            :href="scope.row.harbor_url"
          >
            <svg-icon icon-class="harbor" />
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="210">
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
import MixinElTable from '@/components/MixinElTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'ProjectListPM',
  components: { ElTableColumnTime, CreateProjectDialog, EditProjectDialog, DeleteProjectDialog },
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
  mixins: [MixinElTable],
  data() {
    return {
      editProject: {},
      deleteProject: { id: '', name: '' },
      searchKey: 'display',
      rowHeight: 70
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'userRole',
      'projectList',
      'projectListTotal',
      'userProjectList',
      'userProjectList',
      'selectedProjectId'
    ])
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject', 'queryProjectList']),
    async fetchData() {
      await this.queryProjectList()
      return this.projectList
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
      this.$router.push({ name: 'Overview' })
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
