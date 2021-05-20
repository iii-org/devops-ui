<template>
  <el-tabs v-model="activeName" tab-position="left" style="height: 100%" @tab-click="handleClick">
    <el-tab-pane :label="$t('System.Secrets')" name="secrets" style="height: 100%">
      <system-secrets ref="secrets" />
    </el-tab-pane>
    <el-tab-pane :label="$t('System.Registry')" name="registry" style="height: 100%">
      <system-registry ref="registry" />
    </el-tab-pane>
    <el-tab-pane :label="$t('System.RedmineMail')" name="redmineMail" style="height: 100%">
      <redmine-mail ref="redmineMail" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import SystemSecrets from './components/SystemSecrets'
import SystemRegistry from './components/SystemRegistry'
import RedmineMail from './components/RedmineMail'

export default {
  name: 'SystemArguments',
  components: { SystemRegistry, SystemSecrets, RedmineMail },
  data() {
    return {
      activeName: 'secrets'
    }
  },
  methods: {
    handleClick() {
      this.$refs[this.activeName].adjustTable()
    }
  }
}
</script>

<style>
/* To make el-tab content fill space, or table will not expand */
.el-tabs__content {
  height: 100%;
}
</style>
