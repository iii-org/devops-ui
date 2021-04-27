<template>
  <el-col class="mr-4" :xs="10" :sm="8" :md="7" :lg="6" :xl="4">
    <el-select
      v-model="projectValue"
      placeholder="select a project"
      style="width: 100%"
      filterable
      @change="onProjectChange"
    >
      <el-option v-for="item in userProjectList" :key="item.id" :label="item.display" :value="item.id" />
    </el-select>
    <slot />
  </el-col>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ProjectListSelector',
  data() {
    return {
      projectValue: ''
    }
  },
  computed: {
    ...mapGetters(['userProjectList', 'selectedProjectId'])
  },
  watch: {
    selectedProjectId: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          this.projectValue = val
          if (this.projectValue === -1) {
            this.projectValue = ''
          }
        })
      }
    }
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject']),
    onProjectChange(value) {
      localStorage.setItem('projectId', value)
      this.setSelectedProject(this.userProjectList.filter(elm => elm.id === value)[0])
    }
  }
}
</script>
