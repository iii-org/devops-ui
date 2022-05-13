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
          filterable
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
      <el-button class="buttonSecondaryReverse" @click="onDialogClosed">
        {{ $t('general.Close') }}
      </el-button>
      <el-button type="primary" @click="handleCreate">
        {{ $t('general.Add') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { VueEditor } from 'vue2-editor'

const formTemplate = () => ({
  project: '',
  name: '',
  description: "ASP.NET Core 3.1 <a class='el-link el-link--primary' href='https://github.com/iiidevops-templates/asp-dotnet-core-example/blob/master/README.md' target='_blank'>MVC web 範本說明</a><hr size=1 />  <li><b>v1.16</b>:SonarQube均改用 helm chart 架構, Postman POD 名稱加上 git hash  <li><b>v1.15</b>:支援Web部署上傳檔案大小設定(預設1MB)  <li><b>v1.13</b>:支援 SonarQube 8.9 功能與可指定 harbor.host 功能, 整合 Android APK 黑箱掃描 CMAS 工具"
})

export default {
  name: 'TemplateDialog',
  components: { VueEditor },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: formTemplate(),
      rules: {
        name: [
          { required: true,
            message: this.$t('general.PleaseInput') + this.$t('Activities.TemplateName'),
            trigger: 'blur'
          }
        ]
      },
      categoryProjectList: []
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'selectedProjectId'])
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
    handleCreate() {
      this.$refs['form'].validate((valid) => {
        // if (valid) { }
      })
    },
    onDialogClosed() {
      this.$refs['form'].resetFields()
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>

<style>
</style>
