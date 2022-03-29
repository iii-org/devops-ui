<template>
  <div class="text-right mb-3">
    <el-button
      size="small"
      icon="el-icon-refresh"
      class="buttonPrimaryReverse"
      :loading="listLoading"
      @click="syncCalculateProjectList"
    >
      {{ $t('Dashboard.ADMIN.UpdateNow') }}
    </el-button>
  </div>
</template>

<script>
import { updateCalculateProjectList } from '@/api_v2/projects'

export default {
  name: 'UpdateButton',
  props: {
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    syncCalculateProjectList() {
      this.$emit('update:listLoading', true)
      updateCalculateProjectList().then(() => {
        this.$message({
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.$emit('update')
      })
    }
  }
}
</script>
