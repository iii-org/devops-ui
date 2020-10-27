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
      this.changeSelectedProjectId(value)
      this.changeSelectedProjectObject(this.userProjectList.filter(elm => elm.id === value)[0])
    }
  }
}
</script>

<template>
  <el-select v-model="projectValue" placeholder="select a project" @change="onProjectChange">
    <el-option v-for="item in userProjectList" :key="item.id" :label="item.display" :value="item.id" />
  </el-select>
</template>
