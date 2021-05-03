<template>
  <div class="app-container">
    <div class="d-flex">
      <ProjectListSelector />
    </div>
    <el-divider />
    <el-row :gutter="10">
      <el-col class="mb-4" :xs="24">
        <el-card shadow="never">
          <el-collapse v-model="activeNames">
            <ProjectMembers />
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ProjectMembers } from '../components'
import ProjectListSelector from '@/components/ProjectListSelector'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'QA',
  components: { ProjectListSelector, ProjectMembers },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    activeNames: []
  }),
  watch: {
    activeNames(val) {
      localStorage.setItem('ProjectSettingsActiveNames', JSON.stringify(val))
    }
  },
  mounted() {
    this.getActiveCollapseItem()
  },
  methods: {
    getActiveCollapseItem() {
      const target = JSON.parse(localStorage.getItem('ProjectSettingsActiveNames'))
      this.activeNames = target === null ? ['ProjectMembers'] : target
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
    },
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
    }
  }
}
</script>
