<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getHarborRepoList, editHarborRepo, deleteHarborRepo, getHarborRepoStorageSummary } from '@/api/harbor'
const formTemplate = {
  name: '',
  due_date: '',
  status: 'open',
  description: ''
}

export default {
  name: 'ProjectResource',
  components: {
    Pagination,
    ProjectListSelector
  },
  data: () => ({
    projectName: '',
    listLoading: true,
    dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
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
    form: formTemplate,

    showDeleteDialog: false,
    loadingDelete: '',
    deleteResourceName: '',
    inputDelResourceName: '',
    placeholderText: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'projectSelectedObject']),
    pagedData() {
      const listData = this.resourceList.filter(data => {
        if (this.searchData === '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
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
      this.listQuery.page = 1
      this.searchData = ''
    },
    // form(value) {
    //   console.log(value)
    // },
    searchData() {
      this.listQuery.page = 1
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
      if (this.projectSelectedId !== -1) {
        const res = await getHarborRepoList(this.projectSelectedId)
        this.resourceList = res.data.map(item => {
          const name_ary = item.name.split('/')
          item['name_in_harbor'] = name_ary[name_ary.length - 1]
          return item
        })
        this.projectName = this.projectSelectedObject['name']
        const storageRes = await getHarborRepoStorageSummary(this.projectSelectedId)
        this.storage = storageRes.data
      }
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
    async handleConfirm(index, row) {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.dialogVisible = false
          const data = this.form
          await editHarborRepo(data.name, { description: data.description })
          this.$message({
            type: 'success',
            message: 'Succeed'
          })
          this.fetchData()
        } else {
          return false
        }
      })
    },
    handleDelete(index, row) {
      this.showDeleteDialog = true
      this.deleteResourceName = row.name
      this.placeholderText = 'Please Input ' + this.deleteResourceName
    },
    // async handleDelete(idx, row) {
    //   this.$confirm(`Are you sure to Delete ${row.name}?`, 'Delete', {
    //     confirmButtonText: 'Delete',
    //     cancelButtonText: 'Cancel',
    //     type: 'error'
    //   }).then(async () => {
    //     await deleteHarborRepo(row.name)
    //     this.$message({
    //       type: 'success',
    //       message: 'Delete Succeed'
    //     })
    //     this.fetchData()
    //   })
    // },
    async handleDeleteModal() {
      if (this.deleteResourceName !== this.inputDelResourceName) {
        return this.$message({
          message: 'Please input resource name correctly.',
          type: 'error'
        })
      } else {
        this.loadingDelete = this.$loading({
          target: '.el-dialog',
          text: 'Loading'
        })
        await deleteHarborRepo(this.deleteResourceName)
        this.$message({
          type: 'success',
          message: 'Delete Succeed'
        })
        this.loadingDelete.close()
        this.showDeleteDialog = false
        this.fetchData()
      }
    },
    onDialogClosedDelete() {
      this.$nextTick(() => {
        this.deleteResourceName = ''
        this.placeholderText = ''
        this.inputDelResourceName = ''
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
    <router-view />
    <div v-show="this.$route.meta.rolePage" class="role-page">
      <div class="clearfix">
        <project-list-selector />
        <el-input
          v-model="searchData"
          class="ob-search-input ob-shadow search-input mr-3"
          :placeholder="$t('general.SearchName')"
          style="width: 250px; float: right"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
      </div>
      <el-divider />
      <el-card shadow="never" style="margin-bottom: 5px">
        <el-row :gutter="24">
          <el-col :span="10" style="font-size: 20px;">
            {{ projectName }}
          </el-col>
          <el-col :span="6" style="font-size: 20px; text-align: center">
            <span>{{ $t('ProjectResource.Storage') }}</span>
            <span>
              {{ (storage.quota.used.storage / 1024 / 1024 / 1024).toFixed(2) }} /
              {{ Math.round(storage.quota.hard.storage / 1024 / 1024 / 1024) }} GB
            </span>
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
              target="_blank"
              style="font-size: 16px"
              :underline="false"
              :href="scope.row.harbor_link"
            >
              {{ scope.row.name }}
            </el-link>
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
        :title="`${$t('general.Delete')} ${$t('route.Harbor')}`"
        :visible.sync="showDeleteDialog"
        width="40%"
        :close-on-click-modal="false"
        @closed="onDialogClosedDelete"
      >
        <p>{{ $t('ProjectResource.DeleteResourceConfirmText') }}</p>
        <p>
          {{ $t('ProjectResource.PleaseType') }}
          <strong>{{ deleteResourceName }}</strong>
          {{ $t('ProjectResource.AndThen') }}
        </p>
        <el-input v-model="inputDelResourceName" :placeholder="placeholderText" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="showDeleteDialog = false">{{ $t('general.Cancel') }}</el-button>
          <el-button type="danger" @click="handleDeleteModal()">{{ $t('general.Delete') }}</el-button>
        </span>
      </el-dialog>

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
          <el-button type="primary" :loading="memberConfirmLoading" @click="handleConfirm">
            {{ $t('general.Confirm') }}
          </el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
