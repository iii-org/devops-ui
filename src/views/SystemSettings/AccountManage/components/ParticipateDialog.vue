<template>
  <el-dialog
    class="app-container"
    :title="$t('general.Participate')"
    width="80%"
    :visible="showParticipateDialog"
    @close="handleClose"
  >
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" prop="name" :label="$t('general.ProjectId')" width="250" />
      <el-table-column align="center" prop="display" :label="$t('Project.Name')" width="420" />
      <el-table-column align="center" prop="owner_name" :label="$t('Project.Owner')" width="200" />
      <el-table-column align="center" prop="start_date" :label="$t('Project.StartDate')" width="120" />
      <el-table-column align="center" prop="due_date" :label="$t('Project.DueDate')" width="120" />
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
              :disabled="projectUserId === userId"
            >
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
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getParticipateProject, deleteProjectMember } from '@/api/projects'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'

export default {
  name: 'ParticipateDialog',
  mixins: [MixinElTableWithAProject],
  props: {
    showParticipateDialog: {
      type: Boolean,
      default: false
    },
    projectUserId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  watch: {
    showParticipateDialog(val) {
      if (val) {
        this.fetchData(this.projectUserId)
      }
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
    handleClose() {
      this.$emit('participate_dialog_visible', false)
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async handleDelete(project_id) {
      this.listLoading = true
      try {
        await deleteProjectMember(project_id, this.projectUserId)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.fetchData(this.projectUserId)
      } catch (error) {
        console.error(error)
        this.listLoading = false
      }
    }
  }
}
</script>
