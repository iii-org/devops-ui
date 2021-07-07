<template>
  <el-collapse-item v-loading="listLoading" name="ProjectMembers">
    <template slot="title">
      <span class="font-base font-bold">{{ $t('Member.Manage') }}</span>
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
          {{ scope.row.id === selectedProject.owner_id ? $t('Member.ProjectOwner') : $t('Member.ProjectMember') }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')" width="140">
        <template slot-scope="scope">
          <el-popconfirm
            :confirm-button-text="$t('general.Remove')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            :title="$t('Member.confirmRemove')"
            @onConfirm="handleDelete(scope.row.id)"
          >
            <el-button
              slot="reference"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :disabled="scope.row.id === userId"
            >
              {{ $t('general.Remove') }}
            </el-button>
          </el-popconfirm>
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
import { getProjectUserList, deleteProjectMember, updateProjectInfos } from '@/api/projects'
import { BasicData, Pagination, SearchBar } from '@/newMixins'
import AddMemberDialog from './AddMemberDialog'
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectMembers',
  components: { AddMemberDialog },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      isLoading: false,
      searchKeys: ['name', 'login']
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
    }
  }
}
</script>
