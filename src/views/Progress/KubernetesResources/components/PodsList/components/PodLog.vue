<template>
  <el-dialog :title="containerName" :visible="dialogVisible" width="90%" @close="handleClose">
    <div class="text-right">
      <el-button
        :loading="isLoading"
        class="mb-3"
        type="success"
        size="small"
        icon="el-icon-refresh"
        plain
        @click="handleRefresh"
      >
        Refresh
      </el-button>
    </div>
    <el-card
      v-loading="isLoading"
      class="mb-2"
      :body-style="{
        color: '#fff',
        background: '#222',
        lineHeight: 1,
        fontSize: '14px',
        height: '200px',
        overflow: 'auto'
      }"
    >
      <pre>{{ logMessage }}</pre>
    </el-card>
    <span slot="footer">
      <el-button @click="handleClose">{{ $t('general.Close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'PodLog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    logMessage: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    containerName: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClose() {
      this.$emit('hideDialog', false)
    },
    handleRefresh() {
      this.$emit('refresh')
    }
  }
}
</script>
