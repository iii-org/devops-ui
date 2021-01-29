<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getDeploymentList, deleteDeployment, updateDeployment } from '@/api/projectResource'

export default {
  name: 'DeploymentList',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    deploymentList: [],
    listLoading: true,
    btnLoading: false,
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
      const listData = this.deploymentList.filter(data => {
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
      await getDeploymentList(this.projectSelectedId).then(res => {
        this.deploymentList = res.data
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    // handleEdit(deploymentName) {
    //   this.dialogVisible = true
    // },
    async handleDelete(pId, deploymentName) {
      this.listLoading = true
      try {
        await deleteDeployment(pId, deploymentName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async redeploy(pId, deploymentName) {
      this.btnLoading = true
      try {
        await updateDeployment(pId, deploymentName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.btnLoading = false
    },
    format(a, b) {
      return a / b === 1 ? 'success' : 'warning'
    },
    calcPercentage(a, b) {
      return (a / b) * 100
    }
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
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column :label="$t('general.Name')" align="center" prop="deployment_name" min-width="200" />
      <el-table-column :label="$t('general.Status')" align="center" min-width="200">
        <template slot-scope="scope">
          <el-progress
            :percentage="calcPercentage(scope.row.available_pod_number, scope.row.total_pod_number)"
            :status="format(scope.row.available_pod_number, scope.row.total_pod_number)"
          />
          <span>{{ `${scope.row.available_pod_number} / ${scope.row.total_pod_number}` }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="240">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="primary" @click="handleEdit(scope.row.name)">
              <i class="el-icon-edit" />
              {{ $t('general.Edit') }}
            </el-button> -->
          <el-button
            :loading="btnLoading"
            type="primary"
            size="mini"
            icon="el-icon-refresh"
            @click="redeploy(projectSelectedId, scope.row.deployment_name)"
          >
            Redeploy
          </el-button>

          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(projectSelectedId, scope.row.deployment_name)"
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
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
