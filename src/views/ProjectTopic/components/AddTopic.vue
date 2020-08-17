<template>
  <el-dialog
    title="Add Topic"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="20%" :label-position="right">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Name" label-width="100px">
            <el-input v-model="topicName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Assignee" label-width="100px">
            <el-select v-model="topicAssignee" style="width:100%">
              <el-option
                v-for="item in topicAssigneeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Version" label-width="100px">
            <el-select v-model="topicVersion" style="width:100%">
              <el-option
                v-for="item in topicVersionList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Type" label-width="100px">
            <el-select v-model="topicType" style="width:100%">
              <el-option
                v-for="item in topicTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status" label-width="100px">
            <el-select v-model="topicStatus" style="width:100%">
              <el-option
                v-for="item in topicStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Priority" label-width="100px">
            <el-select v-model="topicPriority" style="width:100%">
              <el-option
                v-for="item in topicPriorityList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Estimate" label-width="100px">
            <el-input v-model="topicEstimate" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Process" label-width="100px">
            <el-input v-model="topicProcess" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Start" label-width="100px">
            <el-date-picker type="date" placeholder="Select Date" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="End" label-width="100px">
            <el-date-picker type="date" placeholder="Select Date" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="Desc." label-width="100px">
            <el-input type="textarea" />
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
      topicAssigneeList: [{
        value: '王曉明',
        label: '王曉明'
      }, {
        value: '陳聰明',
        label: '陳聰明'
      }],
      topicTypeList: [{
        value: '任務',
        label: '任務'
      }, {
        value: '問題',
        label: '問題'
      }],
      topicVersionList: [{
        value: '1.0',
        label: '1.0'
      }, {
        value: '1.1',
        label: '1.1'
      }],
      topicStatusList: [{
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
      topicPriorityList: [{
        value: '高',
        label: '高'
      }, {
        value: '中',
        label: '中'
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
      this.$emit('add-topic-visible', false)
    }
  }
}
</script>
<style lang="scss">
  .el-upload-dragger {
    height: 50px;
  }
</style>
