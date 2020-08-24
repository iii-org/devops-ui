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
          <el-form-item label="API Name" label-width="100px">
            <el-input v-model="testAPIName" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="API Method" label-width="100px">
            <el-select v-model="testAPIMethod" style="width:100%">
              <el-option
                v-for="item in testAPIMethodList"
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
          <el-form-item label="API URL" label-width="100px">
            <el-input v-model="testAPIURL" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Desc." label-width="100px">
            <el-input v-model="testAPIDesc" type="textarea" />
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
    testId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      testAPIMethodList: [{
        value: 'GET',
        label: 'GET'
      }, {
        value: 'POST',
        label: 'POST'
      }, {
        value: 'PUT',
        label: 'PUT'
      }, {
        value: 'DELETE',
        label: 'DELETE'
      }],
      testAPIName: '',
      testAPIMethod: '',
      testAPIURL: '',
      testAPIDesc: ''
    }
  },
  updated() {
    if (this.testId === 0) {
      this.testAPIName = ''
      this.testAPIMethod = ''
      this.testAPIURL = ''
      this.testAPIDesc = ''
    } else {
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      this.testAPIName = '帳號登入'
      this.testAPIMethod = 'GET'
      this.testAPIURL = '/user/login'
      this.stepName = '輸入帳號密碼取得Token'
    },
    handleClose() {
      this.$emit('test-dialog-visible', false)
    }
  }
}
</script>
