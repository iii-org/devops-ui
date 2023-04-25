<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    top="3vh"
    width="60%"
    @closed="onDialogClosed"
  >
    <el-form
      ref="form"
      v-loading="isLoading"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        :label="$t('Activities.LocalProject')"
        prop="projectId"
      >
        <el-select
          v-model="form.projectId"
          :placeholder="$t('Project.SelectProject')"
          :disabled="title === $t('Activities.EditTemplate')"
          :filter-method="setFilter"
          filterable
          style="width:100%"
          @change="changeProject()"
        >
          <el-option-group
            v-for="group in categoryProjectList"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.id"
              :label="item.display"
              :value="item.id"
            />
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-divider />
      <el-form-item
        :label="$t('Activities.TemplateName')"
        prop="name"
      >
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item
        :label="$t('Activities.TemplateDescription')"
        prop="description"
      >
        <Editor
          ref="mdEditor"
          initial-edit-type="wysiwyg"
          :options="editorOptions"
          style="line-height: 24px;"
          @paste.native="onPaste"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button
        class="buttonSecondaryReverse"
        :loading="isLoading"
        @click="onDialogClosed"
      >
        {{ $t('general.Close') }}
      </el-button>
      <el-button
        v-if="title === $t('Activities.CreateTemplate')"
        type="primary"
        :loading="isLoading"
        @click="handleCreate"
      >
        {{ $t('general.Add') }}
      </el-button>
      <el-button
        v-else
        type="primary"
        :loading="isLoading"
        @click="handleUpdate"
      >
        {{ $t('SystemVersion.UpdateNow') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTemplateParams } from '@/api/template'
import {
  createTemplateFromProject,
  updateTemplateFromProject
} from '@/api_v2/template'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/zh-tw'
import { Editor } from '@toast-ui/vue-editor'

const formTemplate = () => ({
  projectId: '',
  name: ''
})

export default {
  name: 'TemplateDialog',
  components: { Editor },
  props: {
    existedTemplateIds: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      isLoading: false,
      form: formTemplate(),
      row: {},
      rules: {
        projectId: [
          {
            required: true,
            message: this.$t('RuleMsg.PleaseSelect') + this.$t('Project.Project'),
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: this.$t('RuleMsg.PleaseInput') + this.$t('Activities.TemplateName'),
            trigger: 'blur'
          }
        ]
      },
      categoryProjectList: []
    }
  },
  computed: {
    ...mapGetters([
      'projectOptions',
      'selectedProjectId',
      'language'
    ]),
    allProjects() {
      return this.projectOptions.filter((obj) =>
        obj.is_lock !== true && obj.disabled !== true
      )
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
        ]
      }
    }
  },
  watch: {
    row(value) {
      if (value) {
        this.form.projectId = value.from_project_id
        this.changeProject()
      }
    }
  },
  mounted() {
    this.getCategoryProjectList()
  },
  methods: {
    getCategoryProjectList() {
      if (this.selectedProjectId === -1 || !this.selectedProjectId) {
        return []
      }
      const starred = this.allProjects.filter((item) =>
        item.starred && !item.is_empty_project
      )
      const projects = this.allProjects.filter((item) =>
        !item.starred && !item.is_empty_project
      )
      this.categoryProjectList = [
        {
          label: this.$t('Project.Starred'),
          options: starred
        },
        { options: projects }
      ]
    },
    setFilter(value) {
      this.getCategoryProjectList()
      const keyword = value.toLowerCase()
      this.categoryProjectList = this.categoryProjectList.filter((item) =>
        item.options.filter((element) => {
          const { name, display } = element
          return display.indexOf(keyword) > -1 || name.indexOf(keyword) > -1
        }).length > 0
      )
    },
    async changeProject() {
      if (!this.form.projectId) return
      this.isLoading = true
      const repositoryId = this.allProjects.find((item) =>
        item.id === this.form.projectId
      ).repository_ids[0]
      const data = (await getTemplateParams(repositoryId)).data
      this.form.name = data.name
      this.$refs.mdEditor.invoke('setHTML', data.description.replace(/\>[\t ]+\</g, '><'))
      this.isLoading = false
    },
    onPaste() {
      const editor = this.$refs.mdEditor
      const text = editor.invoke('getMarkdown')
      editor.invoke('reset')
      editor.invoke('setHTML', text)
    },
    handleCreate() {
      this.$refs['form'].validate(async(valid) => {
        if (this.existedTemplateIds.includes(this.form.projectId)) {
          this.$message({
            title: this.$t('general.Error'),
            message: this.$t('Activities.DuplicatedTemplate', [this.form.name]),
            type: 'error'
          })
        } else if (valid) {
          this.isLoading = true
          try {
            const sendData = new FormData()
            const description = this.$refs.mdEditor.invoke('getHTML')
            sendData.append('name', this.form.name)
            sendData.append('description', description)
            await createTemplateFromProject(this.form.projectId, sendData)
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
          } catch (error) {
            console.error(error)
          } finally {
            this.isLoading = false
            this.onDialogClosed()
            this.$emit('update')
          }
        }
      })
    },
    handleUpdate() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
          this.isLoading = true
          try {
            const sendData = new FormData()
            const description = this.$refs.mdEditor.invoke('getHTML')
            sendData.append('name', this.form.name)
            sendData.append('description', description)
            await updateTemplateFromProject(this.row.id, sendData)
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
          } catch (error) {
            console.error(error)
          } finally {
            this.isLoading = false
            this.onDialogClosed()
            this.$emit('update')
          }
        }
      })
    },
    onDialogClosed() {
      this.row = {}
      this.$refs.mdEditor.invoke('reset')
      this.$refs.form.resetFields()
      this.dialogVisible = false
    }
  }
}
</script>
