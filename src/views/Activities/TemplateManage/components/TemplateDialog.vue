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
        prop="project"
      >
        <el-select
          v-model="form.project"
          :placeholder="$t('Project.SelectProject')"
          :disabled="title === $t('Activities.EditTemplate')"
          filterable
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
        <VueEditor v-model="form.description" />
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
import { createTemplateFromProject, updateTemplateFromProject } from '@/api_v2/template'
import { VueEditor } from 'vue2-editor'

const formTemplate = () => ({
  project: '',
  name: '',
  description: ''
})

export default {
  name: 'TemplateDialog',
  components: { VueEditor },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
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
      isLoading: false,
      form: formTemplate(),
      row: {},
      rules: {
        project: [
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
      allProjects: [],
      categoryProjectList: []
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'selectedProjectId'])
  },
  watch: {
    row(value) {
      if (value) {
        this.form.project = value.from_project_id
        this.changeProject()
      }
    }
  },
  mounted() {
    this.getCategoryProjectList()
  },
  methods: {
    getCategoryProjectList() {
      if ((this.selectedProjectId === -1 || !this.selectedProjectId)) {
        return []
      }
      const filteredArray = this.projectOptions.filter(obj => {
        return obj.is_lock !== true && obj.disabled !== true
      })
      this.allProjects = filteredArray
      const starred = filteredArray.filter((item) => item.starred)
      const projects = filteredArray.filter((item) => !item.starred)
      this.categoryProjectList = [
        {
          label: this.$t('Project.Starred'),
          options: starred
        },
        { options: projects }
      ]
    },
    async changeProject() {
      if (!this.form.project) return
      this.isLoading = true
      const repositoryId = this.allProjects.filter((item) => {
        return item.id === this.form.project
      })[0].repository_ids[0]
      const data = (await getTemplateParams(repositoryId)).data
      this.form.name = data.name
      this.form.description = data.description
      this.isLoading = false
    },
    handleCreate() {
      this.$refs['form'].validate(async(valid) => {
        if (this.existedTemplateIds.includes(this.form.project)) {
          this.$message({
            title: this.$t('general.Error'),
            message: this.$t('Activities.DuplicatedTemplate', [this.form.project]),
            type: 'error'
          })
        } else if (valid) {
          this.isLoading = true
          try {
            const sendData = new FormData()
            sendData.append('name', this.form.name)
            sendData.append('description', this.form.description)
            await createTemplateFromProject(this.form.project, sendData)
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
            sendData.append('name', this.form.name)
            sendData.append('description', this.form.description)
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
      this.$refs['form'].resetFields()
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>

<style>
</style>
