<template>
  <el-row class="app-container">
    <el-col>
      <div class="flex justify-between">
        <project-list-selector />
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </div>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        border
        fit
      >
        <el-table-column :label="$t('general.Name')" align="center" prop="name" min-width="200" />
        <el-table-column :label="$t('general.Actions')" align="center" width="180">
          <template slot-scope="scope">
            <el-popconfirm
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              icon="el-icon-info"
              icon-color="red"
              title="Are you sure?"
              @onConfirm="handleDelete(selectedProjectId, scope.row.name)"
            >
              <el-button slot="reference" size="mini" type="danger" :disabled="scope.row.is_iii">
                <i class="el-icon-delete" />
                {{ $t('general.Delete') }}
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </el-col>
  </el-row>
</template>

<script>
import { deleteService, getServiceList } from '@/api/kubernetes'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'

export default {
  name: 'ServiceList',
  mixins: [BasicData, SearchBar, Pagination, Table, ProjectSelector],
  methods: {
    async fetchData() {
      this.listLoading = true
      const res = await getServiceList(this.selectedProjectId)
      return res.data
    },
    async handleDelete(pId, serviceName) {
      try {
        await deleteService(pId, serviceName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
