<template>
  <div>
    <div class="text-sm mt-2 mb-3">{{ $t('Issue.Notes') }}</div>
    <Editor
      ref="mdEditor"
      initial-edit-type="wysiwyg"
      :options="editorOptions"
      height="18rem"
      @change="onChange"
    />
  </div>
</template>

<script>
// import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/vue-editor'
import '@toast-ui/editor/dist/i18n/zh-tw'
import { mapGetters } from 'vuex'

export default {
  name: 'IssueNotesEditor',
  components: {
    Editor
  },
  computed: {
    ...mapGetters(['language']),
    editorOptions() {
      return {
        minHeight: '100px',
        language: this.language,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike', 'image', 'link'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          ['scrollSync']
        ]
      }
    }
  },
  methods: {
    onChange(event) {
      this.$emit('change', event)
    }
  }
}
</script>
