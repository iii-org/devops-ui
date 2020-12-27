<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getHarborRepoList, editHarborRepo, deleteHarborRepo, getHarborRepoStorageSummary } from '@/api/harbor'
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
      harborUrl: process.env.VUE_APP_HARBOR_URL,
      projectName: '',
      listLoading: true,
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, // 總筆數
      searchData: '',
      formRules: {
        description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
      },
      resourceList: [],
      storage: {
        project_admin_count: 0,
        quota: {
          hard: { storage: 0 },
          used: { storage: 0 }
        },
        repo_count: 0
      },
      memberConfirmLoading: false,
      form: formTemplate
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId', 'projectSelectedObject']),
    pagedData() {
      const listData = this.resourceList.filter(data => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
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
      const res = await getHarborRepoList(this.projectSelectedId)
      this.resourceList = res.data.map(item => {
        const name_ary = item.name.split('/')
        item['name_in_harbor'] = name_ary[name_ary.length - 1]
        return item
      })
      this.projectName = this.projectSelectedObject['name']
      const storageRes = await getHarborRepoStorageSummary(this.projectSelectedId)
      this.storage = storageRes.data
      console.log('this.storage', this.storage)
      this.listLoading = false
    },
    returnPercentage(quota) {
      const total = parseInt(quota.hard.storage)
      const use = parseInt(quota.used.storage)
      const p = Math.round((use / total) * 100)
      return isNaN(p) ? 0 : p
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.form = Object.assign({}, this.form, row)
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async () => {
        await deleteHarborRepo(row.name)
        this.$message({
          type: 'success',
          message: 'Delete Successed'
        })
        this.fetchData()
      })
    },
    async handleConfirm(index, row) {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.dialogVisible = false
          const data = this.form
          await editHarborRepo(data.name, { description: data.description })
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
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"
      /></el-input>
    </div>
    <el-divider />
    <el-card shadow="never" style="margin-bottom: 5px">
      <el-row :gutter="24">
        <el-col :span="12" style="font-size: 20px;">
          {{ projectName }}
        </el-col>
        <el-col :span="4" style="font-size: 20px; text-align: center">
          {{ Math.round(storage.quota.used.storage / 1024 / 1024) }} /
          {{ Math.round(storage.quota.hard.storage / 1024 / 1024) }} MB
        </el-col>
        <el-col :span="8" style="text-align:right">
          <el-progress :text-inside="true" :stroke-width="26" :percentage="returnPercentage(storage.quota)" />
        </el-col>
      </el-row>
    </el-card>
    <div />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column :label="$t('general.Name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link
            type="primary"
            :href="`${harborUrl}/projects/${projectSelectedId}/repositories/${scope.row.name_in_harbor}`"
            target="_blank"
            >{{ scope.row.name }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProjectResource.Artifacts')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link
            :to="{
              name: 'Artifacts',
              params: { rName: scope.row.name }
            }"
            style="color: #409eff"
          >
            <span>{{ scope.row.artifact_count }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="pull">
        <template slot-scope="scope">
          <span>{{ scope.row.pull_count }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Description')">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.LastUpdateTime')" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | YMDhmA }}</span>
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
      :title="$t(`ProjectResource.EditResource`)"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="form" :model="form" :rules="formRules" label-position="top">
        <el-form-item :label="$t('general.Name')">
          {{ form.name }}
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
