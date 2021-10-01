<template>
  <section>
    <template v-if="routeName === 'Pipelines'">
      <PipelineSettingsTable />
    </template>
    <template v-if="routeName === 'Project Settings'">
      <el-collapse-item v-loading="isLoading" :element-loading-text="$t('Loading')" name="PluginSettings">
        <template slot="title">
          <span class="text-title mr-3">{{ $t('Plugin.Manage') }}</span>
        </template>
        <PipelineSettingsTable ref="table" />
      </el-collapse-item>
    </template>
  </section>
</template>

<script>
import PipelineSettingsTable from '@/views/Plan/Settings/components/PipelineSettingsTable'

export default {
  name: 'PipelineSettings',
  components: { PipelineSettingsTable },
  data() {
    return {
    }
  },
  computed: {
    routeName () {
      return this.$route.name
    },
    isLoading () {
      return this.$refs.isLoading
    }
  },
  methods: {
  }
}
</script>
