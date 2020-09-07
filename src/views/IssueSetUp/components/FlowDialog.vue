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
            <el-input v-model="flowForm.name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Step Type" label-width="100px">
            <el-select v-model="flowForm.type_id" style="width:100%">
              <el-option
                v-for="item in flowTypeList"
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
            <el-input v-model="flowForm.description" type="textarea" />
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
import { getFlowType } from '@/api/issueFlow'
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
    },
    saveData: Function
  },
  data() {
    return {
      flowTypeList: [],
      stepOrder: 0,
      flowForm: {
        name: '',
        type_id: '',
        description: ''
      }
    }
  },
  // updated() {
  //   if (this.flowId === 0) {
  //     this.stepType = ''
  //     this.stepName = ''
  //     this.stepDesc = ''
  //   } else {
  //     this.fetchData()
  //   }
  // },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getFlowType()
      this.flowTypeList = res.data.map(item => {
        return { label: item.name, value: item.flow_type_id }
      })
    },
    handleClose() {
      this.$emit('flow-dialog-visible', false)
    },
    handleSave() {
      this.saveData(this.flowForm)
      console.log(this.flowForm)
    }
  }
}
</script>
