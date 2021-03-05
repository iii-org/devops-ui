<script>
import { updateIssue } from '@/api/issue'
import EditorMD from '@/components/Editormd'

export default {
  name: 'CommentTab',
  components: {
    EditorMD
  },

  props: {
    issueComment: {
      type: Array,
      default: () => []
    },
    issueId: {
      type: Number,
      default: 0
    }
  },

  data: () => ({
    issueNote: '',
    issueNoteNew: '',
    commentDialogVisible: false
  }),

  methods: {
    showAddComment() {
      this.issueNote = ''
      this.commentDialogVisible = true
    },

    emitGetEditorData(value) {
      this.issueNote = value
    },

    async handleAddComment() {
      await updateIssue(this.issueId, { notes: this.issueNote })
      this.commentDialogVisible = false
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
      this.$emit('updated')
    }
  }
}
</script>

<template>
  <div>
    <el-button type="primary" @click="showAddComment">{{ $t('Issue.AddComment') }}</el-button>

    <el-table
      :data="issueComment"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :header-cell-style="{ background: '#fafafa', color: 'rgba(0,0,0,.85)' }"
      class="mt-2"
    >
      <el-table-column :label="$t('Issue.Comment')" min-width="200">
        <template slot-scope="scope">
          <!-- <div v-html="scope.row.comment" /> -->
          <VueShowdown :markdown="scope.row.comment" />
        </template>
      </el-table-column>

      <el-table-column :label="$t('Issue.Author')" width="130" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.comment_author">
            {{ scope.row.comment_author }}
          </span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('general.CreateTime')" width="180" align="center">
        <template slot-scope="scope">
          {{ new Date(scope.row.comment_at).toLocaleString() }}
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="$t('Issue.AddComment')"
      :visible="commentDialogVisible"
      width="70%"
      :close-on-click-modal="false"
      @close="commentDialogVisible = false"
    >
      <template>
        <EditorMD
          v-if="commentDialogVisible"
          id="editormd"
          :content="issueNoteNew"
          @get-editor-data="emitGetEditorData"
        />
      </template>

      <span slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">{{ $t('general.Cancel') }}</el-button>

        <el-button type="primary" @click="handleAddComment">{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
