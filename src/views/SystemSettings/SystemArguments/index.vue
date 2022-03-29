<template>
  <el-tabs v-model="activeName" tab-position="left" class="h-full" @tab-click="handleClick">
    <el-tab-pane :label="$t('System.Secrets')" name="secrets" class="linkTextColor">
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
    <el-tab-pane :label="$t('System.SystemConfigs')" name="configs">
      <SystemConfigs ref="configs" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import SystemSecrets from './components/SystemSecrets'
import SystemRegistry from './components/SystemRegistry'
import RedmineMail from './components/RedmineMail'
import SystemTemplates from './components/SystemTemplates'
import SystemConfigs from './components/SystemConfigs'

export default {
  name: 'SystemArguments',
  components: {
    SystemRegistry,
    SystemSecrets,
    RedmineMail,
    SystemTemplates,
    SystemConfigs
  },
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

<style lang="scss" scoped>
/* To make el-tab content fill space, or table will not expand */
>>> .el-tabs__content {
  height: 100%;
}

>>> .el-tab-pane {
  height: 100%;
}

@import 'src/styles/theme/variables.scss';
>>> .el-tabs__item {
  &:hover {
    color: $linkTextColor;
  }
  &.is-active{
    color: $linkTextColor !important;
  }
}

>>> .el-tabs__active-bar {
  background-color: $linkTextColor;
}

>>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: $linkTextColor;
  border-color: $linkTextColor;
}

>>> .el-radio.is-bordered.is-checked {
  border-color: $linkTextColor;
}

>>> .el-radio__input.is-checked .el-radio__inner {
  background-color: $linkTextColor;
  border-color: $linkTextColor;
}

>>> .el-radio__input.is-checked+.el-radio__label {
  color: $linkTextColor;
}

>>> .el-radio__inner:hover {
  border-color: $linkTextColor;
}
</style>
