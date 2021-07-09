<template>
  <div class="app-container">
    <div class="flex justify-between">
      <el-button type="success" icon="el-icon-plus" @click="handleAdding">
        {{ $t('Project.AddProject') }}
      </el-button>
      <el-input
        v-model="keyword"
        style="width: 250px"
        :placeholder="$t('Project.SearchProjectNameOrId')"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :default-sort="{prop: 'starred', order: 'descending'}" :element-loading-text="$t('Loading')" border fit>
      <el-table-column
        width="60"
        align="center"
        prop="starred"
        sortable
      >
        <template slot-scope="scope">
          <i v-if="scope.row.starred" class="el-icon-star-on text-yellow-500 text-2xl" @click="setStar(scope.row.id, false)" />
          <i v-else class="el-icon-star-off text-gray-400 text-xl" @click="setStar(scope.row.id, true)" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Project.Name') + '/' + $t('Project.Identifier')"
        show-overflow-tooltip
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
          <span class="text-sm text-gray-400">#{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column-tag
        prop="project_status"
        translate-key="Project"
        :label="$t('Project.IssueStatus')"
        location="projectListPM"
        min-width="120"
      />
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
      <el-table-column-time prop="updated_time" :label="$t('Project.IssueUpdate')" />
      <el-table-column v-if="userRole !== 'QA'" align="center" label="GitLab" width="110">
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
              <span class="font-base font-bold">{{ scope.row.git_url }}</span>
            </p>
            <div class="flex justify-center">
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
      <el-table-column v-if="userRole !== 'QA'" align="center" label="Redmine" width="110">
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
      <el-table-column v-if="userRole !== 'QA'" align="center" label="Harbor" width="110">
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
            :disabled="isAllowDelete(scope.row)"
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
import { BasicData, SearchBar, Pagination, Table } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import { deleteStarProject, postStarProject } from '@/api/projects'

export default {
  name: 'ProjectListPM',
  components: { ElTableColumnTime, CreateProjectDialog, EditProjectDialog, DeleteProjectDialog, ElTableColumnTag },
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
  mixins: [BasicData, SearchBar, Pagination, Table],
  data() {
    return {
      editProject: {},
      deleteProject: { id: '', name: '' },
      searchKeys: ['display', 'name'],
      rowHeight: 74
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
    ...mapActions('projects', ['setSelectedProject', 'getMyProjectList']),
    async fetchData() {
      await this.getMyProjectList()
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
    },
    isAllowDelete(row) {
      const { creator_id, owner_id } = row
      if (this.userRole === 'QA') {
        if (creator_id !== this.userId) return true
      } else if (this.userRole === 'Administrator') {
        return false
      } else {
        if (owner_id !== this.userId) return true
      }
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
