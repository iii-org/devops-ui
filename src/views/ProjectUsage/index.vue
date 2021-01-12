<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectUsage } from '@/api/projectResource'

export default {
  name: 'ProjectUsage',
  components: {
    ProjectListSelector
  },
  data: () => ({
    listLoading: true,
    usageList: {
      used: {},
      quota: {}
    }
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
        this.usageList = res.data
      }
      this.listLoading = false
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
    <el-row :gutter="12" shadow="never">
      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>CPU</span>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else style="display: flex;">
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.cpu }}
              <!-- <div class="d-flex align-center">
                <div class="card-item-subtext text-warning">專案</div>
                <div class="text-warning">{{ usageList.used.cpu }}</div>
                <div class="card-item-subtext text-slow">系統</div>
                <div class="text-slow">{{ usageList.used.cpu }}</div>
              </div> -->
            </div>
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.cpu }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>Memory</span>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else style="display: flex;">
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.memory }}
            </div>
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.memory }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>Pods</span>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else style="display: flex;">
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.pods }}
            </div>
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.pods }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" style="margin-top: 10px;">
      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>Service</span>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else style="display: flex;">
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used['services.nodeports'] }}
            </div>
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota['services.nodeports'] }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>Secrets</span>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else style="display: flex;">
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.secrets }}
            </div>
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.secrets }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>ConfigMaps</span>
          </div>
          <div v-if="projectSelectedId === -1" style="text-align: center;">{{ $t('general.NoData') }}</div>
          <div v-else style="display: flex;">
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.configmaps }}
            </div>
            <div class="card-item">
              <div class="card-item-text">{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.configmaps }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.card-item {
  width: 50%;
  margin: 5px;
  justify-content: center;
  text-align: center;
  font-size: 2rem;
  padding: 10px;
  .card-item-text {
    color: #929292;
    font-size: 20px;
  }
  .card-item-subtext {
    font-size: 16px;
  }
}
</style>
