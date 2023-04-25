<template>
  <el-row>
    <el-col>
      <el-row class="text-sm mt-2 mb-3">
        {{ $t('Issue.Description') }}
        <el-button
          v-if="!edit"
          :class="isButtonDisabled ? 'buttonInfoReverse' : 'buttonSecondaryReverse'"
          :disabled="isButtonDisabled"
          icon="el-icon-edit"
          size="mini"
          @click="edit=true"
        >
          {{ $t('general.Edit') }}
        </el-button>
      </el-row>
      <el-col v-if="edit">
        <p>{{ $t('Issue.ResetESCTip') }}</p>
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
            :initial-value="value"
            :options="editorOptions"
            height="18rem"
            @change="onChange"
            @keydown.native="onKeydown"
          />
        </el-popover>
      </el-col>
      <el-col v-else>
        <Viewer
          ref="mdViewer"
          :key="componentKey"
          :initial-value="value"
          :class="ellipsisStatus ? 'break-word whitespace-normal overflow-hidden text-ellipsis' : null"
          :style="ellipsisStatus ? 'display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;' : null"
          @load="isFolded"
        />
        <el-link
          v-if="isViewerFolded"
          :icon="ellipsisStatus ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
          class="table m-auto mt-1 mb-3"
          type="info"
          :underline="false"
          @click="ellipsisStatus = !ellipsisStatus"
        >
          {{ ellipsisStatus ? $t('general.Expand') : $t('general.Fold') }}
        </el-link>
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
import { query } from 'vue-gtag'

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
      tagList: [],
      editorType: 'wysiwyg',
      tagListVisible: false,
      ellipsisStatus: false,
      isViewerFolded: false
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
              text = text.replace(/\$\$widget\d\s/, '').replace(/\s\$\$/, '&nbsp')
              const rule = /@.*&nbsp/
              const matched = text.match(rule)
              const span = document.createElement('span')
              span.innerHTML = `<a style="text-decoration: none; cursor: default; color: #4b96e6;">${matched[0]}</a>`
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
      this.ellipsisStatus = true
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
    isFolded() {
      const el = this.$refs.mdViewer.$el
      this.isViewerFolded = el.clientHeight < el.scrollHeight
    },
    async getUserList() {
      this.assigned_to = (await getProjectAssignable(this.projectId)).data.user_list
    },
    onChange(editorType) {
      this.editorType = editorType
      const description = this.$refs.mdEditor.invoke('getMarkdown')
      this.tagList = this.tagList.filter((tag) => description.includes(tag.name))
      this.$emit('update:mentionList', this.tagList.map((tag) => tag.id))
      this.$emit('input', this.$refs.mdEditor.invoke('getHTML'))
    },
    onScroll() {
      this.tagListVisible = true
    },
    onKeydown(event) {
      if (event.code === 'Escape' && event.metaKey) this.cancelInput()
      else if (event.code === 'Digit2' && event.shiftKey) this.tagListVisible = true
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
    },
    cancelInput() {
      this.$refs.mdEditor.invoke('setMarkdown', this.oldValue)
      this.edit = !this.issueId
      this.ellipsisStatus = true
    }
  }
}
</script>

<style scoped>
.text-wrapper {
  white-space: pre-wrap;
}
</style>
