<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectUsage } from '@/api/projectResource'
import resourcePie from './components/resourcePie'
const calcLeftQuota = (title, quotaStr, usageStr) =>
  title === 'Memory' ? calcMemory(quotaStr, usageStr) : Number(quotaStr) - Number(usageStr)
const calcMemory = (quotaStr, usageStr) => {
  console.log({ quotaStr, usageStr })
  const quota = { unit: quotaStr.slice(quotaStr.length - 1), value: Number(quotaStr.slice(0, quotaStr.length - 1)) }
  const usage = {
    unit: usageStr === '0' ? 'K' : usageStr.slice(usageStr.length - 2, usageStr.length - 1),
    value: usageStr === '0' ? 0 : Number(usageStr.slice(0, usageStr.length - 2))
  }
  quota.value = formatValue(quota)
  usage.value = formatValue(usage)

  return calcResult(quota.value, usage.value, quota.unit).toFixed(2)
}

const formatValue = obj => {
  if (obj.unit === 'G') {
    return obj.value * 1000 * 1000
  } else if (obj.unit === 'M') {
    return obj.value * 1000
  } else if (obj.unit === 'K') {
    return obj.value
  }
}

const calcResult = (quota, usage, unit) => {
  if (unit === 'G') {
    return (quota - usage) / 1000 / 1000
  } else if (unit === 'M') {
    return (quota - usage) / 1000
  } else if (unit === 'K') {
    return quota - usage
  }
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
        // this.usageList = this.handleChartData(res.data)
        this.usageList = this.handleChartData({
          quota: {
            configmaps: '60',
            cpu: '10',
            memory: '10G',
            pods: '20',
            secrets: '60',
            'services.nodeports': '10'
          },
          used: {
            configmaps: '0',
            cpu: '0',
            memory: '0',
            pods: '0',
            secrets: '12',
            'services.nodeports': '0'
          }
        })
      }
      this.listLoading = false
    },
    handleChartData(data) {
      const titleList = ['CPU', 'Memory', 'Pods', 'Service', 'Secret', 'ConfigMaps']
      const itemList = ['cpu', 'memory', 'pods', 'services.nodeports', 'secrets', 'configmaps']
      const result = titleList.map((i, idx) => {
        const quotaStr = data.quota[itemList[idx]]
        const usedStr = data.used[itemList[idx]]
        const dataTitle = titleList[idx]
        return {
          title: dataTitle,
          data: [
            {
              value: dataTitle === 'Memory' ? Number(usedStr.slice(0, usedStr.length - 2)) : Number(usedStr),
              name:
                dataTitle === 'Memory' ? `Memory (${usedStr.slice(usedStr.length - 2, usedStr.length - 1)})` : 'Usage',
              itemStyle: { color: '#E85656', emphasis: { color: '#E85656' } }
            },
            {
              value: calcLeftQuota(dataTitle, quotaStr, usedStr),
              // name: 'Left Quota',
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
