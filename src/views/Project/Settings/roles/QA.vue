<template>
  <div class="app-container">
    <div class="flex">
      <ProjectListSelector />
    </div>
    <el-divider />
    <el-row v-if="selectedProjectId !== -1" :gutter="10">
      <el-col class="mb-4" :xs="24">
        <el-card shadow="never">
          <el-collapse v-model="activeNames">
            <ProjectMembers />
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
    <el-alert v-else type="warning" :closable="false">
      <h2><i class="el-icon-warning" /> {{ $t('general.Warning') }}</h2>
      <h3>{{ this.$t('Notify.NoProject') }}</h3>
    </el-alert>
  </div>
</template>

<script>
import { ProjectMembers } from '../components'
import ProjectListSelector from '@/components/ProjectListSelector'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'

export default {
  name: 'QA',
  components: { ProjectListSelector, ProjectMembers },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      activeNames: []
    }
  },
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
