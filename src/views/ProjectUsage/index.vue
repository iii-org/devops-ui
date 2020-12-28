<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectUsage } from '@/api/projectResource'

export default {
  name: 'ProjectUsage',
  components: {
    ProjectListSelector
  },
  data() {
    return {
      listLoading: true,
      usageList: {
        used: {},
        quota: {}
      }
    }
  },
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
      const res = await getProjectUsage(this.projectSelectedId)
      this.usageList = res.data
      this.listLoading = false
    },
    handleEdit(target, pId) {
      this.$router.push({ path: `/project-resource/${target}/${pId}` })
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
            <el-button icon="el-icon-edit" size="mini" type="primary" plain circle @click="handleEdit('deployment-list', projectSelectedId)" />
          </div>
          <div style="display: flex;">
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.cpu }}
            </div>
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Quota') }}</div>
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
          <div style="display: flex;">
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.memory }}
            </div>
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.memory }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>Pods</span>
            <el-button icon="el-icon-edit" size="mini" type="primary" plain circle @click="handleEdit('pod-list', projectSelectedId)" />
          </div>
          <div style="display: flex;">
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.pods }}
            </div>
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Quota') }}</div>
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
            <el-button icon="el-icon-edit" size="mini" type="primary" plain circle @click="handleEdit('service-list', projectSelectedId)" />
          </div>
          <div style="display: flex;">
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used['services.nodeports'] }}
            </div>
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota['services.nodeports'] }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>Secrets</span>
            <el-button icon="el-icon-edit" size="mini" type="primary" plain circle @click="handleEdit('secret-list', projectSelectedId)" />
          </div>
          <div style="display: flex;">
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.secrets }}
            </div>
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.secrets }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card v-loading="listLoading" shadow="never">
          <div slot="header" class="d-flex">
            <span>ConfigMaps</span>
            <el-button icon="el-icon-edit" size="mini" type="primary" plain circle @click="handleEdit('config-map-list', projectSelectedId)" />
          </div>
          <div style="display: flex;">
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Usage') }}</div>
              {{ usageList.used.configmaps }}
            </div>
            <div class="cardItem">
              <div>{{ $t('ProjectResource.Quota') }}</div>
              {{ usageList.quota.configmaps }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss">
.cardItem {
  width: 50%;
  margin: 5px;
  justify-content: center;
  text-align: center;
  font-size: 2rem;
  padding: 10px;
  div {
    color: #929292;
    font-size: 20px;
  }
}
</style>
