<template>
  <div>
    <el-table
      :data="excalidrawData"
      fit
    >
      <el-table-column
        :label="$t('general.Index')"
        type="index"
        align="center"
        width="100"
      />
      <el-table-column
        :label="$t('Excalidraw.Name')"
        prop="name"
        align="center"
      >
        <template slot-scope="scope">
          <el-link
            slot="reference"
            type="primary"
            style="font-size: 16px"
            @click="handleEdit(scope.row)"
          >
            {{ scope.row.name }}
          </el-link>
          <el-link
            size="small"
            :underline="false"
            @click="handleEdit(scope.row)"
          >
            <em class="ri-external-link-line" />
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('Issue.project')"
        prop="project.display"
        align="center"
      />
      <el-table-column
        :label="$t('general.Creator')"
        prop="operator.name"
        align="center"
      />
      <el-table-column
        :label="$t('general.Actions')"
        align="center"
        width="240"
      >
        <template slot-scope="scope">
          <el-button
            :loading="listLoading"
            size="mini"
            class="buttonPrimaryReverse"
            @click="handleUnlink(scope.row)"
          >
            {{ $t('Issue.Unlink') }}
          </el-button>
          <el-popconfirm
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            :title="$t('Notify.confirmDelete')"
            @confirm="handleDelete(scope.row)"
          >
            <el-button
              slot="reference"
              :loading="listLoading"
              size="mini"
              type="danger"
            >
              <em class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <EditBoardDialog
      ref="EditBoardDialog"
      @update="fetchData"
    />
  </div>
</template>

<script>
import EditBoardDialog from '@/views/WhiteBoard/components/EditBoardDialog'
import { updateExcalidraw, deleteExcalidraw } from '@/api_v2/excalidraw'

export default {
  name: 'WhiteBoardTable',
  components: { EditBoardDialog },
  props: {
    issueId: {
      type: Number,
      default: 0
    },
    excalidrawData: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '250px'
    }
  },
  data() {
    return {
      listLoading: false
    }
  },
  methods: {
    async fetchData() {
      this.$emit('update')
    },
    handleEdit(row) {
      this.$refs.EditBoardDialog.isCollapse = ['2']
      this.$refs.EditBoardDialog.row = row
      this.$nextTick(() => {
        this.$refs.EditBoardDialog.dialogVisible = true
      })
    },
    async handleUnlink(row) {
      this.listLoading = true
      try {
        const sendData = new FormData()
        sendData.append('name', row.name)
        sendData.append('issue_ids', row.issue_ids.filter((item) => {
          return item !== this.issueId
        }))
        await updateExcalidraw(row.id, sendData)
        const message = this.$t('Notify.Updated')
        this.showSuccessMessage(message)
        this.fetchData()
      } catch (error) {
        console.error(error)
        this.$emit('handleError')
      } finally {
        this.listLoading = false
      }
    },
    async handleDelete(row) {
      this.listLoading = true
      try {
        await deleteExcalidraw(row.id)
        const message = this.$t('Notify.Deleted')
        this.showSuccessMessage(message)
        this.fetchData()
      } catch (error) {
        console.error(error)
        this.handleError()
      } finally {
        this.listLoading = false
      }
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    }
  }
}
</script>
