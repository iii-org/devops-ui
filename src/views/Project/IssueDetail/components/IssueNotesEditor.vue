<template>
  <div>
    <div class="text-sm mt-2 mb-3">
      {{ $t('Issue.Notes') }}
    </div>
    <el-popover
      v-model="tagListVisible"
      :trigger="tagListVisible ? 'focus' : 'manual'"
      placement="top"
      width="auto"
      popper-class="p-0"
    >
      <ul
        class="my-0 py-3"
        style="overflow-y: auto; max-height: 6rem;"
        @scroll="onScroll"
      >
        <li
          v-for="(user,index) in assigned_to"
          :key="user.id"
          :class="{ 'mt-2': index !== 0}"
          class="cursor-pointer"
          @click="addTag"
        >
          {{ user.name }}
        </li>
      </ul>
      <Editor
        slot="reference"
        ref="mdEditor"
        initial-edit-type="wysiwyg"
        :options="editorOptions"
        height="18rem"
        @change="onChange"
        @keydown.native="onKeydown"
      />
    </el-popover>
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
            rule: /@.*&nbsp/,
            toDOM(text) {
              const rule = /@.*&nbsp/
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
      tagList: [],
      editorType: 'wysiwyg',
      tagListVisible: false
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      this.assigned_to = (await getProjectAssignable(this.projectId)).data.user_list
    },
    onChange(editorType) {
      this.editorType = editorType
      const notes = this.$refs.mdEditor.invoke('getMarkdown')
      this.tagList = this.tagList.filter((tag) => notes.includes(tag.name))
      this.$emit('update:mentionList', this.tagList.map((tag) => tag.id))
      this.$emit('change', editorType)
    },
    onScroll() {
      this.tagListVisible = true
    },
    onKeydown(event) {
      if (event.code === 'Digit2' && event.shiftKey) this.tagListVisible = true
      else this.tagListVisible = false
    },
    addTag(event) {
      const editor = this.$refs.mdEditor.editor
      const text = event.target.outerText
      const outputText = `@${text}&nbsp`
      const [start, end] = editor.getSelection()
      if (!this.tagList.includes(outputText)) {
        this.tagList.push({
          id: this.assigned_to.find((user) => user.name === text).id,
          name: outputText
        })
      }
      this.tagListVisible = false
      if (this.editorType === 'wysiwyg') {
        editor.replaceSelection(outputText, start - 1, end)
      } else {
        editor.replaceSelection(outputText, [start[0], start[1] - 1], end)
      }
    }
  }
}
</script>
