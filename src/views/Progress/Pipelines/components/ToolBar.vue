<template>
  <div class="flex justify-between mt-5 mb-5">
    <div>
      {{ $t('DevOps.Tools') }}:
      <slot name="toolName" />
    </div>
    <div>
      <slot name="warning" />
      <slot name="link" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolBar'
}
</script>
