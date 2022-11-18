<template>
  <div class="app-container">
    <div class="flex justify-between">
      <div class="text-2xl">
        {{ $t('SystemConfigs.SystemConfig') }}
      </div>
      <el-input
        id="input-search-config"
        v-model="keyword"
        :placeholder="$t('general.SearchName')"
        style="width: 250px"
        prefix-icon="el-icon-search"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :data="pagedData"
      fit
    >
      <el-table-column
        type="index"
        :label="$t('general.Index')"
        align="center"
        width="100"
      />
      <el-table-column
        :label="$t('general.Name')"
        prop="name"
        align="center"
        min-width="100"
      />
      <el-table-column
        :label="$t('general.Description')"
        prop="description"
        align="center"
        min-width="250"
      />
      <el-table-column
        :label="$t('SystemConfigs.Content')"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'string'">
            {{ scope.row.content }}
          </span>
          <span v-else>
            <el-tag :type="scope.row.content === true ? 'success' : 'danger'">
              <span>
                {{ scope.row.content === true ? $t('general.Enable') : $t('general.Disable') }}
              </span>
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('general.Actions')"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.type === 'string'"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="scope.row.method"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-button
            v-else
            size="mini"
            :disabled="gitlabDomainIP"
            @click="scope.row.method(!scope.row.content)"
          >
            <div v-if="gitlabDomainIP">
              {{ !scope.row.content ? $t('general.Enable') : $t('general.Disable') }}
            </div>
            <div v-else class="flex items-center">
              <span class="dot" :class="!scope.row.content ? 'bg-success' : 'bg-danger'" />
              <span class="ml-2" :class="!scope.row.content ? 'text-success' : 'text-danger'">
                {{ !scope.row.content ? $t('general.Enable') : $t('general.Disable') }}
              </span>
            </div>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
    <FileTypeDialog
      ref="FileTypeDialog"
      @reload="fetchData"
    />
    <el-dialog
      :visible.sync="fileSizeDialogVisible"
      :title="$t('general.Edit')+$t('SystemConfigs.FileSize')"
      width="30%"
      destroy-on-close
      append-to-body
    >
      <el-form
        ref="form"
        v-loading="isLoading"
        :model="form"
      >
        <el-form-item
          prop="fileSize"
          :rules="[
            { type: 'number',
              required: true,
              min: 0,
              max: 100,
              message: 'Please type number from 0 to 100'
            }
          ]"
        >
          <el-input
            v-model.number="form.fileSize"
            :placeholder="$t('RuleMsg.PleaseInput') + $t('SystemConfigs.FileSize')"
          >
            <template slot="prepend">{{ $t('SystemConfigs.FileSize') }} :</template>
            <template slot="append">MB</template>
          </el-input>
        </el-form-item>
        <el-form-item class="text-right">
          <el-button
            class="buttonSecondaryReverse"
            :loading="isLoading"
            @click="handleEditFileSize"
          >
            {{ $t('general.Close') }}
          </el-button>
          <el-button
            type="primary"
            :loading="isLoading"
            @click="handleUpdateFileSize"
          >
            {{ $t('general.Confirm') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import FileTypeDialog from './FileTypeDialog'
import {
  getGitlabStatus,
  editGitlabStatus,
  isGitlabDomainIP
} from '@/api/gitlab' // v2 backend not finish yet, so use original api

export default {
  name: 'SystemConfigs',
  components: { FileTypeDialog },
  mixins: [BasicData, Pagination, SearchBar],
  data() {
    return {
      tableData: [
        {
          type: 'string',
          name: this.$t('SystemConfigs.FileType'),
          description: 'Define Upload types for issue attachments and project files',
          content: '',
          method: this.handleEditFileName
        },
        {
          type: 'string',
          name: this.$t('SystemConfigs.FileSize'),
          description: this.$t('SystemConfigs.FileSizeDescription'),
          content: '',
          method: this.handleEditFileSize
        },
        {
          type: 'boolean',
          name: this.$t('SystemConfigs.GitLabExternalAccess'),
          description: `For security concern, III DevOps only enable Gitlab internal access.
                        But Will not be affected in the IP mode`,
          content: false,
          method: this.handleGitlabActive
        }
      ],
      isLoading: false,
      fileSizeDialogVisible: false,
      form: {
        fileSize: ''
      },
      gitlabDomainIP: false
    }
  },
  computed: {
    ...mapGetters(['fileSizeLimit', 'fileTypeLimit'])
  },
  methods: {
    ...mapActions('app', ['updateFileSize']),
    async fetchData() {
      this.gitlabDomainIP = (await isGitlabDomainIP()).is_ip
      this.tableData[0].content = this.fileTypeLimit
      this.tableData[1].content = this.fileSizeLimit
      this.tableData[2].content = (await getGitlabStatus()).data.status
      return this.tableData
    },
    handleEditFileName() {
      this.$refs['FileTypeDialog'].dialogVisible = true
      this.$refs['FileTypeDialog'].loadData()
    },
    handleEditFileSize() {
      this.form.fileSize = Number(this.fileSizeLimit.replace(/\D/g, ''))
      this.fileSizeDialogVisible = !this.fileSizeDialogVisible
    },
    handleUpdateFileSize() {
      this.$refs['form'].validate(async(valid) => {
        if (!valid) return
        this.isLoading = true
        try {
          await this.updateFileSize({ upload_file_size: this.form.fileSize })
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          await this.loadData()
          this.handleEditFileSize()
        } catch (error) {
          console.error(error)
        } finally {
          this.isLoading = false
        }
      })
    },
    async handleGitlabActive(active) {
      this.listLoading = true
      try {
        await editGitlabStatus({ action: active ? 'open' : 'close' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
