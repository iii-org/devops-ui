<template>
  <div>
    <div class="text-subtitle-2 mb-5">{{ $t('Issue.Notes') }}</div>
    <editor id="md_editor" ref="mdEditor" initial-edit-type="wysiwyg" />
  </div>
</template>

<script>
// import { updateIssue } from '@/api/issue'
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/vue-editor'

export default {
  name: 'IssueNotes',
  components: {
    editor: Editor
  },
  methods: {
    // handleAddComment() {
    //   updateIssue(this.issueId, { notes: this.$refs.mdEditor.invoke('getMarkdown') })
    //     .then(res => console.log(res))
    //     .catch(err => {
    //       this.$message({
    //         title: this.$t('general.Error'),
    //         message: err,
    //         type: 'error'
    //       })
    //     })
    // }
  }
}
</script>
