<template>
  <el-row class="app-container">
    <el-col>
      <project-list-selector />
      <el-divider />
      <el-table v-loading="isLoading" :element-loading-text="$t('Loading')" :data="listData" fit>
        <el-table-column :label="$t('ServiceMonitoring.Services')" align="center" prop="name" />
        <el-table-column :label="$t('ServiceMonitoring.Health')" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTagType(scope.row.status)" effect="dark">
              {{ $t(`ServiceMonitoring.${scope.row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('ServiceMonitoring.Logs')" align="center" prop="" />
        <el-table-column :label="$t('ServiceMonitoring.LastUpdateTime')" align="center" prop="dateTime" />
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
import ProjectListSelector from '@/components/ProjectListSelector'
import { getSystemServerStatus } from '@/api/dashboard'

export default {
  name: 'ServiceMonitoring',
  components: { ProjectListSelector },
  data() {
    return {
      isLoading: false,
      listData: []
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const res = await getSystemServerStatus()
      this.listData = this.handleData(res)
      this.isLoading = false
    },
    handleData(res) {
      const name = Object.keys(res.data.alive)
      const status = Object.values(res.data.alive)
      const dateTime = this.$dayjs().utc(res.dateTime).format('YYYY-MM-DD HH:mm:ss')
      const listData = []
      name.forEach((item, index) => {
        const data = {
          name: item,
          status: status[index],
          dateTime
        }
        listData.push(data)
      })
      return listData
    },
    getTagType(status) {
      return status ? 'success' : 'danger'
    }
  }
}
</script>
