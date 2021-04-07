<template>
  <div class="app-container">
    <div class="d-flex">
      <ProjectListSelector />
    </div>
    <el-divider />
    <el-row :gutter="10">
      <el-col class="mb-4" :sm="24" :md="10" :lg="9">
        <el-card shadow="never">
          <el-collapse v-model="activeNames">
            <PipelineSettings />
          </el-collapse>
        </el-card>
      </el-col>
      <el-col class="mb-4" :sm="24" :md="14" :lg="15">
        <el-card shadow="never">
          <el-collapse v-model="activeNames">
            <ProjectVersions />
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
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
import { ProjectVersions, ProjectMembers, PipelineSettings } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'

export default {
  name: 'ProjectSettings',
  components: { ProjectListSelector, ProjectVersions, PipelineSettings, ProjectMembers },
  data: () => ({
    activeNames: ['PluginSettings']
  })
}
</script>
