<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div>
      <i class="el-icon-location" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="language === 'zh-TW'" command="zh-TW">
        中文
      </el-dropdown-item>
      <el-dropdown-item :disabled="language === 'en'" command="en">
        English
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang
      this.$dayjs.locale(lang.toLowerCase())
      this.$store.dispatch('app/setLanguage', lang)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.SwitchLanguage'),
        type: 'success'
      })
    }
  }
}
</script>
