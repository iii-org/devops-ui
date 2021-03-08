<script>
import { getIngressList } from '@/api/projectResource'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'IngressList',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  methods: {
    async fetchData() {
      return (await getIngressList(this.selectedProjectId)).data
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
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border
              fit highlight-current-row height="100%">
      <el-table-column :label="$t('general.Name')" align="center" prop="name" width="200"
                       show-overflow-tooltip />
      <el-table-column label="hostname" align="center" prop="hostname" min-width="120"
                       show-overflow-tooltip />
      <el-table-column label="IP" align="center" prop="ip" min-width="120" show-overflow-tooltip />
      <el-table-column label="Path" align="center" prop="path" min-width="120"
                       show-overflow-tooltip />
      <el-table-column label="Service" align="center" prop="service" min-width="400">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.ingress_list" :key="item + idx">
            <el-link type="primary" :underline="false" style="font-size: 16px" target="_blank"
                     :href="item.hostname_path">
              {{ item.service }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="tls" align="center" prop="tls" min-width="80" />
      <el-table-column-time :label="$t('general.CreateTime')" prop="created_time" />
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
