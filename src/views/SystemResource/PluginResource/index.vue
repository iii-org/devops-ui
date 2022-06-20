<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector />
      <el-divider />
      <el-row :gutter="12" class="flex flex-wrap">
        <el-empty
          v-if="usageList.length === 0"
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
                  <ResourcePie :chart-data="item.data" />
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
import { getProjectUsage } from '@/api/kubernetes'
import ResourcePie from './components/ResourcePie'
import { handlePluginData } from '@/utils/pluginResourceFormatter'
import { handleK8sData } from '@/utils/k8sResourceFormatter'

export default {
  name: 'PluginResource',
  components: {
    ProjectListSelector,
    ResourcePie
  },
  data() {
    return {
      listLoading: false,
      usageList: []
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'selectedProjectId'])
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
      await Promise.allSettled([
        getPluginResource(this.selectedProjectId),
        getProjectUsage(this.selectedProjectId)
      ]).then((res) => {
        const [plugins, k8s] = res
        const pluginsData = handlePluginData(plugins.value.data)
        const k8sData = handleK8sData(k8s.value.data)
        this.usageList = [...pluginsData, ...k8sData]
      }).catch((error) => {
        console.error(error)
      })
      this.listLoading = false
    },
    hasDetail(target) {
      const allowList = ['Deployment', 'Pods', 'Service', 'Secret', 'ConfigMaps', 'Ingresses', 'Harbor']
      return allowList.findIndex((i) => i === target) > -1
    },
    showDetail(target) {
      if (!this.hasDetail(target)) return
      if (target === 'Harbor') this.$router.push({ name: `${target}`, params: { projectName: this.selectedProject.name }})
      else this.$router.push({ name: `${target}List`, params: { projectName: this.selectedProject.name }})
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
