<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectVersion, addProjectVersion, editProjectVersion, deleteProjectVersion } from '@/api/projects'
const formTemplate = {
  name: '',
  due_date: '',
  status: 'open',
  description: ''
}

export default {
  components: {
    Pagination,
    ProjectListSelector
  },
  data() {
    return {
      projectValue: '專科A',
      listLoading: true,
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, //總筆數
      searchData: '',
      formRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        due_date: [{ required: true, message: 'Please input due_date', trigger: 'blur' }],
        status: [{ required: true, message: 'Please select status', trigger: 'blur' }],
        description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
      },
      versionList: [],
      dialogStatus: 1,
      memberConfirmLoading: false,
      form: formTemplate
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.versionList.filter((data) => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    },
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    }
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    },
    form(value) {
      console.log(value)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async fetchData() {
      this.listLoading = true
      const res = await getProjectVersion(this.projectSelectedId)
      this.versionList = res.data.versions
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
      console.log(this.form)
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete Version ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async () => {
        await deleteProjectVersion(this.projectSelectedId, row.id)
        this.$message({
          type: 'success',
          message: 'Delete Successed'
        })
        this.fetchData()
      })
    },
    async handleConfirm() {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          this.dialogVisible = false
          const data = this.form
          if (this.dialogStatus === 1) {
            await addProjectVersion(this.projectSelectedId, { version: data })
          } else {
            await editProjectVersion(this.projectSelectedId, this.form.id, { version: data })
          }
          this.$message({
            type: 'success',
            message: 'Successed'
          })
          this.fetchData()
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
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          {{ $t('Version.AddVersion') }}
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"></i
      ></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column align="center" :label="$t('Version.Id')" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('Version.DueDate')" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.due_date }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Status')" :show-overflow-tooltip="true" width="160" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'closed'" type="danger" size="big">{{ scope.row.status }}</el-tag>
          <el-tag v-else type="success" size="big">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" :show-overflow-tooltip="true" width="260">
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
    <pagination
      :total="listTotal"
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

<style lang="scss">
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
</style>
