<template>
  <el-row>
    <el-row
      v-loading="isLoading"
      :class="!edit ? 'description' : ''"
      :style="{ cursor: isButtonDisabled ? 'not-allowed' : 'text' }"
      @click.native.capture="edit = !isButtonDisabled"
    >
      <el-row class="text-sm font-bold py-3">
        {{ $t('Issue.Description') }}
        <em
          v-if="!edit"
          class="el-icon-edit-outline align-middle text-xl"
        />
        <span v-else>
          <el-button
            class="action"
            type="success"
            size="mini"
            icon="el-icon-check"
            @click="updateDescription"
          />
          <el-button
            class="action"
            type="danger"
            size="mini"
            icon="el-icon-close"
            @click="cancelInput"
          />
        </span>
      </el-row>
      <el-col v-if="edit">
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
            @scroll="tagListVisible = true"
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
            height="12rem"
            @change="onChange"
            @keydown.native="onKeydown"
          />
        </el-popover>
      </el-col>
      <el-col v-else-if="value && value !== '<p><br></p>'">
        <Viewer
          ref="mdViewer"
          :key="componentKey"
          :initial-value="value ? value : '<p><br></p>'"
          class="px-5"
          :class="ellipsisStatus ? 'break-word whitespace-normal overflow-hidden text-ellipsis' : null"
          :style="ellipsisStatus ? 'display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;' : null"
          @load="isFolded"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-link
        v-if="isViewerFolded && !edit"
        :icon="ellipsisStatus ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
        class="table m-auto my-3"
        type="info"
        :underline="false"
        @click="ellipsisStatus = !ellipsisStatus"
      >
        {{ ellipsisStatus ? $t('general.Expand') : $t('general.Fold') }}
      </el-link>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectAssignable } from '@/api/projects'
import { updateIssue } from '@/api/issue'
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
      isLoading: false,
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
    // if (!this.issueId || !this.oldValue || this.oldValue === '') {
    //   this.edit = true
    // }
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
    },
    async updateDescription() {
      this.isLoading = true
      const sendForm = new FormData()
      let value = this.value
      if (value === '<p><br></p>') value = ''
      else if (value !== '') {
        this.$emit('filterImage', [value, sendForm, true])
        value = value.replace(/<a/g, '<a target="_blank"')
      }
      sendForm.append('description', value)
      await updateIssue(this.issueId, sendForm).then(() => {
        this.$emit('update')
        this.edit = false
      })
      this.$emit('sendMentionMessage')
      this.isLoading = false
    },
    cancelInput() {
      this.$refs.mdEditor.invoke('setMarkdown', this.oldValue)
      this.edit = !this.issueId
      this.ellipsisStatus = true
    }
  }
}
</script>

<style lang="scss" scoped>
.description:hover {
  background-color: mix(#808080, #ffffff, 30);
}

.el-button--success{
  color: #85ce61;
  border: 1px solid #989898;
  background: none;
  -webkit-transition: all .6s ease;
  transition: all .6s ease;
  &:hover {
    color: #fff;
    border: 1px solid #67c23a;
    background: #67c23a;
  }
}

.el-button--danger{
  color: #F56C6C;
  border: 1px solid #989898;
  background: none;
  -webkit-transition: all .6s ease;
  transition: all .6s ease;
  &:hover {
    color: #fff;
    border: 1px solid #F56C6C;
    background: #F56C6C;
  }
}

.action {
  margin: 0;
  &.el-button--mini {
    padding: 5px;
  }
}
</style>
