<template>
  <div>
    <div v-if="!isShowInput">
      <el-tooltip content="備註標籤" placement="top">
        <em
          class="el-icon-price-tag cursor-pointer mr-2"
          @click="showInput"
        />
      </el-tooltip>
      <el-tooltip :content="$t('general.Report')" placement="top">
        <em
          v-show="scope.row.commit"
          class="el-icon-tickets cursor-pointer mr-2"
          @click="handleToTestReport(scope.row.commit)"
        />
      </el-tooltip>
      <el-tooltip content="自定義路徑" placement="top">
        <em
          class="el-icon-edit cursor-pointer"
          @click="showInput"
        />
      </el-tooltip>
    </div>
    <el-input
      v-else
      v-model="model"
      placeholder="請輸入..."
      @blur="init"
    >
      <i
        v-if="!isSave"
        slot="suffix"
        class="el-icon-circle-plus cursor-pointer button"
        :style="getStyle('menuActiveText')"
        @click="isSave = true"
      />
      <i
        v-else
        slot="suffix"
        class="el-icon-error cursor-pointer button"
        :style="getStyle('danger')"
        @click="init"
      />
    </el-input>
  </div>
</template>

<script>
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
      model: '',
      isShowInput: false,
      isSave: false
    }
  },
  methods: {
    showInput() {
      this.isShowInput = true
    },
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return {
        color
      }
    },
    init() {
      this.isShowInput = false
      this.isSave = false
      this.model = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
  line-height: 40px;
  font-size: 20px;
}
</style>
