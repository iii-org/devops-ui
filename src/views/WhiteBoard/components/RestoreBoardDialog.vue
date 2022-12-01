<template>
  <el-dialog
    :title="row.name + ' - ' + $t('Excalidraw.HistoricalRecord')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :before-close="onDialogClosed"
  >
    <el-table
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="$t('Loading')"
      fit
    >
      <el-table-column
        type="index"
        align="center"
        :label="$t('general.Index')"
        width="100"
      />
      <el-table-column
        align="center"
        :label="$t('general.Updater')"
        prop="user_name"
      />
      <el-table-column-time
        :label="$t('Excalidraw.AutoSavedTime')"
        prop="updated_at"
      />
      <el-table-column
        align="center"
        :label="$t('Excalidraw.Size')"
        prop="size"
      >
        <template slot-scope="scope">
          {{ scope.row.size + 'k' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('general.Actions')"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="buttonSecondaryReverse"
            icon="el-icon-refresh-left"
            @click="handleRestore(scope.row)"
          >
            {{ $t('general.Restore') }}
          </el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
  </el-dialog>
</template>

<script>
import { BasicData } from '@/mixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { getExcalidrawHistory, restoreExcalidrawHistory } from '@/api_v2/excalidraw'

export default {
  name: 'RestoreBoardDialog',
  components: { ElTableColumnTime },
  mixins: [BasicData],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    async fetchData() {
      return (await getExcalidrawHistory(this.row.id)).data
    },
    async handleRestore(row) {
      this.$msgbox({
        title: this.$t('general.caution'),
        type: 'warning',
        message: this.$t('Notify.confirmRestore'),
        showCancelButton: true,
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel')
      }).then(async() => {
        this.listLoading = true
        try {
          await restoreExcalidrawHistory(row.id)
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Restored'),
            type: 'success'
          })
          this.listLoading = false
          this.$emit('update')
        } catch (error) {
          console.error(error)
          this.$emit('handleError')
        } finally {
          this.onDialogClosed()
        }
      })
    },
    onDialogClosed() {
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>
