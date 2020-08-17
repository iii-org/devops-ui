<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-row v-if="flowId != 0">
        <el-col :span="24">
          <el-form-item label="Step Order" label-width="100px">
            <el-input v-model="stepOrder" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Step Name" label-width="100px">
            <el-input v-model="stepName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Step Type" label-width="100px">
            <el-select v-model="stepType" style="width:100%">
              <el-option
                v-for="item in stepTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Step Desc." label-width="100px">
            <el-input v-model="stepDesc" type="textarea" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleClose">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>

export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: 'Add Flow'
    },
    flowId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      stepTypeList: [{
        value: 'Given',
        label: 'Given'
      }, {
        value: 'When',
        label: 'When'
      }, {
        value: 'Then',
        label: 'Then'
      }, {
        value: 'And',
        label: 'And'
      }, {
        value: 'But',
        label: 'But'
      }],
      stepOrder: 0,
      stepType: '',
      stepName: '',
      stepDesc: ''
    }
  },
  updated() {
    if (this.flowId === 0) {
      this.stepType = ''
      this.stepName = ''
      this.stepDesc = ''
    } else {
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      this.stepOrder = 1
      this.stepType = '設定帳號'
      this.stepName = 'GIVEN'
      this.stepDesc = '設定帳號參數'
    },
    handleClose() {
      this.$emit('flow-dialog-visible', false)
    }
  }
}
</script>
