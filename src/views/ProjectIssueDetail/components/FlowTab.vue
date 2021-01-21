<script>
import FlowDialog from './FlowDialog'
import { addFlowByIssue, deleteFlow } from '@/api/issueFlow'
import { Message } from 'element-ui'

export default {
  name: 'FlowTab',
  components: {
    FlowDialog
  },

  props: {
    issueId: {
      type: Number,
      default: 0
    },
    issueFlow: {
      type: Array,
      default: () => []
    }
  },

  data: () => ({
    dialogTitle: '',
    editFlowId: 0,
    flowDialogVisible: false
  }),

  methods: {
    showFlowDialog(flow, title) {
      this.editFlowId = flow === '' ? 0 : flow.id
      this.dialogTitle = title
      this.flowDialogVisible = true
    },

    async saveFlow(data) {
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      await addFlowByIssue(this.issueId, data)
      this.flowDialogVisible = false
      Message({
        message: 'add successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.$emit('updated')
    },

    async deleteFlow(row) {
      await deleteFlow(row.id)
      Message({
        message: 'delete successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.$emit('updated')
    }
  }
}
</script>

<template>
  <div>
    <el-button type="primary" @click="showFlowDialog('', 'AddFlow')">{{ $t('Issue.AddFlow') }}</el-button>

    <el-table
      :data="issueFlow"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
      class="mt-2"
    >
      <el-table-column :label="$t('Issue.FlowId')">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Name')">
        <template slot-scope="scope">
          <!--<span style="color: #409EFF;cursor: pointer;" @click="showFlowDialog(scope.row, 'Edit Flow')">
                {{ scope.row.name }}
              </span>-->
          {{ scope.row.name }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Type')">
        <template slot-scope="scope">
          {{ scope.row.type_name }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Description')">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Actions')" width="120" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="deleteFlow(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <flow-dialog
      :dialog-title="dialogTitle"
      :flow-id="editFlowId"
      :dialog-visible="flowDialogVisible"
      :save-data="saveFlow"
      @flow-dialog-visible="flowDialogVisible = false"
    />
  </div>
</template>
