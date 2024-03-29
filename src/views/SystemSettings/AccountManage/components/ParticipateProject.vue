<template>
  <div class="app-container">
    <div class="flex justify-between">
      <div class="text-xl mr-3">
        <el-button
          type="text"
          size="medium"
          icon="el-icon-arrow-left"
          class="previous"
          @click="handleBackPage"
        >
          {{ $t('general.Back') }}
        </el-button>
        <span class="ml-2 text-xl">
          <span>
            {{ $t('Issue.FilterDimensions.assigned_to') }}
          </span>
          :
          <span>
            {{ projectMember }}
          </span>
        </span>
      </div>
      <el-input
        v-model="keyword"
        :placeholder="$t('Project.SearchProjectName')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      :cell-style="{ height: rowHeight + 'px' }"
      fit
      highlight-current-row
    >
      <el-table-column
        align="center"
        prop="display"
        :label="$t('Project.Name')"
        width="500"
      />
      <el-table-column
        align="center"
        prop="owner_name"
        :label="$t('Project.Owner')"
      />
      <el-table-column
        align="center"
        prop="start_date"
        :label="$t('Project.StartDate')"
      />
      <el-table-column
        align="center"
        prop="due_date"
        :label="$t('general.DueDate')"
      />
      <el-table-column
        align="center"
        :label="$t('general.Actions')"
      >
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :content="$t('general.Participate')"
          >
            <em
              v-if="$route.params.user_id !== scope.row.owner_id"
              class="ri-file-list-2-line active operate-button"
              @click="handleParticipateDialog(scope.row.owner_id)"
            />
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('Issue.Issue')"
          >
            <em
              class="ri-file-copy-2-line active operate-button"
              @click="handleIssueClick(scope.row)"
            />
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('general.Remove')"
          >
            <el-popconfirm
              :confirm-button-text="$t('general.Remove')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              :title="$t('Member.confirmRemove')"
              @confirm="handleDelete(scope.row.id)"
            >
              <em
                slot="reference"
                class="ri-delete-bin-2-line danger operate-button"
                :disabled="isDisabled"
              />
            </el-popconfirm>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-if="listData && listData.length > 0"
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { getParticipateProject, deleteProjectMember } from '@/api/projects'
import { getUserInfo } from '@/api/user'

export default {
  name: 'ParticipateProject',
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      rowHeight: 70,
      projectMember: ''
    }
  },
  computed: {
    ...mapGetters(['userId']),
    isDisabled() {
      return this.$route.params.userId === this.userId
    }
  },
  watch: {
    '$route.params.userId': {
      handler(val) {
        this.fetchData(val)
        this.getUserInfo(val)
      },
      immediate: true
    }
  },
  methods: {
    async fetchData(user_id) {
      if (!user_id) return
      this.listLoading = true
      const projectsByUser = await getParticipateProject(user_id)
      this.listData = projectsByUser.data
      this.listLoading = false
    },
    async getUserInfo(user_id) {
      const userInfo = await getUserInfo(user_id)
      this.projectMember = userInfo.name
    },
    async handleDelete(project_id) {
      this.listLoading = true
      try {
        await deleteProjectMember(project_id, this.$route.params.userId)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.fetchData(this.$route.params.userId)
      } catch (error) {
        console.error(error)
        this.listLoading = false
      }
    },
    handleBackPage() {
      this.$router.go(-1)
    },
    handleParticipateDialog(owner_id) {
      this.$router.push({ name: 'ParticipateProject', params: { userId: owner_id }})
    },
    handleIssueClick(row) {
      const { owner_id, name } = row
      this.$router.push({ name: 'IssueTransfer', params: { userId: owner_id, userName: name }})
    }
  }
}
</script>
