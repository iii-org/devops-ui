<script>
import ParamDialog from './ParamDialog'
import { addParameterByIssue, deleteParameter } from '@/api/issueParameter'
import { Message } from 'element-ui'

export default {
  name: 'ParameterTab',
  components: {
    ParamDialog
  },

  props: {
    issueId: {
      type: Number,
      default: 0
    },
    issueParameter: {
      type: Array,
      default: () => []
    }
  },

  data: () => ({
    dialogTitle: '',
    editParamId: 0,
    paramDialogVisible: false
  }),

  methods: {
    showParamDialog(param, title) {
      this.editParamId = param === '' ? 0 : param.id
      this.dialogTitle = title
      this.paramDialogVisible = true
    },
    async saveParameter(data) {
      if (this.projectId > 0) {
        data['project_id'] = this.projectId
      }
      await addParameterByIssue(this.issueId, data)
      this.paramDialogVisible = false
      Message({
        message: 'add successful',
        type: 'success',
        duration: 1 * 1000
      })
      this.$emit('updated')
    },
    async deleteParameter(row) {
      await deleteParameter(row.id)
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
    <el-button type="primary" @click="showParamDialog('', 'AddParameter')">{{ $t('Issue.AddParameter') }}</el-button>

    <el-table
      :data="issueParameter"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
      style="margin-top: 10px"
    >
      <el-table-column :label="$t('general.Name')">
        <template slot-scope="scope">
          {{ scope.row.name }}
          <!--<span style="color: #409EFF;cursor: pointer;" @click="showParamDialog(scope.row, 'Edit Parameter')">
                {{ scope.row.name }}
              </span>-->
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Type')">
        <template slot-scope="scope">
          {{ scope.row.parameter_type }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Description')">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('Issue.Limit')">
        <template slot-scope="scope">
          {{ scope.row.limitation }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('Issue.Length')">
        <template slot-scope="scope">
          {{ scope.row.length }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Actions')" width="120" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="deleteParameter(scope.row)">{{
            $t('general.Delete')
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <param-dialog
      :dialog-title="dialogTitle"
      :param-id="editParamId"
      :dialog-visible="paramDialogVisible"
      :save-data="saveParameter"
      @param-dialog-visible="paramDialogVisible = false"
    />
  </div>
</template>
