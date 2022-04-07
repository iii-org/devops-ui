<template>
  <div>
    <section
      :id="`copy-${scope.$index}-${idx}`"
      class="text-center"
    >
      <div class="text-subtitle-1 font-weight-bold">
        {{ getDockerCommand(image, scope.row.harbor_external_base_url) }}
      </div>
    </section>
    <el-select v-model="selectedTag" class="ml-3">
      <el-option
        v-for="tag in image.tags"
        :key="tag"
        :label="tag"
        :value="tag"
      />
    </el-select>
    <div class="flex justify-center">
      <el-button
        class="mr-2"
        icon="el-icon-copy-document"
        circle
        size="mini"
        @click="copyUrl(`copy-${scope.$index}-${idx}`)"
      />
      <el-button
        class="mr-2"
        :style="getStyle('danger')"
        :disabled="image.default"
        icon="el-icon-error"
        circle
        size="mini"
        @click="deleteTag"
      />
    </div>
  </div>
</template>

<script>
import { deleteReleaseRepo } from '@/api_v2/release'
import variables from '@/styles/theme/variables.scss'

export default {
  name: 'CommandSelector',
  props: {
    scope: {
      type: Object,
      default: () => {}
    },
    image: {
      type: Object,
      default: () => {}
    },
    idx: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedTag: this.image.tags[0]
    }
  },
  computed: {
    projectId() {
      return this.scope.row.project_id
    },
    releaseId() {
      return this.scope.row.id
    },
    repoName() {
      return this.image.repo
    }
  },
  methods: {
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return {
        color
      }
    },
    getDockerCommand() {
      const baseUrl = this.scope.row.harbor_external_base_url
      return `docker pull ${baseUrl}/${this.repoName}:${this.selectedTag}`
    },
    copyUrl(id) {
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Copied'),
        type: 'success'
      })
    },
    async deleteTag() {
      await deleteReleaseRepo(this.projectId, this.releaseId, this.repoName)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.$emit('onUpdated')
        })
    }
  }
}
</script>
