<template>
  <div class="flex items-center mb-3">
    <div class="mr-5">
      <div class="font-semibold">{{ this.$t('general.owner_name') }}：{{ selectedProject.owner_name }}</div>
      <div class="text-sm text-gray-400">#{{ selectedProject.name }}</div>
    </div>
    <div>
      <el-popover class="mr-3" placement="top" width="400" trigger="hover" :open-delay="300" :close-delay="50">
        <p class="text-center">
          <span class="text-title">{{ selectedProject.git_url }}</span>
        </p>
        <div class="flex justify-center">
          <el-button
            icon="el-icon-copy-document"
            circle
            size="mini"
            @click="copyUrl(selectedProject.git_url)"
          />
          <a :href="selectedProject.git_url" target="_blank" class="ml-2">
            <el-button circle size="mini">
              <svg-icon icon-class="foreign" />
            </el-button>
          </a>
        </div>
        <el-link slot="reference" :underline="false" style="font-size: 22px">
          <svg-icon icon-class="gitlab" />
        </el-link>
      </el-popover>
      <el-link target="_blank" class="mr-3" style="font-size: 22px" :underline="false" :href="selectedProject.redmine_url">
        <svg-icon icon-class="redmine" />
      </el-link>
      <el-link target="_blank" style="font-size: 22px" :underline="false" :href="selectedProject.harbor_url">
        <svg-icon icon-class="harbor" />
      </el-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectInfoBar',
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['selectedProject'])
  },
  watch: {},
  methods: {
    copyUrl(text) {
      this.$copyText(text).then(
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Copied'),
          type: 'success'
        })
      )
    }
  }
}
</script>
