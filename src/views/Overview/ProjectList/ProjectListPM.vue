<template>
  <div class="app-container">
    <div class="flex justify-between">
      <el-button
        icon="el-icon-plus"
        class="buttonPrimary"
        @click="handleAdding"
      >
        {{ $t('Project.AddProject') }}
      </el-button>
      <div class="flex">
        <SearchFilter
          ref="filter"
          :keyword.sync="keyword"
          @changeFilter="fetchData"
        >
          <UpdateButton
            slot="updateButton"
            :list-loading.sync="listLoading"
            @update="fetchData"
          />
        </SearchFilter>
      </div>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      fit
    >
      <el-table-column
        width="60"
        align="center"
        prop="starred"
      >
        <template slot-scope="scope">
          <em
            v-if="scope.row.starred"
            class="el-icon-star-on text-yellow-500 text-2xl cursor-pointer"
            @click="setStar(scope.row.id, false)"
          />
          <em
            v-else
            class="el-icon-star-off text-gray-400 text-xl cursor-pointer"
            @click="setStar(scope.row.id, true)"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Project.Name') + '/' + $t('Project.Identifier')"
        show-overflow-tooltip
        min-width="250"
      >
        <template slot-scope="scope">
          <div class="flex justify-start">
            <div class="flex items-center mr-5">
              <!-- gitlab button -->
              <el-popover
                v-if="scope.row.git_url"
                :disabled="scope.row.disabled || scope.row.is_lock"
                class="mr-1"
                placement="top"
                width="400"
                trigger="hover"
                :open-delay="300"
                :close-delay="50"
              >
                <p
                  :id="`copy-${scope.$index}`"
                  class="text-center"
                >
                  <span class="text-title">{{ scope.row.git_url }}</span>
                </p>
                <div class="flex justify-center">
                  <el-button
                    class="mr-2"
                    icon="el-icon-copy-document"
                    circle
                    size="mini"
                    @click="copyUrl(`copy-${scope.$index}`)"
                  />
                  <a
                    :href="scope.row.git_url"
                    target="_blank"
                  >
                    <el-button
                      circle
                      size="mini"
                    >
                      <em class="ri-external-link-line" />
                    </el-button>
                  </a>
                </div>
                <el-link
                  slot="reference"
                  :underline="false"
                  :disabled="scope.row.disabled || scope.row.is_lock"
                  style="font-size: 18px; padding: 0 3px;"
                >
                  <svg-icon icon-class="gitlab" />
                </el-link>
              </el-popover>
              <!-- redmine button -->
              <el-link
                v-if="scope.row.redmine_url"
                target="_blank"
                class="mr-1"
                style="font-size: 18px; padding: 0 3px;"
                :underline="false"
                :disabled="scope.row.disabled || scope.row.is_lock"
                :href="scope.row.redmine_url"
              >
                <svg-icon icon-class="redmine" />
              </el-link>
              <!-- harbor button -->
              <el-link
                v-if="scope.row.harbor_url"
                target="_blank"
                style="font-size: 18px; padding: 0 3px;"
                :underline="false"
                :disabled="scope.row.disabled || scope.row.is_lock"
                :href="scope.row.harbor_url"
              >
                <svg-icon icon-class="harbor" />
              </el-link>
            </div>
            <div>
              <el-link
                v-if="userRole !== 'QA'"
                :class="scope.row.disabled || scope.row.is_lock ? '' : 'linkTextColor'"
                :underline="false"
                :disabled="scope.row.disabled || scope.row.is_lock"
                @click="handleClick(scope.row)"
              >
                {{ scope.row.display }}
              </el-link>
              <template v-else>
                {{ scope.row.display }}
              </template>
              <br>
              <span class="text-info text-sm">#{{ scope.row.name }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column-tag
        prop="project_status"
        i18n-key="Project"
        :label="$t('Project.IssueStatus')"
        size="medium"
        location="projectListPM"
        min-width="120"
      />
      <el-table-column
        align="center"
        :label="$t('Project.IssueProgress')"
        width="140"
      >
        <template slot-scope="scope">
          {{
            `${scope.row.closed_count ? scope.row.closed_count : "0"} / ${
              scope.row.total_count ? scope.row.total_count : "0"
            }`
          }}
          <br>
          <span class="status-bar-track">
            <span
              class="status-bar"
              :style="`width: ${returnProgress(scope.row.closed_count, scope.row.total_count)}%`"
            />
          </span>
        </template>
      </el-table-column>
      <el-table-column-time
        prop="updated_time"
        :label="$t('Project.IssueUpdate')"
      />
      <el-table-column
        align="center"
        :label="$t('general.owner_name')"
        prop="owner_name"
      />
      <el-table-column
        align="center"
        :label="$t('ProjectSettings.Status')"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :disabled="!scope.row.is_lock"

            :content="scope.row.lock_reason"
          >
            <el-tag v-if="scope.row.is_lock" type="info">
              {{ $t('errorDetail.locked') }}
            </el-tag>
            <el-tag v-else :type="scope.row.disabled ? 'danger' : 'success'">
              {{ scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('general.Actions')"
        header-align="center"
        align="center"
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="userRole !== 'QA' && scope.row.is_lock !== true"
            placement="bottom"
            :content="$t('general.Edit')"
          >
            <em class="ri-file-edit-line finished operate-button" @click="handleEdit(scope.row)" />
          </el-tooltip>
          <el-tooltip
            v-if="scope.row.is_lock !== true"
            placement="bottom"
            :content="$t('general.Delete')"
          >
            <em
              :disabled="permission(scope.row)"
              class="ri-delete-bin-2-line danger operate-button"
              @click="handleDelete(scope.row)"
            />
          </el-tooltip>
          <el-tooltip
            v-if="scope.row.is_lock === true"
            placement="bottom"
            :content="$t('general.ForceDelete')"
          >
            <em
              :disabled="permission(scope.row)"
              class="ri-delete-bin-2-line danger operate-button"
              @click="handleDelete(scope.row, true)"
            />
          </el-tooltip>
          <el-tooltip
            v-if="scope.row.is_lock === true"
            placement="bottom"
            :content="$t('general.Fix')"
          >
            <em class="ri-refresh-fill active operate-button" @click="handleFix(scope.row.id)" />
          </el-tooltip>
          <el-tooltip
            v-if="scope.row.is_lock !== true"
            placement="bottom"
            :content="!scope.row.disabled ? $t('general.Disable') : $t('general.Enable')"
          >
            <em
              :disabled="permission(scope.row)"
              :class="scope.row.disabled
                ? 'ri-play-circle-line finished operate-button'
                : 'ri-pause-circle-line danger operate-button'"
              @click="handleToggle(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="projectListTotal"
      :page="params.page"
      :limit="params.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />

    <CreateProjectDialog
      ref="createProjectDialog"
      @update="fetchData"
    />
    <EditProjectDialog
      v-if="userRole !== 'QA'"
      ref="editProjectDialog"
      :edit-project-obj="editProjectObject"
      @update="fetchData"
    />
    <DeleteProjectDialog
      ref="deleteProjectDialog"
      :delete-project-obj="deleteProject"
      :is-force-delete="forceDelete"
      :project-relation-list="projectRelationList"
      @update="fetchData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { deleteStarProject, postStarProject, getCalculateProjectList } from '@/api/projects'
import { syncProject, getHasSon, getProjectRelation } from '@/api_v2/projects'
import { BasicData, SearchBar, Pagination, Table } from '@/mixins'
import { ElTableColumnTime, ElTableColumnTag } from '@/components'
import {
  CreateProjectDialog,
  EditProjectDialog,
  DeleteProjectDialog,
  SearchFilter,
  UpdateButton
} from './components'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'ProjectListPM',
  components: {
    ElTableColumnTime,
    ElTableColumnTag,
    CreateProjectDialog,
    EditProjectDialog,
    DeleteProjectDialog,
    SearchFilter,
    UpdateButton
  },
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
      editProjectObject: {},
      deleteProject: { id: '', name: '' },
      searchKeys: ['display', 'name', 'owner_name'],
      params: params(),
      listData: [],
      forceDelete: false,
      timeoutId: -1,
      projectRelationList: []
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'userRole',
      'projectList',
      'projectListTotal',
      'userProjectList',
      'selectedProjectId'
    ]),
    getButtonType() {
      return function (disabled) {
        return disabled ? 'success' : 'danger'
      }
    }
  },
  watch: {
    keyword(val) {
      if (val !== null) {
        this.params.offset = 0
        this.params.limit = 10
        this.params.search = this.keyword
        clearTimeout(this.timeoutId)
        this.timeoutId = window.setTimeout(() => this.fetchData(1, 10, val), 1000)
      } else this.keyword = ''
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject', 'getMyProjectList', 'editProject']),
    async fetchData() {
      this.listLoading = true
      this.forceDelete = false
      if (this.$refs.filter) this.getParams()
      else this.params.disabled = 0
      await this.getMyProjectList(this.params)
      this.listLoading = false
      this.listData = this.projectList
      const filteredArray = this.projectList.filter(obj => {
        return obj.is_lock !== true && obj.disabled !== true
      })
      if (filteredArray.length > 0) {
        this.getCalculateProjectData(filteredArray)
      }
      return this.projectList
    },
    getParams() {
      if (this.keyword !== '') {
        this.params.search = this.keyword
      } else delete this.params.search
      if (this.$refs.filter.isDisabled.length === 1) {
        this.params.disabled = this.$refs.filter.isDisabled[0]
      } else {
        delete this.params.disabled
      }
    },
    async getCalculateProjectData(project) {
      const ids = project.map(function (el) {
        return el.id
      })
      const calculated = (await getCalculateProjectList(ids.join())).data
      for (const i in calculated.project_list) {
        calculated.project_list[i].id = parseInt(calculated.project_list[i].id)
      }
      const merged = []
      for (const item of this.listData) {
        merged.push({
          ...item,
          ...calculated.project_list.find(
            (itmInner) => itmInner.id === item.id
          )
        })
      }
      this.listData = merged
    },
    async onPagination(listQuery) {
      const { limit, page } = listQuery
      const offset = limit * (page - 1)
      this.params.offset = offset
      this.params.limit = limit
      this.params.page = page
      await this.fetchData()
    },
    initParams() {
      this.params = params()
    },
    handleAdding() {
      this.$refs.createProjectDialog.showDialog = true
      this.$refs.createProjectDialog.refreshTemplate()
    },
    handleEdit(row) {
      this.editProjectObject = Object.assign({}, row)
      this.$refs.editProjectDialog.showDialog = true
    },
    async handleDelete(row, isForce) {
      this.deleteProject.id = row.id
      this.deleteProject.name = row.name
      if (isForce) this.forceDelete = true
      await this.isHasSon(row.id)
      this.$refs.deleteProjectDialog.showDialog = true
    },
    async isHasSon(projectId) {
      const hasSon = await getHasSon(projectId)
      if (hasSon.has_child) {
        const projectRelation = await getProjectRelation(projectId)
        this.projectRelationList = projectRelation.data[0].child
      } else {
        this.projectRelationList = []
      }
    },
    returnProgress(current, total) {
      if (current) return Math.round((current / total) * 100)
      else return 0
    },
    handleClick(projectObj) {
      const { id } = projectObj
      const selectedProject = this.userProjectList.filter((elm) => {
        return elm.id === id
      })[0]
      this.setSelectedProject(selectedProject)
      localStorage.setItem('projectId', id)
      this.$router.push({ name: 'Overview', params: { projectName: selectedProject.name }})
    },
    copyUrl(id) {
      const message = this.$t('Notify.Copied')
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.showSuccessMessage(message)
    },
    permission(row) {
      const { creator_id, owner_id } = row
      if (this.userRole === 'Administrator') return false
      if (this.userRole === 'QA') {
        if (creator_id !== this.userId) return true
      } else {
        if (owner_id !== this.userId) return true
      }
    },
    async setStar(id, star) {
      const message = this.$t('Notify.Updated')
      star ? await postStarProject(id) : await deleteStarProject(id)
      this.initParams()
      await this.fetchData()
      this.showSuccessMessage(message)
    },
    handleToggle(row) {
      row.disabled = !row.disabled
      const sendData = this.getEditData(row)
      this.handleEditStatus(sendData)
    },
    getEditData(row) {
      return {
        pId: row.id,
        data: {
          display: row.display,
          owner_id: row.owner_id,
          start_date: row.start_date,
          due_date: row.due_date,
          disabled: row.disabled
        }
      }
    },
    handleEditStatus(sendData) {
      this.listLoading = true
      const message = this.$t('Notify.Updated')
      this.editProject(sendData).then((res) => {
        this.listLoading = false
        if (res.message === 'success') {
          this.showSuccessMessage(message)
          this.fetchData()
        } else {
          const error = res.error.message
          this.showErrorMessage(error)
        }
      })
    },
    async handleFix(project_id) {
      this.listLoading = true
      const res = await syncProject(project_id)
      if (res.message === 'success') {
        this.showSuccessMessage(res.message)
        this.fetchData()
      } else {
        const error = res.error.message
        this.showErrorMessage(error)
      }
      this.listLoading = false
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    },
    showErrorMessage(error) {
      this.$message({
        title: this.$t('general.Warning'),
        message: error,
        type: 'warning'
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
