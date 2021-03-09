<script>
import { getProjectUsage } from '@/api/projectResource'
import resourcePie from './components/resourcePie'
import {
  formatChartDataResult,
  formateUsedQuota,
  getQuotaUnit,
  roundValue
} from '@/utils/k8sResourceFormatter'
import MixinElCardWithAProject from '@/components/MixinElCardWithAProject'

export default {
  name: 'ProjectUsage',
  components: {
    resourcePie
  },
  mixins: [MixinElCardWithAProject],
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        return []
      }
      const res = await getProjectUsage(this.selectedProjectId)
      return this.handleChartData(res.data)
    },
    hasDetail(target) {
      const allowList = ['Deployment', 'Pods', 'Service', 'Secret', 'ConfigMaps', 'Ingress']
      return allowList.findIndex(i => i === target) > -1
    },
    showDetail(target) {
      if (!this.hasDetail(target)) {
        return
      }
      this.$router.push({ name: `${target} List` })
    },
    handleChartData(data) {
      const titleList = ['CPU', 'Memory', 'Pods', 'Service', 'Secret', 'ConfigMaps', 'Deployment', 'Ingress']
      const keys = ['cpu', 'memory', 'pods', 'services.nodeports', 'secrets', 'configmaps', 'deployments', 'ingress']
      const result = titleList.map((title, idx) => {
        const quotaItem = data.quota[keys[idx]]
        const usedItem = data.used[keys[idx]]
        return {
          title: title,
          quota: {
            value: quotaItem ? parseInt(quotaItem) : null, // deployment, ingress null, '0'
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
        <el-col v-for="item in listData" :key="item.title" :lg="8" :xl="6">
          <el-card v-loading="listLoading"
                   :class="{ 'mb-4': true, 'float-card': hasDetail(item.title) }"
                   :shadow="hasDetail(item.title) ? 'always' : 'never'"
                   @click.native="showDetail(item.title)"
          >
            <div slot="header" class="d-flex justify-space-between align-center"
                 style="height: 24px"
            >
              <strong>{{ item.title }}{{ item.quota }}</strong>
            </div>
            <div v-if="selectedProjectId === -1" style="text-align: center;">
              {{ $t('general.NoData') }}
            </div>
            <div v-else>
              <resource-pie :chart-data="item.data" />
            </div>
            <div :class="hasDetail(item.title) ? 'details-reminder' : 'reminder-space'">
              {{ $t('ProjectResource.Details') }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.float-card:not(:hover) {
  border: transparent solid 2px;
}

.float-card:hover {
  border: red solid 2px;
}

.details-reminder {
  font-weight: bold;
  color: #3358c3;
  text-decoration: underline;
  font-size: 19px;
  text-align: end;
}

.reminder-space {
  font-weight: bold;
  color: transparent;
  text-decoration: underline;
  font-size: 19px;
  text-align: end;
}
</style>
