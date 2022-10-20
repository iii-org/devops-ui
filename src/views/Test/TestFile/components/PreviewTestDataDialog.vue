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
      height="calc(100vh - 280px)"
      fit
    >
      <el-table-column
        v-for="item in variableName"
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
import { getSideexJson } from '@/api/sideex'

export default {
  name: 'PreviewTestDataDialog',
  mixins: [BasicData],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    variableName: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      isLoading: false
    }
  },
  computed: {
  },
  methods: {
    async fetchData() {
      this.isLoading = true
      const data = await getSideexJson(this.selectedProjectId)
      this.isLoading = false
      return data
    },
    close() {
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
