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
<<<<<<< HEAD
          filterable
=======
          :disabled="title === $t('Activities.EditTemplate')"
          filterable
          @change="changeProject()"
>>>>>>> selftemplate
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
<<<<<<< HEAD
      <el-button class="buttonSecondaryReverse" @click="onDialogClosed">
        {{ $t('general.Close') }}
      </el-button>
      <el-button type="primary" @click="handleCreate">
        {{ $t('general.Add') }}
      </el-button>
=======
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
>>>>>>> selftemplate
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
<<<<<<< HEAD
=======
import { getTemplateParams } from '@/api/template'
import { createTemplateFromProject, updateTemplateFromProject } from '@/api_v2/template'
>>>>>>> selftemplate
import { VueEditor } from 'vue2-editor'

const formTemplate = () => ({
  project: '',
  name: '',
<<<<<<< HEAD
  description: "ASP.NET Core 3.1 <a class='el-link el-link--primary' href='https://github.com/iiidevops-templates/asp-dotnet-core-example/blob/master/README.md' target='_blank'>MVC web 範本說明</a><hr size=1 />  <li><b>v1.16</b>:SonarQube均改用 helm chart 架構, Postman POD 名稱加上 git hash  <li><b>v1.15</b>:支援Web部署上傳檔案大小設定(預設1MB)  <li><b>v1.13</b>:支援 SonarQube 8.9 功能與可指定 harbor.host 功能, 整合 Android APK 黑箱掃描 CMAS 工具"
=======
  description: ''
>>>>>>> selftemplate
})

export default {
  name: 'TemplateDialog',
  components: { VueEditor },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
<<<<<<< HEAD
=======
    existedTemplateIds: {
      type: Array,
      default: () => []
    },
>>>>>>> selftemplate
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
<<<<<<< HEAD
      form: formTemplate(),
      rules: {
        name: [
          { required: true,
            message: this.$t('general.PleaseInput') + this.$t('Activities.TemplateName'),
=======
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
>>>>>>> selftemplate
            trigger: 'blur'
          }
        ]
      },
<<<<<<< HEAD
=======
      allProjects: [],
>>>>>>> selftemplate
      categoryProjectList: []
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'selectedProjectId'])
  },
<<<<<<< HEAD
=======
  watch: {
    row(value) {
      if (value) {
        this.form.project = value.from_project_id
        this.changeProject()
      }
    }
  },
>>>>>>> selftemplate
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
<<<<<<< HEAD
=======
      this.allProjects = filteredArray
>>>>>>> selftemplate
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
<<<<<<< HEAD
    handleCreate() {
      this.$refs['form'].validate((valid) => {
        // if (valid) { }
      })
    },
    onDialogClosed() {
=======
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
            message: this.$t('Activities.DuplicatedTemplate', [this.form.name]),
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
>>>>>>> selftemplate
      this.$refs['form'].resetFields()
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>

<style>
</style>
