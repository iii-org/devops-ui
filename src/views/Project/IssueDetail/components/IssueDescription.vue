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
          initial-edit-type="markdown"
          :initial-value="value"
          :options="editorOptions"
          height="18rem"
          @change="onChange"
          @keyup="onKeyup"
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
import { getProjectAssignable } from '@/api/projects'
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
    },
    projectId: {
      type: Number,
      default: 0
    },
    mentionList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      edit: false,
      componentKey: 0,
      assigned_to: [],
      tagList: []
    }
  },
  computed: {
    ...mapGetters(['language']),
    maxLength() {
      return this.assigned_to.reduce((prev, item) => {
        return Math.max(prev, item.name.length)
      }, 0)
    },
    editorOptions() {
      return {
        minHeight: '100px',
        language: this.language,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          ['scrollSync']
        ],
        widgetRules: [
          {
            rule: /[@＠].*&nbsp/,
            toDOM(text) {
              const rule = /[@＠].*&nbsp/
              const matched = text.match(rule)
              const span = document.createElement('span')
              span.innerHTML = `<a style="text-decoration: none; color: #4b96e6;">${matched[0]}</a>`
              return span
            }
          }
        ]
      }
    }
  },
  watch: {
    value() {
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
    this.getUserList()
  },
  methods: {
    async getUserList() {
      this.assigned_to = (await getProjectAssignable(this.projectId)).data.user_list
    },
    onChange() {
      const notes = this.$refs.mdEditor.invoke('getMarkdown')
      this.tagList = this.tagList.filter((tag) => notes.includes(tag.name))
      this.$emit('update:mentionList', this.tagList.map((tag) => tag.id))
      this.$emit('input', this.$refs.mdEditor.invoke('getMarkdown'))
    },
    onKeyup(editorType, event) {
      if (editorType === 'markdown' && event.key === '@' || event.key === '＠') {
        const editor = this.$refs.mdEditor.editor
        const ul = document.createElement('ul')
        ul.setAttribute('class', 'm-3 p-3')
        ul.setAttribute('style', `
        list-style-type: none;
          max-height: 150px;
          overflow-y: auto;
          background: #fff;
          border: 0.5px solid #ccc;
          border-radius: 16px;
        `)
        this.assigned_to.forEach((user, index) => {
          if (index === 0) ul.innerHTML = `<li >${user.name}</li>`
          else ul.innerHTML += `<li class="mt-2">${user.name}</li>`
        })
        editor.addWidget(ul, 'top')
        ul.addEventListener('mousedown', (event) => {
          const text = event.target.textContent
          const outputText = text.length <= this.maxLength ? `@${text}&nbsp` : ''
          const [start, end] = editor.getSelection()
          if (outputText && !this.tagList.includes(outputText)) {
            this.tagList.push({
              id: this.assigned_to.find((user) => user.name === text).id,
              name: outputText
            })
          }
          editor.replaceSelection(outputText, [start[0], start[1] - 1], end)
        })
      }
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
