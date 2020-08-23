<template>
  <el-dialog
    title="Add User"
    :visible="dialogVisible"
    width="60%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Account" label-width="140px" >
            <el-input v-model="account" v-if="userId === 0"/>
            <span v-if="userId !== 0"> {{account}} </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Name" label-width="140px">
            <el-input v-model="name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Password" label-width="140px">
            <el-input v-model="password" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Repeat Password" label-width="140px">
            <el-input v-model="repeat_password" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Email" label-width="140px">
            <el-input v-model="email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Phone" label-width="140px">
            <el-input v-model="phone" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Language" label-width="140px">
            <el-select v-model="language" style="width:100%">
              <el-option
                v-for="item in languageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Org." label-width="140px">
            <el-input type="textarea" v-model="organization"/>
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
    userId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      languageList: [{
        value: '繁體中文',
        label: '繁體中文'
      }, {
        value: '英文',
        label: '英文'
      }],
      account: '',
      name: '',
      password: '',
      repeat_password: '',
      email: '',
      phone: '',
      language: '繁體中文',
      organization: ''
    }
  },
  updated() {
    console.log(this.userId)
    if (this.userId === 0) {
      this.account = ''
      this.name = ''
      this.email = ''
      this.phone = ''
      this.language = '繁體中文'
      this.organization = ''
    } else {
      this.listLoading = true
      this.fetchData()
    }
  },
  methods: {
    fetchData() {
      this.account = 'david'
      this.name = 'David Huang'
      this.email = 'david@iii.org.tw'
      this.phone = '02-8654936'
      this.language = '繁體中文'
      this.organization = '智慧系統研究所/物聯雲平台中心/交通分析組/工程師'
      this.listLoading = false
    },
    handleClose() {
      this.$emit('add-user-visible', false)
    }
  }
}
</script>
