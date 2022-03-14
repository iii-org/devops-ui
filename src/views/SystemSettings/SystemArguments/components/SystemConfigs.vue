<template>
  <div class="app-container">
    <div class="flex justify-between">
      <div class="text-2xl">{{ $t('SystemConfigs.SystemConfig') }}</div>
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
          <span v-if="scope.row.type === 'fileType'">
            {{ scope.row.content }}
          </span>
          <span v-else>
            <el-tag :type="scope.row.disabled === true ? 'success' : 'danger'">
              <span>{{ scope.row.disabled === true ? $t('general.Enable') : $t('general.Disable') }}</span>
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
            v-if="scope.row.type === 'fileType'"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit()"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-button
            v-else
            size="mini"
            :disabled="gitlabDomainIP"
            @click="handleActive(!scope.row.disabled)"
          >
            <div v-if="gitlabDomainIP">
              {{ !scope.row.disabled ? $t('general.Enable') : $t('general.Disable') }}
            </div>
            <div v-else class="flex items-center">
              <span class="dot" :class="!scope.row.disabled ? 'bg-success' : 'bg-danger'" />
              <span class="ml-2" :class="!scope.row.disabled ? 'text-success' : 'text-danger'">
                {{ !scope.row.disabled ? $t('general.Enable') : $t('general.Disable') }}
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
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <FileTypeDialog ref="FileTypeDialog" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import MixinElTable from '@/mixins/MixinElTable'
import FileTypeDialog from './FileTypeDialog'
import { getFileNameList } from '@/api_v2/fileType'
import {
  getGitlabStatus,
  editGitlabStatus,
  isGitlabDomainIP
} from '@/api/gitlab' // v2 backend not finish yet, so use original api

export default {
  name: 'SystemConfigs',
  components: { Pagination, FileTypeDialog },
  mixins: [MixinElTable],
  data() {
    return {
      tableData: [
        {
          type: 'fileType',
          name: this.$t('SystemConfigs.FileType'),
          description: 'Define Upload types for issue attachments and project files',
          content: ''
        },
        {
          type: 'gitLabExternalAccess',
          name: this.$t('SystemConfigs.GitLabExternalAccess'),
          description: `For security concern, III DevOps only enable Gitlab internal access.
                        But Will not be affected in the IP mode`,
          disabled: false
        }
      ],
      fileNameList: '',
      gitlabStatus: false,
      gitlabDomainIP: false
    }
  },
  mounted() {
    this.isGitlabDomainIP()
  },
  methods: {
    async fetchData() {
      await this.getGitlabStatus()
      await this.isGitlabStatus()
      this.tableData[0].content = this.fileNameList.toString()
      this.tableData[1].disabled = this.gitlabStatus
      return this.tableData
    },
    handleEdit() {
      this.$refs['FileTypeDialog'].dialogVisible = true
      this.$refs['FileTypeDialog'].loadData()
    },
    async handleActive(active) {
      this.listLoading = true
      const data = {
        action: active ? 'open' : 'close'
      }
      try {
        await editGitlabStatus(data)
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
    },
    async getGitlabStatus() {
      const res = await getFileNameList()
      this.fileNameList = res.data
    },
    async isGitlabStatus() {
      const res = await getGitlabStatus()
      this.gitlabStatus = res.data.status
    },
    async isGitlabDomainIP() {
      const res = await isGitlabDomainIP()
      this.gitlabDomainIP = res.is_ip
    }
  }
}
</script>

<style lang="scss" scoped>
.dot {
  @apply rounded-full w-2 h-2;
}
</style>
