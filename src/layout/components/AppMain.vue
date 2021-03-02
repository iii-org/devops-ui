<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
  </section>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    }
  },
  async created() {
    // const loading = this.$loading({
    //   lock: true,
    //   text: 'Loading',
    //   spinner: 'el-icon-loading',
    //   background: 'rgba(0, 0, 0, 0.7)'
    // })
    // await this['projects/getProjectList']()
    // loading.close()
  },
  methods: {
    ...mapActions(['projects/getProjectList'])
  }
}
</script>

<style scoped>
.app-main {
  height: calc(100% - 50px); /* 50px is the nav bar */
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
