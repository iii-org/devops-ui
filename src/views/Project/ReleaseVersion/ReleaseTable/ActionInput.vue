<template>
  <div>
    <div v-if="!isShowInput">
      <el-tooltip :content="$t('Release.Tags')" placement="bottom">
        <em
          v-show="scope.row.docker.length !== 0"
          class="el-icon-price-tag operate-button finished mr-2"
          @click="showInput('IS_EDIT_TAG')"
        />
      </el-tooltip>
      <el-tooltip :content="$t('general.Report')" placement="bottom">
        <em
          v-show="scope.row.commit"
          class="el-icon-tickets operate-button active"
          @click="handleToTestReport(scope)"
        />
      </el-tooltip>
    </div>
    <el-tooltip v-else placement="bottom">
      <template slot="content">
        <span>{{ $t('general.Edit') + $t('general.Tag') }}</span>
      </template>
      <el-input
        ref="input"
        v-model="inputValue"
        :placeholder="$t('general.Input', { item: $t('general.Tag') })"
        @keyup.enter.native="saveTag"
        @keyup.esc.native="init"
        @blur="init"
      />
    </el-tooltip>
  </div>
</template>

<script>
import { addReleaseRepo, addReleaseTag } from '@/api_v2/release'
import { mapGetters } from 'vuex'
import variables from '@/styles/theme/variables.scss'

export default {
  name: 'ActionInput',
  props: {
    scope: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      inputValue: '',
      isShowInput: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    projectId() {
      return this.scope.row.project_id
    },
    releaseId() {
      return this.scope.row.id
    }
  },
  watch: {
    isShowInput(state) {
      this.$emit('onEditTag', state)
    }
  },
  methods: {
    showInput() {
      this.isShowInput = true
      this.$emit('onShowAll')
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return {
        color
      }
    },
    async saveTag() {
      if (!this.inputValue) return
      const formData = new FormData()
      formData.append('tags', this.inputValue)
      await addReleaseTag(this.projectId, this.releaseId, formData)
        .then(() => {
          this.handleUpdate()
        })
        .catch((error) => {
          this.showErrorMessage(error)
        })
    },
    // checkPath() {
    //   const isPassRules = /:/.test(this.inputValue)
    //   if (!isPassRules) {
    //     const h = this.$createElement
    //     this.showErrorMessage(
    //       h('p', { style: 'color: #f56c6c; font-size: 14px;' }, [
    //         h('div', null, this.$t('Release.StopAddingPathWarning')),
    //         h('div', null, this.$t('Release.FormatWarning'))
    //       ])
    //     )
    //     return
    //   }
    //   this.saveRepo()
    // },
    async saveRepo() {
      const formData = new FormData()
      formData.append('image_path', this.inputValue)
      await addReleaseRepo(this.projectId, this.releaseId, formData)
        .then(() => {
          this.handleUpdate()
        })
        .catch((error) => {
          this.showErrorMessage(error)
        })
    },
    handleUpdate() {
      this.showSuccessMessage(this.$t('Notify.Added'))
      this.$emit('onUpdated')
      this.init()
    },
    init() {
      this.inputValue = ''
      this.isShowInput = false
    },
    handleToTestReport(scope) {
      this.$router.push({
        name: 'TestReports',
        params: {
          commitId: scope.row.commit,
          commitBranch: scope.row.branch,
          projectId: this.selectedProject.id
        }
      })
    },
    showErrorMessage(message) {
      this.$message({
        message,
        type: 'error'
      })
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    }
  }
}
</script>
