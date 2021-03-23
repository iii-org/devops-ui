<template>
  <div class="mt-8">
    <el-card>
      <div slot="header" class="d-flex justify-space-between">
        <span>{{ $t('Version.Manage') }}</span>
        <el-button type="success" size="small" icon="el-icon-plus" @click="handleAdding">
          {{ $t('Version.AddVersion') }}
        </el-button>
      </div>
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        border
        fit
        height="25vh"
      >
        <el-table-column align="center" :label="$t('general.Name')" min-width="220" prop="name" />
        <el-table-column align="center" :label="$t('Version.DueDate')" width="120">
          <template slot-scope="scope">
            {{ scope.row.due_date }}
          </template>
        </el-table-column>
        <el-table-column-time :label="$t('general.LastUpdateTime')" prop="updated_on" />
        <el-table-column align="center" :label="$t('general.Status')" min-width="60">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'open'" type="success" size="medium" effect="dark">{{
              scope.row.status
            }}</el-tag>
            <el-tag v-else type="danger" size="medium" effect="dark">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Actions')" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
              <i class="el-icon-edit" />
              {{ $t('general.Edit') }}
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
              <i class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <pagination
      :total="listData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <el-dialog
      :title="$t(`Version.${dialogStatusText}Version`)"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="form" :model="form" :rules="formRules" label-position="top">
        <el-form-item :label="$t('general.Name')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="$t('Version.Duration')" prop="due_date">
          <el-date-picker
            v-model="form.due_date"
            type="date"
            :placeholder="$t('Version.EndDate')"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('general.Status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="'open'">{{ $t('Version.Open') }}</el-radio>
            <el-radio :label="'closed'">{{ $t('Version.Closed') }}</el-radio>
            <el-radio :label="'locked'">{{ $t('Version.Locked') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('general.Description')" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" :loading="memberConfirmLoading" @click="handleConfirm">{{
          $t('general.Confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { addProjectVersion, deleteProjectVersion, editProjectVersion, getProjectVersion } from '@/api/projects'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import Pagination from '@/components/Pagination'

const formTemplate = {
  name: '',
  due_date: '',
  status: 'open',
  description: ''
}

export default {
  name: 'ProjectVersions',
  components: { ElTableColumnTime, Pagination },
  data: () => ({
    dialogVisible: false,
    formRules: {
      name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
      due_date: [{ required: true, message: 'Please input due_date', trigger: 'blur' }],
      status: [{ required: true, message: 'Please select status', trigger: 'blur' }],
      description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
    },
    dialogStatus: 1,
    memberConfirmLoading: false,
    form: formTemplate,

    listData: [],
    listLoading: true,
    listQuery: {
      page: 1,
      limit: 10
    }
  }),
  computed: {
    ...mapGetters(['selectedProject']),
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    },

    selectedProjectId() {
      return this.selectedProject.id
    },
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.listData.slice(start, end)
    }
  },
  watch: {
    selectedProject() {
      this.fetchData()
      this.listQuery.page = 1
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const res = await getProjectVersion(this.selectedProjectId)
      this.listData = res.data.versions
      this.listLoading = false
    },
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2

      this.form = Object.assign({}, this.form, row)
      // console.log(this.form)
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete Version ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async () => {
        await deleteProjectVersion(this.selectedProjectId, row.id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.fetchData()
      })
    },
    async handleConfirm() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.dialogVisible = false
          const data = this.form
          if (this.dialogStatus === 1) {
            await addProjectVersion(this.selectedProjectId, { version: data })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
          } else {
            await editProjectVersion(this.selectedProjectId, this.form.id, { version: data })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          }

          await this.fetchData()
        } else {
          return false
        }
      })
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate
      })
    },

    onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>
