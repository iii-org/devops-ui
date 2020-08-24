<template>
  <el-dialog
    :title="dialogTitle"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Type" label-width="100px">
            <el-select v-model="testValueType" style="width:100%">
              <el-option
                v-for="item in testValueTypeList"
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
          <el-form-item label="Key" label-width="100px">
            <el-input v-model="testValueKey" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Value" label-width="100px">
            <el-input v-model="testValue" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Location" label-width="100px">
            <el-select v-model="testValueLocation" style="width:100%">
              <el-option
                v-for="item in testValueLocationList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
      default: 'Add Test'
    },
    testValueId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      testValueTypeList: [{
        value: 'Request',
        label: 'Request'
      }, {
        value: 'Response',
        label: 'Response'
      }],
      testValueLocationList: [{
        value: 'Header',
        label: 'Header'
      }, {
        value: 'Body',
        label: 'Body'
      }],
      testValueType: '',
      testValueKey: '',
      testValue: '',
      testValueLocation: ''
    }
  },
  updated() {
    if (this.testValueId === 0) {
      this.testValueType = ''
      this.testValueKey = ''
      this.testValue = ''
      this.testValueLocation = ''
    } else {
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      this.testValueType = 'Request'
      this.testValueKey = 'Content-Type'
      this.testValue = 'application/json'
      this.testValueLocation = 'header'
      this.isSuccess = false
    },
    handleClose() {
      this.$emit('testValue-dialog-visible', false)
    }
  }
}
</script>
