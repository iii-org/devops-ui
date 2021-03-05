<script>
import { mapGetters } from 'vuex'
import ParamDialog from './ParamDialog'
import { addParameterByIssue, deleteParameter } from '@/api/issueParameter'

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

  computed: {
    ...mapGetters(['projectSelectedId'])
  },

  methods: {
    showParamDialog(param, title) {
      this.editParamId = param === '' ? 0 : param.id
      this.dialogTitle = title
      this.paramDialogVisible = true
    },
    async saveParameter(data) {
      data['project_id'] = this.projectSelectedId
      await addParameterByIssue(this.issueId, data)
      this.paramDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })

      this.$emit('updated')
    },
    async deleteParameter(row) {
      await deleteParameter(row.id)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
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
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
      class="mt-2"
    >
      <el-table-column :label="$t('general.Name')" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.name }}
          <!--<span style="color: #409EFF;cursor: pointer;" @click="showParamDialog(scope.row, 'Edit Parameter')">
                {{ scope.row.name }}
              </span>-->
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Type')" width="100">
        <template slot-scope="scope">
          {{ scope.row.parameter_type }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Description')" min-width="130">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('Issue.Limit')" width="80">
        <template slot-scope="scope">
          {{ scope.row.limitation }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('Issue.Length')" width="90">
        <template slot-scope="scope">
          {{ scope.row.length }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.Actions')" width="110" align="center">
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
