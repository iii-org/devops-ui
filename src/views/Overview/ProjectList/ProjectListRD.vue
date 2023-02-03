<template>
  <div class="app-container">
    <div class="text-right">
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
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 300px)"
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
            class="el-icon-star-on text-yellow-500 text-2xl"
            @click="setStar(scope.row.id, false)"
          />
          <em
            v-else
            class="el-icon-star-off text-gray-400 text-xl"
            @click="setStar(scope.row.id, true)"
          />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Project.NameIdentifier')"
        :show-overflow-tooltip="true"
        min-width="200"
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
                  :disabled="scope.row.disabled || scope.row.is_lock"
                  :underline="false"
                  style="font-size: 22px"
                >
                  <svg-icon icon-class="gitlab" />
                </el-link>
              </el-popover>
              <!-- redmine button -->
              <el-link
                v-if="scope.row.redmine_url"
                target="_blank"
                class="mr-1"
                style="font-size: 22px"
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
                style="font-size: 22px"
                :underline="false"
                :disabled="scope.row.disabled || scope.row.is_lock"
                :href="scope.row.harbor_url"
              >
                <svg-icon icon-class="harbor" />
              </el-link>
            </div>
            <div>
              <el-link
                :underline="false"
                :class="scope.row.disabled || scope.row.is_lock ? '' : 'linkTextColor'"
                :disabled="scope.row.disabled || scope.row.is_lock"
                @click="handleClick(scope.row)"
              >
                {{ scope.row.display }}
              </el-link>
              <br>
              <span
                class="text-info text-sm"
                style="float: left;"
              >
                #{{ scope.row.name }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Project.WorkloadValue')"
        width="120"
      >
        <template slot-scope="scope">
          {{ scope.row.issues >= 0 ? scope.row.issues : '-' }}
        </template>
      </el-table-column>
      <el-table-column-time
        prop="next_d_time"
        :label="$t('Project.UpcomingDeadline')"
      />
      <el-table-column
        align="center"
        :label="$t('Project.LastTest')"
        width="190"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.last_test_time === ''">No Test</span>
          <el-tooltip
            v-else
            placement="bottom"
            :content="getLocalTime(scope.row.last_test_time)"
          >
            <span>{{ getRelativeTime(scope.row.last_test_time) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Project.LastTestResult')"
        width="170"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.last_test_result !== undefined"
            class="el-tag--circle"
            :type="returnTagType(scope.row)"
            size="large"
            effect="dark"
          >
            <em
              v-if="returnTagType(scope.row) === 'success'"
              class="el-icon-success"
            />
            <em
              v-else
              class="el-icon-error"
            />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
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
            :disabled="(!permission(scope.row)) || scope.row.is_lock!==true"
            :open-delay="200"
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
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getLocalTime, getRelativeTime } from '@/utils/handleTime'
import { deleteStarProject, postStarProject, getCalculateProjectList } from '@/api/projects'
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'
import { ElTableColumnTime } from '@/components'
import { SearchFilter, UpdateButton } from './components'

const params = () => ({
  limit: 10,
  offset: 0,
  test_result: true
})

export default {
  name: 'ProjectListRD',
  components: {
    ElTableColumnTime,
    SearchFilter,
    UpdateButton
  },
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      searchKeys: ['display', 'name', 'owner_name'],
      params: params(),
      listData: []
    }
  },
  computed: {
    ...mapGetters(['userId', 'userRole', 'projectList', 'projectListTotal', 'userProjectList'])
  },
  watch: {
    keyword(val) {
      if (val !== null) {
        if (val.length > 2 || val === '') {
          this.params.offset = 0
          this.params.limit = 10
          this.params.search = this.keyword
          this.fetchData()
        }
      } else this.keyword = ''
    }
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject', 'getMyProjectList']),
    async fetchData() {
      this.listLoading = true
      if (this.$refs.filter) this.getParams()
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
      await this.fetchData()
      this.initParams()
    },
    initParams() {
      this.params = params()
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
    returnTagType(row) {
      if (row.last_test_result) {
        const { success, total } = row.last_test_result
        if (!success || !total) return 'info'
        return success === total ? 'success' : 'danger'
      }
    },
    testResults(row) {
      if (row.last_test_result) {
        const { success, total } = row.last_test_result
        if (!success || !total) return 'No Test'
        return `${success} / ${total}`
      } else {
        return '-'
      }
    },
    copyUrl(id) {
      const message = this.$t('Notify.Copied')
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.showSuccessMessage(message)
    },
    async setStar(id, star) {
      const message = this.$t('Notify.Updated')
      star ? await postStarProject(id) : await deleteStarProject(id)
      await this.fetchData()
      this.showSuccessMessage(message)
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    },
    handleClick(projectObj) {
      const { id } = projectObj
      const selectedProject = this.userProjectList.filter((elm) => {
        return elm.id === id
      })[0]
      this.setSelectedProject(selectedProject)
      localStorage.setItem('projectId', id)
      this.$router.push({ name: 'IssueBoards', params: { projectName: selectedProject.name }})
    },
    getLocalTime(time) {
      return getLocalTime(time)
    },
    getRelativeTime(time) {
      return getRelativeTime(time)
    }
  }
}
</script>
