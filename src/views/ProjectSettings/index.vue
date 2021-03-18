<script>
import { ProjectVersions, ProjectMembers } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'

export default {
  name: 'ProjectSettings',
  components: { ProjectVersions, ProjectMembers, ProjectListSelector }
}
</script>

<template>
  <div class="app-container">
    <div class="mb-8">
      <project-list-selector />
    </div>
    <el-row :gutter="10">
      <el-col :span="24" class="mb-8">
        <project-versions />
      </el-col>
      <el-col :span="24">
        <project-members />
      </el-col>
    </el-row>
  </div>
</template>
