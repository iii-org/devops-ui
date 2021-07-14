<template>
  <el-collapse-item v-loading="listLoading" name="ProjectMembers">
    <template slot="title">
      <span class="text-title">{{ $t('Member.Manage') }}</span>
    </template>
    <div class="flex justify-between mb-4">
      <el-button type="success" size="medium" icon="el-icon-plus" @click="showDialog">
        {{ $t('Member.AddMember') }}
      </el-button>
      <div>
        <span class="font-bold mx-2">{{ $t('Project.Owner') }}</span>
        <el-select
          v-model="selectedProject.owner_id"
          size="medium"
          :disabled="disabledEditOwner"
          @change="setProjectOwner"
        >
          <el-option v-for="user in assignedList" :key="user.id" :value="user.id" :label="user.label">
            {{ user.label }}
          </el-option>
        </el-select>
      </div>
      <el-input
        v-model="keyword"
        size="medium"
        prefix-icon="el-icon-search"
        :style="{ width: '140px' }"
        :placeholder="$t('general.SearchName')"
      />
    </div>
    <el-table :data="pagedData" border fit>
      <el-table-column align="center" prop="id" :label="$t('Member.Id')" />
      <el-table-column align="center" prop="login" :label="$t('Member.Account')" />
      <el-table-column align="center" prop="name" :label="$t('general.Name')" />
      <el-table-column align="center" prop="phone" :label="$t('Member.Phone')" />
      <el-table-column align="center" :label="$t('Member.Role')">
        <template slot-scope="scope">
          {{ getRoleName(scope.row.id) }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')" width="390">
        <template slot-scope="scope">
          <el-button v-show="userRole === 'Administrator' || userRole === 'QA'" size="mini" type="primary" @click="handleParticipateDialog(scope.row.id)">
            <i class="el-icon-edit" />
            {{ $t('general.Participate') }}
          </el-button>
          <el-button type="primary" size="mini" @click="handleIssueClick(scope.row)">{{ $t('Issue.Issue') }}</el-button>
          <el-button
            type="danger"
            size="mini"
            :disabled="scope.row.id === userId"
            @click="handleDeleteClick(scope.row)"
          >
            {{ $t('general.Remove') }}
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

    <add-member-dialog ref="addMemberDialog" @update="loadData" />
  </el-collapse-item>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar } from '@/newMixins'
import { getUserIssueList } from '@/api/user'
import { getProjectUserList, deleteProjectMember, updateProjectInfos } from '@/api/projects'
import AddMemberDialog from './AddMemberDialog'

export default {
  name: 'ProjectMembers',
  components: { AddMemberDialog },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      searchKeys: ['name', 'login'],
      unClosedIssueCount: 0
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId']),
    disabledEditOwner() {
      if (this.userRole === 'Administrator') return false
      return this.userId !== this.selectedProject.owner_id
    },
    assignedList() {
      return this.listData.filter(item => item.role_id !== 1).map(item => ({ id: item.id, label: item.name }))
    }
  },
  methods: {
    async fetchData() {
      const res = await getProjectUserList(this.selectedProjectId)
      return res.data.user_list
    },
    setProjectOwner() {
      this.listLoading = true
      updateProjectInfos(this.selectedProjectId, { owner_id: this.selectedProject.owner_id })
        .then(() => {
          this.$message({
            message: `${this.$t('Notify.Updated')} ${this.$t('Project.Owner')}`,
            type: 'success'
          })
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error'
          })
        })
        .then(() => {
          this.listLoading = false
        })
    },
    showDialog() {
      this.$refs.addMemberDialog.dialogVisible = true
    },
    async handleDelete(userId) {
      this.listLoading = true
      try {
        await deleteProjectMember(this.selectedProjectId, userId)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.loadData()
      } catch (error) {
        console.error(error)
        this.listLoading = false
      }
    },
    getRoleName(id) {
      const isProjectOwner = id === this.selectedProject.owner_id
      return isProjectOwner ? this.$t('Member.ProjectOwner') : this.$t('Member.ProjectMember')
    },
    async handleDeleteClick(row) {
      this.listLoading = true
      await this.fetchIssueByUser(row)
      this.listLoading = false
      const hasUnclosedIssue = this.unClosedIssueCount > 0
      hasUnclosedIssue ? this.showConfirmTransferDialog(row) : this.showConfirmRemoveMemberDialog(row)
    },
    handleIssueClick(row) {
      const { id, name } = row
      this.$router.push({ name: 'Issue Transfer', params: { userId: id, userName: name }})
    },
    showConfirmTransferDialog(row) {
      const { id, name } = row
      this.$confirm(
        this.$t('Member.ConfirmTransfer', {
          userRole: this.getRoleName(id),
          userName: name,
          unClosedIssueCount: this.unClosedIssueCount
        }),
        this.$t('general.caution'),
        {
          confirmButtonText: this.$t('Member.TransferIssue'),
          type: 'warning',
          showCancelButton: false
        }
      )
        .then(() => {
          this.handleIssueClick(row)
        })
        .catch(() => {})
    },
    showConfirmRemoveMemberDialog(row) {
      const { id, name } = row
      this.$confirm(
        this.$t('Member.ConfirmRemoveMember', { userRole: this.getRoleName(id), userName: name }),
        this.$t('general.caution'),
        {
          confirmButtonText: this.$t('general.Remove'),
          confirmButtonClass: 'el-button--danger',
          type: 'error',
          showCancelButton: false
        }
      )
        .then(() => {
          this.handleDelete(id)
        })
        .catch(() => {})
    },
    async fetchIssueByUser(row) {
      const { id } = row
      const params = {
        offset: 0,
        from: 'assigned_to_id',
        status_id: 'open',
        project_id: this.selectedProjectId
      }
      await getUserIssueList(id, params).then(res => {
        this.unClosedIssueCount = res.data.length
      })
    },
    handleParticipateDialog(user_id) {
      this.$router.push({ name: 'ParticipateProject', params: { user_id }})
    }
  }
}
</script>
