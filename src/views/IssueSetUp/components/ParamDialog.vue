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
            <el-input v-model="parameterForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Type" label-width="100px">
            <el-select v-model="parameterForm.parameter_type_id" style="width:100%">
              <el-option
                v-for="item in parameterTypeList"
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
            <el-input v-model="parameterForm.length" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Limit" label-width="100px">
            <el-input v-model="parameterForm.limitation" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Desc." label-width="100px">
            <el-input v-model="parameterForm.description" type="textarea" />
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
import { getParameterType } from '@/api/issueParameter'
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
    },
    saveData: Function
  },
  data() {
    return {
      parameterTypeList: [{
        value: '文字',
        label: '文字'
      }, {
        value: '數字',
        label: '數字'
      }],
      parameterForm: {
        name: '',
        parameter_type_id: '',
        description: '',
        length: 0,
        limitation: ''
      },
      paramOrder: '',
      paramType: '',
      paramName: '',
      paramLength: '',
      paramLimit: '',
      paramDesc: ''
    }
  },
  // updated() {
  //   if (this.paramId === 0) {
  //     this.paramType = ''
  //     this.paramName = ''
  //     this.paramDesc = ''
  //     this.paramLength = ''
  //     this.paramLimit = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getParameterType()
      this.parameterTypeList = res.data.map(item => {
        return { label: item.name, value: item.parameter_type_id }
      })
    },
    handleClose() {
      this.$emit('param-dialog-visible', false)
    },
    handleSave() {
      this.saveData(this.parameterForm)
      console.log(this.parameterForm)
    }
  }
}
</script>
