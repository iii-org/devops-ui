<template>
  <div v-loading="listLoading">
    <div
      v-if="isShowTitle"
      class="text-lg mb-2"
    >
      {{ $t('Member.Manage') }}
    </div>
    <el-empty
      v-if="selectedProjectId === -1"
      :description="$t('general.NoData')"
      :image-size="100"
    />
    <template v-else>
      <div class="flex justify-between mb-4">
        <el-button
          class="buttonSecondary"
          size="medium"
          icon="el-icon-plus"
          @click="showDialog"
        >
          {{ $t('Member.AddMember') }}
        </el-button>
        <div>
          <span class="font-bold mx-2">
            {{ $t('Project.Owner') }}
          </span>
          <el-select
            v-model="selectedProject.owner_id"
            size="medium"
            :disabled="disabledEditOwner"
            @change="confirmSetProjectOwner"
          >
            <el-option
              v-for="user in assignedList"
              :key="user.id"
              :value="user.id"
              :label="user.label"
            >
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
      <el-table
        :data="pagedData"
        fit
      >
        <el-table-column
          align="center"
          prop="login"
          :label="$t('Member.Account')"
        />
        <el-table-column
          align="center"
          prop="name"
          :label="$t('general.Name')"
        />
        <el-table-column
          align="center"
          prop="department"
          :label="$t('general.Department')"
          width="300"
        />
        <el-table-column
          align="center"
          prop="phone"
          :label="$t('Member.Phone')"
        />
        <el-table-column
          align="center"
          :label="$t('Member.Role')"
        >
          <template slot-scope="scope">
            {{ getRoleName(scope.row.id) }}
          </template>
        </el-table-column>
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
                v-permission="['Administrator','QA']"
                class="ri-file-list-2-line active operate-button"
                @click="handleParticipateDialog(scope.row.id)"
              />
            </el-tooltip>
            <el-tooltip
              placement="bottom"
              :content="$t('Issue.Issue')"
            >
              <em
                v-permission="['Administrator','Project Manager', 'QA']"
                class="ri-file-copy-2-line active operate-button"
                @click="handleIssueClick(scope.row)"
              />
            </el-tooltip>
            <el-tooltip
              placement="bottom"
              :content="$t('general.Remove')"
            >
              <em
                class="ri-delete-bin-2-line danger operate-button"
                :disabled="scope.row.id === userId"
                @click="handleDeleteClick(scope.row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
      </el-table>
      <Pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :layout="'total, sizes, prev, pager, next'"
        @pagination="onPagination"
      />
      <AddMemberDialog ref="addMemberDialog" @update="loadData" />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { getUserIssueList } from '@/api/user'
import { getProjectUserList, deleteProjectMember, updateProjectInfos } from '@/api/projects'
import AddMemberDialog from './AddMemberDialog'

export default {
  name: 'ProjectMembers',
  components: { AddMemberDialog },
  mixins: [BasicData, Pagination, SearchBar],
  props: {
    isShowTitle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchKeys: ['name', 'login', 'department'],
      unClosedIssueCount: 0,
      ownerId: 0
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
  mounted() {
    this.setOwner()
  },
  methods: {
    async fetchData() {
      const res = await getProjectUserList(this.selectedProjectId)
      return res.data.user_list
    },
    confirmSetProjectOwner() {
      const h = this.$createElement
      this.$msgbox({
        title: this.$t('ProjectSettings.ChangeManager'),
        message: h('p', null, [
          h('span', null, this.$t('Notify.ChangeProjectManager'))
        ]),
        showCancelButton: true,
        confirmButtonText: this.$t('general.ok'),
        cancelButtonText: this.$t('general.Cancel'),
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') this.setProjectOwner()
          else this.selectedProject.owner_id = this.ownerId
          done()
        }
      })
    },
    setProjectOwner () {
      this.listLoading = true
      this.setOwner()
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
    setOwner() {
      this.ownerId = this.selectedProject.owner_id
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
      this.$router.push({ name: 'IssueTransfer', params: { userId: id, userName: name }})
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
        .catch(() => ({}))
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
        .catch(() => ({}))
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
      this.$router.push({ name: 'ParticipateProject', params: { userId: user_id }})
    }
  }
}
</script>
