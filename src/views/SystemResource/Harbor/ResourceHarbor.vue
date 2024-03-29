<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector>
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </ProjectListSelector>
      <el-divider />
      <el-card
        shadow="never"
        class="mb-1"
      >
        <el-row :gutter="24">
          <el-col
            :span="10"
            style="font-size: 20px;"
          >
            {{ projectName }}
          </el-col>
          <el-col
            :span="6"
            style="font-size: 20px; text-align: center"
          >
            <span>{{ $t('ProjectResource.Storage') }}</span>
            <span>
              {{ (storage.quota.used.storage / 1024 / 1024 / 1024).toFixed(2) }} /
              {{ Math.round(storage.quota.hard.storage / 1024 / 1024 / 1024) }} GB
            </span>
          </el-col>
          <el-col
            :span="8"
            style="text-align:right"
          >
            <el-progress
              :text-inside="true"
              :stroke-width="26"
              :percentage="returnPercentage(storage.quota)"
            />
          </el-col>
        </el-row>
      </el-card>
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        fit
      >
        <el-table-column
          :label="$t('general.Name')"
          show-overflow-tooltip
          min-width="150"
        >
          <template slot-scope="scope">
            <el-link
              class="linkTextColor"
              target="_blank"
              style="font-size: 16px"
              :underline="false"
              :href="scope.row.harbor_link"
            >
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('ProjectResource.Artifacts')"
          show-overflow-tooltip
          align="center"
          width="140"
        >
          <template slot-scope="scope">
            <router-link
              :to="{
                name: 'Artifacts',
                params: { rName: scope.row.name, projectName }
              }"
              class="linkTextColor"
            >
              <span>{{ scope.row.artifact_count }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          label="pull"
          align="center"
          prop="pull_count"
          width="140"
        />
        <el-table-column
          :label="$t('general.Description')"
          prop="description"
          min-width="200"
        />
        <el-table-column-time
          prop="update_time"
          :label="$t('general.LastUpdateTime')"
        />
        <el-table-column
          :label="$t('general.Actions')"
          align="center"
          show-overflow-tooltip
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              class="buttonPrimaryReverse"
              @click="handleEdit(scope.$index, scope.row)"
            >
              <em class="el-icon-edit" />
              {{ $t('general.Edit') }}
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >
              <em class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="filteredData.length"
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
        <el-input
          v-model="inputDelResourceName"
          :placeholder="placeholderText"
        />
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button class="buttonSecondaryReverse" @click="showDeleteDialog = false">{{ $t('general.Cancel') }}</el-button>
          <el-button
            type="danger"
            @click="handleDeleteModal()"
          >{{ $t('general.Delete') }}</el-button>
        </span>
      </el-dialog>
      <el-dialog
        :title="$t(`ProjectResource.EditResource`)"
        :visible.sync="dialogVisible"
        width="50%"
        @closed="onDialogClosed"
      >
        <el-form
          ref="form"
          :model="form"
          :rules="formRules"
          label-position="top"
        >
          <el-form-item :label="$t('general.Name')">
            {{ form.name }}
          </el-form-item>
          <el-form-item
            :label="$t('general.Description')"
            prop="description"
          >
            <el-input
              v-model="form.description"
              type="textarea"
            />
          </el-form-item>
        </el-form>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
          <el-button
            class="buttonPrimary"
            :loading="memberConfirmLoading"
            @click="handleConfirm"
          >
            {{ $t('general.Confirm') }}
          </el-button>
        </span>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import {
  getHarborRepoList,
  deleteHarborRepo,
  editHarborRepo,
  getHarborRepoStorageSummary
} from '@/api/harbor'
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'

const formTemplate = {
  name: '',
  due_date: '',
  status: 'open',
  description: ''
}

export default {
  name: 'ResourceHarbor',
  components: { ProjectListSelector, ElTableColumnTime },
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      projectName: '',
      dialogVisible: false,
      formRules: {
        description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
      },
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
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      const res = await getHarborRepoList(this.selectedProjectId)
      const resourceList = res.data.map((item) => {
        const name_ary = item.name.split('/')
        item['name_in_harbor'] = name_ary[name_ary.length - 1]
        return item
      })
      this.projectName = this.selectedProject['name']
      const storageRes = await getHarborRepoStorageSummary(this.selectedProjectId)
      this.storage = storageRes.data
      return resourceList
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
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          this.dialogVisible = false
          const data = this.form
          await editHarborRepo({
            description: data.description,
            repository_fullname: data.name
          })
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          await this.loadData()
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
    async handleDeleteModal() {
      if (this.deleteResourceName !== this.inputDelResourceName) {
        return this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('Notify.WrongResourceName'),
          type: 'warning'
        })
      } else {
        this.loadingDelete = this.$loading({
          target: '.el-dialog',
          text: 'Loading'
        })
        await deleteHarborRepo(this.deleteResourceName)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        this.loadingDelete.close()
        this.showDeleteDialog = false
        await this.loadData()
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
