<template>
  <el-dialog
    title="Edit Issue"
    :visible="dialogVisible"
    width="30%"
    @close="handleClose"
  >
    <el-form ref="form" label-width="80px">
      <el-form-item label="Status">
        <el-select 
          v-model="issueStatus" 
          style="width:100%"
        >
          <el-option
            v-for="item in issueStatusList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Tracker">
        <el-select 
          v-model="issueTracker" 
          style="width:100%"
        >
          <el-option
            v-for="item in issueTrackerList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Priority">
        <el-select v-model="issuePriority" style="width:100%">
          <el-option
            v-for="item in issuePriorityList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Date">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="Start" v-model="issueStartDate" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-date-picker type="date" placeholder="Due" v-model="issueDueDate" style="width: 100%;"></el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="Process">
        <el-input v-model="issueDoneRatio" />
      </el-form-item>
      <el-form-item label="Desc.">
        <el-input type="textarea" v-model="issueDescription"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getIssueStatus, getIssueTracker, getIssuePriority, updateIssue } from '@/api/issue'
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    issueDoneRatioVal: {
      type: Number,
      default: 0
    },
    issueStatusVal: {
      type: Number,
      default: 0
    },
    issueTrackerVal: {
      type: Number,
      default: 0
    },
    issuePriorityVal: {
      type: Number,
      default: 0
    },
    issueStartDateVal: {
      type: String,
      default: ''
    },
    issueDueDateVal: {
      type: String,
      default: ''
    },
    issueDescriptionVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      issueStatus: 0,
      issueTracker: 0,
      issuePriority: 0,
      issueStartDate: null,
      issueDueDate: null,
      issueDescription: "",
      issueDoneRatio: 0,
      issueStatusList: [{'id':1, 'name': 'status'}],
      issueTrackerList: [{'id':1, 'name': 'status'}],
      issuePriorityList: [{'id':1, 'name': 'status'}]
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Promise.all([
        getIssueStatus(), 
        getIssueTracker(), 
        getIssuePriority()
      ]).then(res => {
        this.issueStatusList = res[0].data
        this.issueTrackerList = res[1].data
        this.issuePriorityList = res[2].data
        this.issueStatus = this.issueStatusVal
        this.issueTracker = this.issueTrackerVal
        this.issuePriority = this.issuePriorityVal
        this.issueStartDate = this.issueStartDateVal
        this.issueDueDate = this.issueDueDateVal
        this.issueDoneRatio = this.issueDoneRatioVal
        this.issueDescription = this.issueDescriptionVal
        this.listLoading = false
      });
    },
    handleClose() {
      this.$emit('issue-dialog-visible', false)
    },
    handleSubmit() {
      const data = {
        "priority_id": this.issuePriority,
        "description": this.issueDescription,
        "tracker_id": this.issueTracker,
        "status_id": this.issueStatus,
        "done_ratio": this.issueDoneRatio,
        "start_date": new Date(this.issueStartDate).toISOString(),
        "due_date": new Date(this.issueDoneRatio).toISOString()
      }
      this.$emit('update-issue', data)
    }
  }
}
</script>
