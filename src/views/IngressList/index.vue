<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getIngressList } from '@/api/projectResource'

export default {
  name: 'IngressList',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    ingressList: [],
    listLoading: true,
    // dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.ingressList.filter(data => {
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
    projectSelectedId(projectId) {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      await getIngressList(this.projectSelectedId).then(res => {
        this.ingressList = res.data
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    }
    // handleEdit(secretName) {
    //   this.dialogVisible = true
    // }
  }
}
</script>

<template>
  <div>
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
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row>
      <el-table-column :label="$t('general.Name')" align="center" prop="name" width="200" show-overflow-tooltip />
      <el-table-column label="hostname" align="center" prop="hostname" min-width="120" show-overflow-tooltip />
      <el-table-column label="IP" align="center" prop="ip" min-width="120" show-overflow-tooltip />
      <el-table-column label="Path" align="center" prop="path" min-width="120" show-overflow-tooltip />
      <el-table-column label="Service" align="center" prop="service" min-width="400">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.ingress_list" :key="item + idx">
            <el-link type="primary" :underline="false" style="font-size: 16px" target="_blank" :href="item.hostname_path">
              {{ item.service }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="tls" align="center" prop="tls" min-width="80" />
      <el-table-column :label="$t('general.CreateTime')" align="center" prop="created_time" width="190">
        <template slot-scope="scope">
          {{ scope.row.created_time | YMDHms }}
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
  </div>
</template>
