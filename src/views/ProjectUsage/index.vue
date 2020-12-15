<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getProjectUsage } from '@/api/projects'
const formTemplate = {
  name: '',
  due_date: '',
  status: 'open',
  description: ''
}

export default {
  components: {
    Pagination,
    ProjectListSelector
  },
  data() {
    return {
      projectValue: '專科A',
      listLoading: true,
      dialogVisible: false,
      usageList: {
        used: {},
        quota: {}
      },
      dialogStatus: 1,
      memberConfirmLoading: false,
      form: formTemplate
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
      console.log(this.usageList)
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
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>CPU</span>
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
        <el-card shadow="never">
          <div slot="header" class="clearfix">
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
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>Pods</span>
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
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>Service</span>
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
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>Secrets</span>
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
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>ConfigMaps</span>
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
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
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
