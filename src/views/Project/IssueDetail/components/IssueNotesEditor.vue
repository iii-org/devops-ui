<template>
  <div>
    <div class="text-sm mt-2 mb-3">
      {{ $t('Issue.Notes') }}
    </div>
    <Editor
      ref="mdEditor"
      initial-edit-type="markdown"
      :options="editorOptions"
      height="18rem"
      @change="onChange"
      @keyup="onKeyup"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectAssignable } from '@/api/projects'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/zh-tw'
import { Editor } from '@toast-ui/vue-editor'

export default {
  name: 'IssueNotesEditor',
  components: { Editor },
  props: {
    projectId: {
      type: Number,
      default: 0
    },
    mentionList: {
      type: Array,
      default: () => []
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
  data() {
    return {
      assigned_to: [],
      tagList: []
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      this.assigned_to = (await getProjectAssignable(this.projectId)).data.user_list
    },
    onChange(event) {
      const notes = this.$refs.mdEditor.invoke('getMarkdown')
      this.tagList = this.tagList.filter((tag) => notes.includes(tag.name))
      this.$emit('update:mentionList', this.tagList.map((tag) => tag.id))
      this.$emit('change', event)
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
    }
  }
}
</script>
