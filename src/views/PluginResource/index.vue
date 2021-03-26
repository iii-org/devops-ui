<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getPluginResource } from '@/api/harbor'
import resourcePie from './components/resourcePie'

const handleLeftQuota = item => {
  const quotaValue = item.quota.value === '' ? 0 : item.quota.value
  const usedValue = item.used.value === '' ? 0 : item.used.value
  return quotaValue - usedValue
}
const formatValue = (title, value) => {
  if (title === 'Harbor') return (value / 1024 / 1024 / 1024).toFixed(2)
  if (title === 'GitLab') return (value / 1024 / 1024 / 1024).toFixed(2)
}
const getValueUnit = title => {
  if (title === 'Harbor') return 'GB'
  if (title === 'GitLab') return 'GB'
}

const formatChartData = item => {
  const result = []
  if (item.quota.value === '') {
    result.push({
      value: formatValue(item.title, item.used.value),
      name: `Usage (${getValueUnit(item.title)})`,
      itemStyle: { color: '#E85656', emphasis: { color: '#E85656' } }
    })
  } else {
    result.push({
      value: formatValue(item.title, handleLeftQuota(item)),
      name: `Left Quota (${getValueUnit(item.title)})`,
      itemStyle: { color: '#3ECBBC', emphasis: { color: '#3ECBBC' } }
    })
    result.push({
      value: formatValue(item.title, item.used.value),
      name: `Usage (${getValueUnit(item.title)})`,
      itemStyle: { color: '#E85656', emphasis: { color: '#E85656' } }
    })
  }
  return result
}

const getQuotaString = item =>
  item.quota.value !== '' ? `（${formatValue(item.title, item.quota.value)}${getValueUnit(item.title)}）` : ''

const handleChartData = data =>
  data.map(item => {
    return {
      title: item.title,
      data: formatChartData(item),
      quota: getQuotaString(item)
    }
  })

export default {
  name: 'PluginResource',
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
        const res = await getPluginResource(this.selectedProjectId)
        this.usageList = handleChartData(res.data)
      }
      this.listLoading = false
    },
    handleEdit(target) {
      this.$router.push({ name: target })
    },
    allowEditUsage(target) {
      const allowList = ['Harbor']
      return allowList.findIndex(i => i === target) > -1
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
      <el-col v-for="item in usageList" :key="item.title" :lg="8" :xl="6">
        <el-card v-loading="listLoading" class="mb-4">
          <div slot="header" class="d-flex justify-space-between align-center" style="height: 24px">
            <strong>{{ item.title }}{{ item.quota }}</strong>
            <div>
              <el-tooltip effect="dark" :content="`${item.title} Resource`" placement="top-start">
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
</template>
