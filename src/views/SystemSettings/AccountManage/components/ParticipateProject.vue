<template>
  <div class="app-container">
    <div class="text-xl mr-3">
      <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
        {{ $t('general.Back') }}
      </el-button>
      <span class="ml-2 text-xl">
        <span> {{ $t('Issue.FilterDimensions.assigned_to') }} </span>
        :
        <span>{{ projectMember }}</span>
      </span>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="100%"
      :cell-style="{ height: rowHeight + 'px' }"
      fit
      highlight-current-row
    >
      <el-table-column align="center" prop="display" :label="$t('Project.Name')" width="500" />
      <el-table-column align="center" prop="owner_name" :label="$t('Project.Owner')" />
      <el-table-column align="center" prop="start_date" :label="$t('Project.StartDate')" />
      <el-table-column align="center" prop="due_date" :label="$t('general.DueDate')" />
      <el-table-column align="center" :label="$t('general.Actions')">
        <template slot-scope="scope">
          <el-popconfirm
            :confirm-button-text="$t('general.Remove')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            :title="$t('Member.confirmRemove')"
            @onConfirm="handleDelete(scope.row.id)"
          >
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" :disabled="isDisabled">
              {{ $t('general.Remove') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="listData && listData.length > 0"
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getParticipateProject, deleteProjectMember } from '@/api/projects'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import { getUserInfo } from '@/api/user'

export default {
  name: 'ParticipateProject',
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      rowHeight: 70,
      projectMember: ''
    }
  },
  computed: {
    ...mapGetters(['userId']),
    isDisabled() {
      return this.$route.params.user_id === this.userId
    }
  },
  watch: {
    '$route.params.user_id': {
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
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async handleDelete(project_id) {
      this.listLoading = true
      try {
        await deleteProjectMember(project_id, this.$route.params.user_id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.fetchData(this.$route.params.user_id)
      } catch (error) {
        console.error(error)
        this.listLoading = false
      }
    },
    handleBackPage() {
      this.$router.go(-1)
    }
  }
}
</script>
