<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectUsage } from '@/api/projectResource'
import resourcePie from './components/resourcePie'

const calcLeftQuota = (title, quotaStr, usageStr) =>
  title === 'Memory' ? calcMemoryLeftQuota(quotaStr, usageStr) : Number(quotaStr) - Number(usageStr)
const calcMemoryLeftQuota = (quotaStr, usageStr) => {
  const quota = { unit: quotaStr.slice(quotaStr.length - 1), value: Number(quotaStr.slice(0, quotaStr.length - 1)) }
  const usage = {
    unit: usageStr === '0' ? 'K' : usageStr.slice(usageStr.length - 2, usageStr.length - 1),
    value: usageStr === '0' ? 0 : Number(usageStr.slice(0, usageStr.length - 2))
  }
  quota.value = formatResourceValue(quota)
  usage.value = formatResourceValue(usage)
  return formatLeftQuotaValue(quota.unit, quota.value, usage.value)
}
const formatResourceValue = resource => {
  if (resource.unit === 'G') {
    return resource.value * 1000 * 1000
  } else if (resource.unit === 'M') {
    return resource.value * 1000
  } else if (resource.unit === 'K') {
    return resource.value
  }
}
const formatLeftQuotaValue = (unit, quota, usage) => {
  let result = 0
  if (unit === 'G') {
    result = (quota - usage) / 1000 / 1000
  } else if (unit === 'M') {
    result = (quota - usage) / 1000
  } else if (unit === 'K') {
    result = quota - usage
  }
  return result.toFixed(2)
}

const formatUsageValue = (leftUnit, usageUnit, usageValue) => {
  let result = usageValue
  if (usageUnit === 'G') {
    result = result * 1000 * 1000
  } else if (usageUnit === 'M') {
    result = result * 1000
  }
  if (leftUnit === 'G') {
    result = result / 1000 / 1000
  } else if (leftUnit === 'M') {
    result = result / 1000
  }
  return result.toFixed(2)
}

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
    ...mapGetters(['projectSelectedId'])
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      if (this.projectSelectedId !== -1) {
        const res = await getProjectUsage(this.projectSelectedId)
        this.usageList = this.handleChartData(res.data)
      }
      this.listLoading = false
    },
    handleChartData(data) {
      const titleList = ['CPU', 'Memory', 'Pods', 'Service', 'Secret', 'ConfigMaps']
      const itemList = ['cpu', 'memory', 'pods', 'services.nodeports', 'secrets', 'configmaps']
      const result = titleList.map((i, idx) => {
        const quotaStr = data.quota[itemList[idx]]
        const usedStr = data.used[itemList[idx]]
        const quotaUnit = quotaStr.slice(quotaStr.length - 1)
        const usageUnit = usedStr.slice(usedStr.length - 2, usedStr.length - 1)
        const usageValue = Number(usedStr.slice(0, usedStr.length - 2))
        const dataTitle = titleList[idx]
        return {
          title: dataTitle,
          data: [
            {
              value: dataTitle === 'Memory' ? formatUsageValue(quotaUnit, usageUnit, usageValue) : Number(usedStr),
              name:
                dataTitle === 'Memory' && usedStr !== '0' ? `Usage (${quotaStr.slice(quotaStr.length - 1)})` : 'Usage',
              itemStyle: { color: '#E85656', emphasis: { color: '#E85656' } }
            },
            {
              value: calcLeftQuota(dataTitle, quotaStr, usedStr),
              name: dataTitle === 'Memory' ? `Left Quota (${quotaStr.slice(quotaStr.length - 1)})` : 'Left Quota',
              itemStyle: { color: '#3ECBBC', emphasis: { color: '#3ECBBC' } }
            }
          ]
        }
      })
      return result
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
    </div>
    <el-divider />
    <el-row :gutter="12">
      <el-col v-for="item in usageList" :key="item.title" :span="8">
        <el-card v-loading="listLoading" style="margin-bottom: 15px">
          <div slot="header">
            <strong>{{ item.title }}</strong>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else>
            <resource-pie :chart-data="item.data" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
