<template>
  <div class="flex justify-between mt-5 mb-5">
    <div>
      {{ $t('DevOps.Tools') }}:
      <slot name="toolName" />
    </div>
    <div>
      <slot name="link" />
      <!-- <el-link>
        <i class="el-icon-tickets cursor-pointer" :underline="false" />
        {{ $t('TestReport.DetailReport') }}
      </el-link> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolBar'
}
</script>
