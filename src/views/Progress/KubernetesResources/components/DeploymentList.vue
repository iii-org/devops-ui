<template>
  <el-row class="app-container">
    <el-col>
      <project-list-selector>
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </project-list-selector>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        fit
      >
        <el-table-column :label="$t('DeploymentList.DeployName')" align="center" prop="name" min-width="200" />
        <el-table-column-time :label="$t('general.CreateTime')" align="center" prop="created_time" />

        <el-table-column :label="$t('DeploymentList.Container')" align="center" min-width="200">
          <template slot-scope="scope">
            <div v-for="(container, idx) in scope.row.containers" :key="container + idx">
              {{ container.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('DeploymentList.Image')" align="center" min-width="250">
          <template slot-scope="scope">
            <div v-for="(container, idx) in scope.row.containers" :key="container + idx">
              {{ container.image }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Status')" align="center" width="200">
          <template slot-scope="scope">
            <el-progress
              :percentage="calcPercentage(scope.row.available_pod_number, scope.row.total_pod_number)"
              :status="format(scope.row.available_pod_number, scope.row.total_pod_number)"
            />
            <span>{{ `${scope.row.available_pod_number} / ${scope.row.total_pod_number}` }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Actions')" align="center" width="230">
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
              @click="redeploy(selectedProjectId, scope.row.name)"
            >
              Redeploy
            </el-button>

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
    </el-col>
  </el-row>
</template>

<script>
import { deleteDeployment, getDeploymentList, updateDeployment } from '@/api/kubernetes'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'DeploymentList',
  components: { ElTableColumnTime },
  mixins: [BasicData, SearchBar, Pagination, Table, ProjectSelector],
  data() {
    return {
      btnLoading: false
    }
  },
  methods: {
    async fetchData() {
      const res = await getDeploymentList(this.selectedProjectId)
      return res.data
    },
    async handleDelete(pId, deploymentName) {
      this.listLoading = true
      try {
        await deleteDeployment(pId, deploymentName)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async redeploy(pId, deploymentName) {
      this.btnLoading = true
      try {
        await updateDeployment(pId, deploymentName)
        await this.loadData()
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
