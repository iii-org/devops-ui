<template>
  <router-view />
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Layout',
  computed: {
    ...mapGetters(['userProjectList'])
  },
  mounted() {
    if ('id' in this.$attrs) {
      const id = this.$attrs['id']
      const project = this.userProjectList.find(elm => elm.name === id)
      console.log(project)
      if (project) {
        localStorage.setItem('projectId', project.id)
        this['projects/setSelectedProject'](project)
      } else {
        this.$router.push({ path: '/overview/project-list' })
      }
    }
  },
  methods: {
    ...mapActions(['projects/setSelectedProject'])
  }
}
</script>
