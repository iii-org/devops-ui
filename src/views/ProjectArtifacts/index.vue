<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectArtifacts } from '@/api/projects'
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
      listTotal: 0, // 總筆數
      searchData: '',
      formRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
      },
      artifactsList: [],
      storage: {},
      dialogStatus: 1,
      memberConfirmLoading: false,
      form: formTemplate
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.artifactsList.filter(data => {
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
      const res = await getProjectArtifacts(this.projectSelectedId)
      this.artifactsList = res.data
      this.listLoading = false
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete Version ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async () => {
        // await deleteProjectVersion(this.projectSelectedId, row.id)
        // this.$message({
        //   type: 'success',
        //   message: 'Delete Successed'
        // })
        this.fetchData()
      })
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"
      /></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column :label="$t('general.Name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.tags }}
        </template>
      </el-table-column>
      <el-table-column label="Size" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="Vulnerabilities">
        <template slot-scope="scope">
          <span>{{ scope.row.vulnerabilities }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Digest">
        <template slot-scope="scope">
          <span>{{ scope.row.digest }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Labels">
        <template slot-scope="scope">
          <el-tag v-for="label in scope.row.labels" :key="label" type="success">{{ label }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Push Time" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.pushTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" :show-overflow-tooltip="true" width="260">
        <template slot-scope="scope">
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
