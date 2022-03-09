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
        prop="content"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'fileType'">
            {{ scope.row.id }}
          </span>
          <el-tag v-else type="success">
            <span>{{ scope.row.content }}</span>
          </el-tag>
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
            @click="handleEdit(scope.row)"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-button
            v-else
            size="mini"
            @click="handleActiveClick(scope.row)"
          >
            <div class="flex items-center">
              <span class="dot" :class="scope.row.disabled ? 'bg-success' : 'bg-danger'" />
              <span class="ml-2" :class="scope.row.disabled ? 'text-success' : 'text-danger'">
                {{ !scope.row.disabled ? $t('general.Disable') : $t('general.Enable') }}
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

export default {
  name: 'SystemConfigs',
  components: { Pagination, FileTypeDialog },
  mixins: [MixinElTable],
  data() {
    return {}
  },
  computed: {
    tableData() {
      return [
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
          content: this.$t('general.Enable'),
          disabled: false
        }
      ]
    }
  },
  methods: {
    async fetchData() {
      // const res = await getSystemSecrets()
      // return res.data.map(item => ({
      //   name: item.name,
      //   created: item.created,
      //   keys: item.data ? Object.keys(item.data).join(', ') : '',
      //   status: item.removed ? 'Removing' : 'Active'
      // }))
      return this.tableData
    },
    handleEdit(row) {
      this.$refs['FileTypeDialog'].dialogVisible = true
    },
    async handleDelete(secretName) {
      this.listLoading = true
      try {
        // await deleteSystemSecret(secretName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async handleConfirm() {

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
