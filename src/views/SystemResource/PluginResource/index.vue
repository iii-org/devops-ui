<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector />
      <el-divider />
      <el-row :gutter="12">
        <el-empty
          v-if="usageList.length ===0"
          :description="$t('general.NoData')"
        />
        <template v-else>
          <el-col
            v-for="item in usageList"
            :key="item.title"
            :lg="8"
            :xl="6"
          >
            <el-card
              v-loading="listLoading"
              :class="{ 'mb-3': true, 'float-card': hasDetail(item.title) }"
              :shadow="hasDetail(item.title) ? 'always' : 'never'"
              @click.native="showDetail(item.title)"
            >
              <div
                slot="header"
                class="flex justify-between items-center"
                style="height: 24px"
              >
                <strong>{{ item.title }}{{ item.quota }}</strong>
              </div>
              <div
                v-if="selectedProjectId === -1"
                style="text-align: center;"
              >{{ $t('general.NoData') }}</div>
              <div v-else>
                <div>
                  <resource-pie :chart-data="item.data" />
                </div>
                <div
                  :class="hasDetail(item.title) ? 'details-reminder' : 'reminder-space'"
                  :style="{ cursor: 'pointer' }"
                >
                  {{ $t('ProjectResource.Details') }}
                </div>
              </div>
            </el-card>
          </el-col>
        </template>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getPluginResource } from '@/api/harbor'
import resourcePie from './components/resourcePie'

const handleLeftQuota = (item) => {
  const quotaValue = item.quota.value === '' ? 0 : Number(item.quota.value)
  const usedValue = item.used.value === '' ? 0 : Number(item.used.value)
  return quotaValue - usedValue
}
const formatValue = (title, value) => {
  if (title === 'Harbor') return (value / 1024 / 1024 / 1024).toFixed(2)
  if (title === 'GitLab') return (value / 1024 / 1024 / 1024).toFixed(2)
}
const getValueUnit = (title) => {
  if (title === 'Harbor') return 'GB'
  if (title === 'GitLab') return 'GB'
}

const formatChartData = (item) => {
  const result = []
  if (item.quota.value === '') {
    result.push({
      value: formatValue(item.title, item.used.value),
      name: `Usage (${getValueUnit(item.title)})`,
      itemStyle: { color: '#E85656', emphasis: { color: '#E85656' }}
    })
  } else {
    result.push({
      value: formatValue(item.title, handleLeftQuota(item)),
      name: `Left Quota (${getValueUnit(item.title)})`,
      itemStyle: { color: '#3ECBBC', emphasis: { color: '#3ECBBC' }}
    })
    result.push({
      value: formatValue(item.title, item.used.value),
      name: `Usage (${getValueUnit(item.title)})`,
      itemStyle: { color: '#E85656', emphasis: { color: '#E85656' }}
    })
  }
  return result
}

const getQuotaString = (item) =>
  item.quota.value !== '' ? `（${formatValue(item.title, item.quota.value)}${getValueUnit(item.title)}）` : ''

const handleChartData = (data) =>
  data.map((item) => {
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
  data() {
    return {
      listLoading: true,
      usageList: []
    }
  },
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
    hasDetail(target) {
      const allowList = ['Harbor']
      return allowList.findIndex((i) => i === target) > -1
    },
    showDetail(target) {
      if (!this.hasDetail(target)) {
        return
      }
      this.$router.push({ name: `${target}`, params: { projectName: this.$store.getters.selectedProject.name }})
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.float-card:not(:hover) {
  border: transparent solid 2px;
}

.float-card:hover {
  border: red solid 2px;
}

.details-reminder {
  font-weight: bold;
  color: $linkTextColor;
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
