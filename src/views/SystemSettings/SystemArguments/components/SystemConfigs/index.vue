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
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.type === 'string'"
            placement="bottom"
            :content="$t('general.Edit')"
          >
            <em
              class="ri-file-edit-line finished operate-button"
              @click="scope.row.method"
            />
          </el-tooltip>
          <el-tooltip
            v-else
            placement="bottom"
            :content="!scope.row.content ? $t('general.Enable') : $t('general.Disable')"
          >
            <div v-if="gitlabDomainIP" class="disabled">
              <el-button
                size="mini"
                disabled
              >
                {{ !scope.row.content ? $t('general.Enable') : $t('general.Disable') }}
              </el-button>
            </div>
            <div v-else>
              <em
                :class="!scope.row.content
                  ? 'ri-record-circle-line finished operate-button'
<<<<<<< HEAD
                  : 'ri-pause-circle-line danger operate-button'"
=======
                  : 'ri-pause-circle-line inProgress operate-button'"
>>>>>>> 7b6e71d1 (feat: modify table button layout)
                @click="scope.row.method(!scope.row.content)"
              />
            </div>
          </el-tooltip>
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
      @update="fetchData"
    />
    <FileSizeDialog
      ref="FileSizeDialog"
      @update="fetchData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar } from '@/mixins'
import { FileTypeDialog, FileSizeDialog } from './components'
import {
  getGitlabStatus,
  editGitlabStatus,
  isGitlabDomainIP
} from '@/api/gitlab' // v2 backend not finish yet, so use original api

export default {
  name: 'SystemConfigs',
  components: { FileTypeDialog, FileSizeDialog },
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
                        But will not be affected in the IP mode`,
          content: false,
          method: this.handleGitlabActive
        }
      ],
      gitlabDomainIP: false
    }
  },
  computed: {
    ...mapGetters(['fileTypeLimit', 'fileSizeLimit'])
  },
  methods: {
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
      this.$refs['FileSizeDialog'].dialogVisible = true
      this.$refs['FileSizeDialog'].loadData()
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
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
.disabled {
  cursor: not-allowed;
}
</style>
