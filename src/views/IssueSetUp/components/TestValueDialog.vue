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
            <el-select v-model="valueForm.type_id" style="width:100%">
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
            <el-input v-model="valueForm.key" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Value" label-width="100px">
            <el-input v-model="valueForm.value" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Location" label-width="100px">
            <el-select v-model="valueForm.location_id" style="width:100%">
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
      <el-button type="primary" @click="handleSave">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getTestValueType, getTestValueLocation } from '@/api/issueTestValue'
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
    },
    saveData: Function
  },
  data() {
    return {
      valueForm: {
        key: '',
        value: '',
        location_id: '',
        type_id: ''
      },
      testValueTypeList: [],
      testValueLocationList: []
    }
  },
  // updated() {
  //   if (this.testValueId === 0) {
  //     this.testValueType = ''
  //     this.testValueKey = ''
  //     this.testValue = ''
  //     this.testValueLocation = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const valueTypeRes = await getTestValueType()
      const valueLocationRes = await getTestValueLocation()
      this.testValueTypeList = valueTypeRes.data.map(item => {
        return { label: item.type_name, value: item.type_id }
      })
      this.testValueLocationList = valueLocationRes.data.map(item => {
        return { label: item.type_name, value: item.location_id }
      })
      // this.testValueType = 'Request'
      // this.testValueKey = 'Content-Type'
      // this.testValue = 'application/json'
      // this.testValueLocation = 'header'
      // this.isSuccess = false
    },
    handleClose() {
      this.$emit('testValue-dialog-visible', false)
    },
    handleSave() {
      this.saveData(this.valueForm)
      console.log(this.valueForm)
    }
  }
}
</script>
