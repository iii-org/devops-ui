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
          @click="handleToTestReport(scope.row.commit)"
        />
      </el-tooltip>
      <el-tooltip :content="$t('Release.CustomPath')" placement="top">
        <em
          class="el-icon-edit cursor-pointer"
          @click="showInput('IS_EDIT_ROUTE')"
        />
      </el-tooltip>
    </div>
    <el-input
      v-else
      v-model="inputValue"
      :placeholder="$t('general.PleaseInput')"
    >
      <em
        slot="suffix"
        class="el-icon-circle-plus cursor-pointer button"
        :style="getStyle('menuActiveText')"
        @click="inputState === 'IS_EDIT_TAG' ? saveTag() : checkPath()"
      />
      <em
        slot="suffix"
        class="el-icon-error cursor-pointer button"
        :style="getStyle('danger')"
        @click="init"
      />
    </el-input>
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
      default: () => {}
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
        this.showErrorMessage(this.$t('Release.StopAddingPathWarning'))
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
    handleToTestReport(commitId) {
      this.$router.push({
        name: 'TestReport',
        params: { commitId, projectName: this.selectedProject.name }
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
  font-size: 24px;
}
</style>
