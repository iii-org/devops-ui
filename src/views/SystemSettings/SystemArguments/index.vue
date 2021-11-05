<template>
  <el-tabs v-model="activeName" tab-position="left" class="h-full" @tab-click="handleClick">
    <el-tab-pane :label="$t('System.Secrets')" name="secrets">
      <SystemSecrets ref="secrets" />
    </el-tab-pane>
    <el-tab-pane :label="$t('System.Registry')" name="registry">
      <SystemRegistry ref="registry" />
    </el-tab-pane>
    <el-tab-pane :label="$t('System.RedmineMail')" name="redmineMail">
      <RedmineMail ref="redmineMail" />
    </el-tab-pane>
    <el-tab-pane :label="$t('System.SystemTemplates')" name="templates">
      <SystemTemplates ref="templates" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import SystemSecrets from './components/SystemSecrets'
import SystemRegistry from './components/SystemRegistry'
import RedmineMail from './components/RedmineMail'
import SystemTemplates from './components/SystemTemplates'

export default {
  name: 'SystemArguments',
  components: { SystemRegistry, SystemSecrets, RedmineMail, SystemTemplates },
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

.el-tab-pane {
  height: 100%;
}
</style>
