<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="50%"
    top="8vh"
    append-to-body
    destroy-on-close
  >
    <h2 class="text-center">
      {{ $t('Test.TestFile.TestData') }}
    </h2>
    <el-table
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 450px)"
      border
      fit
    >
      <el-table-column
        :label="$t('general.Index')"
        type="index"
        align="center"
        width="100"
      />
      <el-table-column
        v-for="item in variableList"
        :key="item"
        :label="item"
        :prop="item"
        align="center"
      />
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <template slot="footer">
      <el-button
        v-if="!isHistory"
        type="success"
        :loading="isLoading"
        @click="previous"
      >
        {{ $t('Test.TestFile.Previous') }}
      </el-button>
      <el-button
        type="primary"
        :loading="isLoading"
        @click="confirm"
      >
        {{ $t('Test.TestFile.TestNow') }}
      </el-button>
      <el-button
        class="buttonSecondaryReverse"
        :loading="isLoading"
        @click="close"
      >
        {{ $t('general.Close') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { BasicData } from '@/newMixins'
import {
  getSideexResult,
  generateSideex,
  getSideexHistory
} from '@/api/sideex'

export default {
  name: 'PreviewTestDataDialog',
  mixins: [BasicData],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    createDialogVisible: {
      type: Boolean,
      default: false
    },
    fileName: {
      type: String,
      default: ''
    },
    isHistory: {
      type: Boolean,
      default: true
    },
    variableList: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      isLoading: false,
      createLoading: false,
      loadingText: ['saveParamsSetting', 'createTestData', 'sideeXTestDataConverting'],
      loadingInstance: {}
    }
  },
  computed: {
  },
  watch: {
    createLoading(val) {
      if (val) {
        this.loadingInstance = this.$loading({
          text: this.$t('Loading'),
          lock: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
          customClass: 'project-dialog-loading'
        })
        this.loadingText.forEach((text, index) => {
          this.timer = setTimeout(() =>
            this.openFullLoading(text), 3000 * index
          )
        })
      } else {
        clearTimeout(this.timer)
        this.loadingInstance.close()
        this.close()
      }
    }
  },
  methods: {
    openFullLoading(loadingText) {
      // handle i18n log warning when loadingText is undefined
      const text = loadingText
        ? this.$t(`LoadingText.${loadingText}`)
        : this.$t('LoadingText.sideeXTestDataConverting')
      // set loading text every 3 second
      this.loadingInstance.setText(text)
    },
    async fetchData() {
      this.$emit('update:createDialogVisible', false)
      this.isLoading = true
      let data = []
      if (this.isHistory) {
        data = await getSideexHistory(this.selectedProjectId)
        this.$emit('update:variableList', Object.keys(data[0]))
      } else {
        data = (await getSideexResult(this.selectedProjectId)).data
      }
      this.isLoading = false
      return data
    },
    async confirm() {
      this.createLoading = true
      try {
        await generateSideex(this.selectedProjectId, { filename: this.fileName })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Added'),
          type: 'success'
        })
      } catch (e) {
        console.error(e)
        this.createLoading = false
      } finally {
        this.createLoading = false
      }
    },
    previous() {
      this.$emit('update:createDialogVisible', true)
    },
    close() {
      this.$emit('update')
      this.$emit('update:isHistory', true)
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 10px 20px;
}
</style>
