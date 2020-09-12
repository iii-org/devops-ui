<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectVersion, addProjectVersion, editProjectVersion, deleteProjectVersion } from '@/api/projects'
const formTemplate = {
  name: '',
  due_date: '',
  status: false,
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
        limit: 10,
        totalPage: 1
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
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.versionList.slice(start, end)
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
      await deleteProjectVersion(this.projectSelectedId, row.id)
      this.fetchData()
    },
    async handleConfirm() {
      this.dialogVisible = false
      const data = this.form
      data.status = data.status ? 'open' : 'closed'
      if(this.dialogStatus == 1) {
        await addProjectVersion(this.projectSelectedId, {'version': data})
      } else {
        await editProjectVersion(this.projectSelectedId, this.form.id, {'version': data})
      }
      this.fetchData()
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['thisForm'].resetFields()
        this.form = formTemplate
      })
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div>
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Version
        </el-button>
      </span>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Due Date" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.due_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" />
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="versionList.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[10]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog
      :title="`${dialogStatusText} Version`"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="thisForm" :model="form" label-position="top">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Duration">
          <el-form-item prop="due_date">
            <el-date-picker type="date" placeholder="End Date" value-format="yyyy-MM-dd" v-model="form.due_date" style="width: 100%;" />
          </el-form-item>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
        <el-form-item label="Description" prop="desc">
          <el-input type="textarea" v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="memberConfirmLoading">Confirm</el-button>
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
