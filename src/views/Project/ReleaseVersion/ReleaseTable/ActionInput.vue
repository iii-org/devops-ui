<template>
  <div>
    <div v-if="!isShowInput">
      <el-tooltip :content="$t('Release.Tags')" placement="top">
        <em
          class="el-icon-price-tag cursor-pointer mr-2"
          @click="showInput('IS_EDIT_TAG')"
        />
      </el-tooltip>
      <el-tooltip :content="$t('general.Report')" placement="top">
        <em
          v-show="scope.row.commit"
          class="el-icon-tickets cursor-pointer mr-2"
          @click="handleToTestReport(scope)"
        />
      </el-tooltip>
      <el-tooltip :content="$t('Release.CustomPath')" placement="top">
        <em
          class="el-icon-edit cursor-pointer"
          @click="showInput('IS_EDIT_ROUTE')"
        />
      </el-tooltip>
    </div>
    <el-tooltip v-else placement="top">
      <template v-if="inputState === 'IS_EDIT_ROUTE'" slot="content">
        <span>{{ $t('general.Format') }}: </span>
        <span style="color: #f56c6c;" class="font-bold">
          branch:version
        </span>
      </template>
      <template v-else-if="inputState === 'IS_EDIT_TAG'" slot="content">
        <span>{{ $t('general.Edit') }}{{ $t('general.Tag') }}</span>
      </template>
      <el-input
        v-model="inputValue"
        :placeholder="placeholder"
        style="font-size: 6px;"
      >
        <em
          slot="suffix"
          class="el-icon-circle-plus cursor-pointer button"
          :style="getStyle('buttonPrimary')"
          @click="inputState === 'IS_EDIT_TAG' ? saveTag() : checkPath()"
        />
        <em
          slot="suffix"
          class="el-icon-error cursor-pointer button"
          :style="getStyle('danger')"
          @click="init"
        />
      </el-input>
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
      isShowInput: false,
      inputState: null
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    projectId() {
      return this.scope.row.project_id
    },
    releaseId() {
      return this.scope.row.id
    },
    placeholder() {
      return this.inputState === 'IS_EDIT_TAG'
        ? this.$t('general.Input', { item: this.$t('general.Tag') })
        : this.$t('general.Input', { item: this.$t('general.Path') })
    }
  },
  watch: {
    inputState(state) {
      this.$emit('onEditTag', state === 'IS_EDIT_TAG')
    }
  },
  methods: {
    showInput(state) {
      this.isShowInput = true
      this.inputState = state
      this.$emit('onShowAll')
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
          this.showSuccessMessage(this.$t('Notify.Added'))
          this.$emit('onUpdated')
          this.init()
        })
        .catch((error) => {
          this.showErrorMessage(error)
        })
    },
    checkPath() {
      const isPassRules = /:/.test(this.inputValue)
      if (!isPassRules) {
        const h = this.$createElement
        this.showErrorMessage(
          h('p', { style: 'color: #f56c6c; font-size: 14px;' }, [
            h('div', null, this.$t('Release.StopAddingPathWarning')),
            h('div', null, this.$t('Release.FormatWarning'))
          ])
        )
        return
      }
      this.saveRepo()
    },
    async saveRepo() {
      const formData = new FormData()
      formData.append('image_path', this.inputValue)
      await addReleaseRepo(this.projectId, this.releaseId, formData)
        .then(() => {
          this.showSuccessMessage(this.$t('Notify.Added'))
          this.$emit('onUpdated')
          this.init()
        })
        .catch((error) => {
          this.showErrorMessage(error)
        })
    },
    init() {
      this.inputValue = ''
      this.isShowInput = false
      this.inputState = null
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

<style lang="scss" scoped>
.button {
  line-height: 40px;
  font-size: 18px;
}
</style>
