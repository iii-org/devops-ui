<script>
import { deleteService, getServiceList } from '@/api/projectResource'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'ServiceList',
  mixins: [MixinElTableWithAProject],
  methods: {
    async fetchData() {
      this.listLoading = true
      const res = await getServiceList(this.selectedProjectId)
      return res.data.map(item => {
        return {
          name: item
        }
      })
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

<template>
  <div class="table-container">
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
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%">
      <el-table-column :label="$t('general.Name')" align="center" prop="name" min-width="200" />
      <el-table-column :label="$t('general.Actions')" align="center" width="180">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="primary" @click="handleEdit(scope.row.name)">
              <i class="el-icon-edit" />
              {{ $t('general.Edit') }}
            </el-button> -->
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(selectedProjectId, scope.row.name)"
          >
            <el-button slot="reference" size="mini" type="danger">
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
  </div>
</template>
