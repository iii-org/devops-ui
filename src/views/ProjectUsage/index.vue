<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getProjectUsage } from '@/api/projectResource'
import resourcePie from './components/resourcePie'
import { roundValue, getQuotaUnit, formateUsedQuota, formatChartDataResult } from '@/utils/k8sResourceFormatter'

export default {
  name: 'ProjectUsage',
  components: {
    ProjectListSelector,
    resourcePie
  },
  data: () => ({
    listLoading: true,
    usageList: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      if (this.selectedProjectId !== -1) {
        const res = await getProjectUsage(this.selectedProjectId)
        this.usageList = this.handleChartData(res.data)
      }
      this.listLoading = false
    },
    handleEdit(target) {
      this.$router.push({ name: `${target} List` })
    },
    allowEditUsage(target) {
      const allowList = ['Deployment', 'Pods', 'Service', 'Secret', 'Ingress']
      return allowList.findIndex(i => i === target) > -1
    },
    handleChartData(data) {
      const titleList = ['CPU', 'Memory', 'Pods', 'Service', 'Secret', 'ConfigMaps', 'Deployment', 'Ingress']
      const keys = ['cpu', 'memory', 'pods', 'services.nodeports', 'secrets', 'configmaps', 'deployments', 'ingresss']
      const result = titleList.map((title, idx) => {
        const quotaItem = data.quota[keys[idx]]
        const usedItem = data.used[keys[idx]]
        return {
          title: title,
          quota: {
            value: quotaItem ? parseInt(quotaItem) : null, // deployment, ingresss null, '0'
            unit: quotaItem ? getQuotaUnit(title, quotaItem) : ''
          },
          used: {
            value: formateUsedQuota(title, quotaItem, usedItem),
            unit: quotaItem ? getQuotaUnit(title, quotaItem) : ''
          }
        }
      })
      result.forEach(i => {
        i.leftQuota = {
          value: i.quota.value === null ? null : roundValue(i.quota.value - i.used.value),
          unit: i.quota.unit
        }
      })
      return formatChartDataResult(result)
    }
  }
}
</script>

<template>
  <div class="app-container">
    <router-view />
    <div v-if="this.$route.meta.rolePage" class="role-page">
      <div class="clearfix">
        <project-list-selector />
      </div>
      <el-divider />
      <el-row :gutter="12">
        <el-col v-for="item in usageList" :key="item.title" :lg="8" :xl="6">
          <el-card v-loading="listLoading" class="mb-4">
            <div slot="header" class="d-flex justify-space-between align-center" style="height: 24px">
              <strong>{{ item.title }}{{ item.quota }}</strong>
              <div>
                <el-tooltip effect="dark" :content="`${item.title} List`" placement="top-start">
                  <el-button
                    v-if="allowEditUsage(item.title)"
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    circle
                    plain
                    @click="handleEdit(item.title)"
                  />
                </el-tooltip>
              </div>
            </div>
            <div v-if="selectedProjectId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
            <div v-else>
              <resource-pie :chart-data="item.data" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
