<template>
  <el-dialog
    title="Add Document"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%">
      <el-form-item label="Name">
        <el-input v-model="docName" />
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="docDesc" />
      </el-form-item>
      <el-form-item label="Process">
        <el-input v-model="docProcess" />
      </el-form-item>
      <el-form-item label="Type">
        <el-select v-model="docType" style="width:100%">
          <el-option
            v-for="item in docTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Version">
        <el-select v-model="docVersion" style="width:100%">
          <el-option
            v-for="item in docVersionList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="docStatus" style="width:100%">
          <el-option
            v-for="item in docStatusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Upload File">
        <el-upload
          class="upload-demo"
          action="https://jsonplaceholder.typicode.com/posts/"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          multiple
          :limit="3"
          :on-exceed="handleExceed"
          :file-list="fileList">
          <el-button size="small" type="primary">Click Upload</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleClose">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIssueStatus } from '@/api/issue'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      docTypeList: [{
        value: '需求訪談',
        label: '需求訪談'
      }, {
        value: '手冊',
        label: '手冊'
      }],
      docVersionList: [{
        value: '1.0',
        label: '1.0'
      }, {
        value: '1.1',
        label: '1.1'
      }],
      docStatusList: [{
        value: '新建立',
        label: '新建立'
      }, {
        value: '已完結',
        label: '已完結'
      }, {
        value: '測試中',
        label: '測試中'
      }, {
        value: '已完成',
        label: '已完成'
      }, {
        value: '開發中',
        label: '開發中'
      }],
      docName: '',
      docDesc: '',
      docType: '',
      docVersion: '',
      docStatus: '',
      docProcess: ''
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getIssueStatus().then(response => {
        this.issue_status_list = response.data
        this.listLoading = false
      })
    },
    handleClose() {
      this.$emit('add-document-visible', false)
    }
  }
}
</script>
<style lang="scss">
  .el-upload-dragger {
    height: 50px;
  }
</style>