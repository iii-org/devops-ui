<template>
  <div>
    <div class="text-subtitle-2 mt-2 mb-3">{{ selectedPage }}</div>
    <editor ref="mdEditor" initial-edit-type="wysiwyg" />
  </div>
</template>

<script>
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/vue-editor'

export default {
  name: 'IssueNotesEditor',
  components: {
    editor: Editor
  },
  props: {
    page: {
      type: String,
      default: 'ProjectIssueDetail'
    }
  },
  computed: {
    selectedPage () {
      return this.page === 'ProjectIssueDetail' ? this.$t('Issue.Notes') : this.$t('Issue.DeleteIssueReason')
    }
  }
}
</script>
