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
    ...mapGetters(['userProjectList', 'projectSelectedId'])
  },
  watch: {
    projectSelectedId: {
      immediate: true,
      handler(val, old) {
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
    ...mapActions('projects', ['changeSelectedProjectId', 'changeSelectedProjectObject']),
    onProjectChange(value) {
      localStorage.setItem('project', value)
      this.changeSelectedProjectId(value)
      this.changeSelectedProjectObject(this.userProjectList.filter(elm => elm.id === value)[0])
    }
  }
}
</script>

<template>
  <el-col class="mr-4" :xs="10" :sm="8" :md="7" :lg="6" :xl="4">
    <el-select
      v-model="projectValue"
      placeholder="select a project"
      style="width: 100%"
      @change="onProjectChange"
    >
      <el-option v-for="item in userProjectList" :key="item.id" :label="item.display" :value="item.id" />
    </el-select>
    <slot />
  </el-col>
</template>
