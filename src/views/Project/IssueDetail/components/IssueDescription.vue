<template>
  <el-row>
    <el-col>
      <el-row class="text-sm mt-2 mb-3">
        {{ $t('Issue.Description') }}
      </el-row>
      <el-col v-if="edit">
        <p>{{ $t('Issue.ResetESCTip') }}</p>
        <Editor
          ref="mdEditor"
          initial-edit-type="wysiwyg"
          :initial-value="value"
          :options="editorOptions"
          height="auto"
          @change="onChange"
          @keydown.meta.esc.native="cancelInput"
        />
      </el-col>
      <el-col v-else>
        <Viewer :key="componentKey" :initial-value="value" />
        <el-button
          :class="isButtonDisabled?'buttonInfoReverse':'buttonSecondaryReverse'"
          :disabled="isButtonDisabled"
          icon="el-icon-edit"
          size="mini"
          @click="edit=true"
        >
          {{ $t('general.Edit') }}
        </el-button>
      </el-col>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import '@toast-ui/editor/dist/i18n/zh-tw'
import { Editor, Viewer } from '@toast-ui/vue-editor'

export default {
  name: 'IssueDescription',
  components: { Editor, Viewer },
  props: {
    value: {
      type: String,
      default: null
    },
    oldValue: {
      type: String,
      default: null
    },
    issueId: {
      type: [String, Number],
      default: null
    },
    isButtonDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      edit: false,
      componentKey: 0
    }
  },
  computed: {
    ...mapGetters(['language']),
    editorOptions() {
      return {
        minHeight: '100px',
        language: this.language
      }
    }
  },
  watch: {
    value(newVal) {
      this.$refs.mdEditor.invoke('setMarkdown', newVal)
      this.componentKey += 1
    },
    oldValue() {
      this.edit = !this.issueId
    }
  },
  mounted() {
    if (!this.issueId || !this.oldValue || this.oldValue === '') {
      this.edit = true
    }
  },
  methods: {
    onChange() {
      this.$emit('input', this.$refs.mdEditor.invoke('getMarkdown'))
    },
    cancelInput() {
      this.$refs.mdEditor.invoke('setMarkdown', this.oldValue)
      this.edit = !this.issueId
    }
  }
}
</script>

<style scoped>
.text-wrapper {
  white-space: pre-wrap;
}
</style>
