<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-row v-if="paramId != 0">
        <el-col :span="24">
          <el-form-item label="Order" label-width="100px">
            <el-input v-model="paramOrder" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Name" label-width="100px">
            <el-input v-model="paramName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Type" label-width="100px">
            <el-select v-model="paramType" style="width:100%">
              <el-option
                v-for="item in paramTypeList"
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
          <el-form-item label="Length" label-width="100px">
            <el-input v-model="paramLength" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Limit" label-width="100px">
            <el-input v-model="paramLimit" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Desc." label-width="100px">
            <el-input v-model="paramDesc" type="textarea" />
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
      default: 'Add Parameter'
    },
    paramId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      paramTypeList: [{
        value: '文字',
        label: '文字'
      }, {
        value: '數字',
        label: '數字'
      }],
      paramOrder: '',
      paramType: '',
      paramName: '',
      paramLength: '',
      paramLimit: '',
      paramDesc: ''
    }
  },
  updated() {
    if (this.paramId === 0) {
      this.paramType = ''
      this.paramName = ''
      this.paramDesc = ''
      this.paramLength = ''
      this.paramLimit = ''
    } else {
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      this.paramOrder = 1
      this.paramType = '文字'
      this.stepName = '帳號'
      this.paramDesc = ''
      this.paramLength = 10
      this.paramLimit = '09[0-9]'
    },
    handleClose() {
      this.$emit('param-dialog-visible', false)
    }
  }
}
</script>
