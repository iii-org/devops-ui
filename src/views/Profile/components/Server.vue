<template>
  <div class="tab-inner">
    <el-descriptions
      :title="$t('Profile.ServerPassword')"
      :column="2"
      style="font-size:20px;"
      border
    >
      <template slot="extra">
        <el-button
          v-if="!disableEdit"
          class="buttonPrimary"
          @click="handleResetPassword()"
        >
          {{ $t('Profile.ResetPassword') }}
        </el-button>
      </template>
      <el-descriptions-item
        v-for="(item, index) in serverPasswordForm"
        :key="item.server"
        :content-style="{'width': '25%'}"
      >
        <template slot="label">
          <em :class="item.status === 0 ? 'el-icon-close' : 'el-icon-check'" />
          {{ item.server }}
        </template>
        <span
          v-if="item.status === 0"
          class="flex justify-between"
        >
          {{ item.visible ? item.password : '*'.repeat(item.password.length) }}
          <em
            :class="item.visible ? 'ri-eye-fill' : 'ri-eye-close-line'"
            @click="showPassword(index)"
          />
        </span>
        <span v-else>
          {{ $t('Profile.SamePlatformPassword') }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
export default {
  name: 'ServerPassword',
  props: {
    disableEdit: {
      type: Boolean,
      default: false
    },
    serverPasswordForm: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleResetPassword() {
      this.$emit('directToSecurity')
    },
    showPassword(index) {
      this.serverPasswordForm[index].visible = !this.serverPasswordForm[index].visible
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-inner {
  padding: 0 25px;
}
</style>
