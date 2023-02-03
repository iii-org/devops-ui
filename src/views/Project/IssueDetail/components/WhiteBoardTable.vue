<template>
  <div>
    <el-table
      v-loading="listLoading"
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
          <el-tooltip
            :content="$t('Issue.Unlink')"
            effect="dark"
            placement="bottom"
          >
            <el-button
              circle
              size="mini"
              type="primary"
              icon="el-icon-close"
              class="buttonPrimaryReverse"
              @click="handleUnlink(scope.row)"
            />
          </el-tooltip>
          <el-popconfirm
            :title="$t('Notify.confirmDelete')"
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon-color="red"
            icon="el-icon-info"
            @confirm="handleDelete(scope.row)"
          >
            <el-tooltip
              slot="reference"
              :content="$t('general.Delete')"
              effect="dark"
              placement="bottom"
            >
              <el-button
                circle
                size="mini"
                type="danger"
                icon="el-icon-delete"
              />
            </el-tooltip>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <EditBoardDialog
      v-if="EditBoardDialogVisible"
      :dialog-visible.sync="EditBoardDialogVisible"
      :row.sync="row"
      @update="$emit('update')"
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
      listLoading: false,
      EditBoardDialogVisible: false,
      row: {}
    }
  },
  methods: {
    handleEdit(row) {
      this.row = row
      this.row.collapse = ['2']
      this.EditBoardDialogVisible = true
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
        this.$emit('update')
      } catch (error) {
        console.error(error)
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
        this.$emit('update')
      } catch (error) {
        console.error(error)
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
