<template>
  <el-row
    v-loading="isLoadingTemplate"
    class="loading-template"
    :gutter="10"
  >
    <el-col :span="24">
      <el-divider content-position="left">
        {{ $t('Project.Template') }}
        <el-button
          class="ml-2 buttonPrimaryReverse"
          icon="el-icon-refresh"
          size="mini"
          circle
          @click="init(1)"
        />
      </el-divider>
    </el-col>
    <el-col
      :xs="24"
      :sm="18"
      :md="20"
    >
      <el-form-item :label="$t('Project.TemplateName')">
        <div
          slot="label"
          class="flex items-center mb-2"
        >
          <span class="mr-3">
            {{ $t('Project.TemplateName') }}
          </span>
          <el-radio-group
            v-model="focusSources"
            size="mini"
          >
            <el-radio-button label="Public Templates">
              Public
            </el-radio-button>
            <el-radio-button label="Local Templates">
              Local
            </el-radio-button>
          </el-radio-group>
        </div>
        <el-select
          v-model="form.template_id"
          :placeholder="$t('Project.SelectTemplate')"
          style="width:100%"
          clearable
          filterable
          @change="handleTemplateSelect"
        >
          <el-option
            v-for="item in activeTemplateList"
            :key="item.id"
            :label="item.display || item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col
      :xs="24"
      :sm="6"
      :md="4"
    >
      <el-form-item :label="$t('Project.Version')">
        <div
          slot="label"
          class="mb-2"
        >
          <span>
            {{ $t('Project.Version') }}
          </span>
        </div>
        <el-select
          v-model="form.tag_name"
          :disabled="!form.template_id"
          style="width:100%"
          clearable
          @change="handleVersionSelect"
        >
          <el-option
            v-for="item in versionList"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          >
            <span>
              {{ item.name }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col
      v-if="focusTemplate.description"
      :span="24"
    >
      <el-form-item :label="$t('Project.TemplateDescription')">
        <span v-html="focusTemplate.description" />
      </el-form-item>
    </el-col>
    <el-col
      v-for="(argument, idx) in form.argumentsForm"
      :key="argument.key"
      :span="8"
    >
      <el-form-item
        :label="argument.display"
        :prop="'argumentsForm.' + idx + '.value'"
        :rules="databaseRules(argument)"
      >
        <el-input
          v-model="argument.value"
          :placeholder="$t('general.PleaseInput')"
          :show-password="argument.input_type === 'password'"
        />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  passwordPolicyCheck,
  passwordPolicyList
} from '@/api/projects'
import {
  getTemplateList,
  getTemplateParams,
  getTemplateParamsByVersion
} from '@/api/template'

export default {
  name: 'TemplateList',
  props: {
    isCreate: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      templateList: [],
      databaseType: [],
      focusTemplate: {},
      isLoadingTemplate: false,
      isClickUpdateTemplate: false,
      loadingTemplateText: ['', '.', '..', '...'],
      templateLoadingInstance: {},
      focusSources: 'Public Templates',
      cachedTemplates: {}
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    versionList() {
      return this.focusTemplate.version || []
    },
    activeTemplateList() {
      if (this.templateList.length === 0) return []
      const idx = this.templateList.findIndex((item) => item.source === this.focusSources)
      return this.templateList[idx].options
    }
  },
  watch: {
    isClickUpdateTemplate(val) {
      if (val) {
        const text = this.$t('LoadingText.loadingTemplateText')
        this.templateLoadingInstance = this.$loading({
          text,
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.9)',
          target: '.loading-template',
          customClass: 'project-dialog-template-loading'
        })
        // set 60secs for loading to show different words
        for (let sec = 1; sec < 60; sec++) {
          const templateText = `${text}${this.loadingTemplateText[sec % 4]}`
          this.timer = setTimeout(() => this.openTemplateFullLoading(templateText), 1000 * sec)
        }
      } else {
        clearTimeout(this.timer)
        this.openTemplateFullLoading()
      }
    },
    focusSources(val) {
      this.$emit('clearTemplate')
      this.clearFocusTemplate()
      if (val === 'Public Templates' && this.cachedTemplates.publicPath) {
        this.form.template_id = this.getCachedTemplateId(this.cachedTemplates.publicPath)
        this.handleTemplateSelect()
      } else if (this.cachedTemplates.localPath) {
        this.form.template_id = this.getCachedTemplateId(this.cachedTemplates.localPath)
        this.handleTemplateSelect()
      }
    },
    templateList(val) {
      if (!this.isCreate) return
      const publicTemplates = val.find((item) => item.source === 'Public Templates')
      const defaultTemplate = publicTemplates.options.find((template) => template.path === 'default-dev')
      this.form.template_id = defaultTemplate.id
      this.handleTemplateSelect()
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.cachedTemplates = {}
    this.clearFocusTemplate()
  },
  methods: {
    async init(isForceUpdate) {
      this.databaseType = (await passwordPolicyList()).data
      if (this.userRole !== 'Engineer') {
        await this.getTemplateList(isForceUpdate)
      }
    },
    databaseRules(argument) {
      const rules = [
        {
          required: true,
          message: `${this.$t('general.PleaseInput')} ${argument.display}`,
          trigger: 'blur'
        }
      ]
      if (argument.input_type === 'password') {
        rules[1] = {
          validator: this.validatePassword,
          trigger: 'blur'
        }
      }
      return rules
    },
    async validatePassword(rule, value, callback) {
      const data = { db_pswd: value }
      data.db_user = this.form.argumentsForm[0].input_type === 'password' ? null
        : this.form.argumentsForm[0].value
      data.db_type = this.databaseType.find((item) => this.focusTemplate.name.includes(item))
      if (!data.db_type) callback()
      else {
        await passwordPolicyCheck(data).then((res) => {
          if (res.data.pass) {
            callback()
          } else {
            callback(new Error(res.data.description))
          }
        })
      }
    },
    getCachedTemplateId(path) {
      return this.activeTemplateList.find((item) => item.path === path).id
    },
    openTemplateFullLoading(loadingText) {
      if (loadingText) this.templateLoadingInstance.setText(loadingText)
      else this.templateLoadingInstance.close()
    },
    async getTemplateList(force_update) {
      if (force_update) this.isClickUpdateTemplate = true
      await getTemplateList({ force_update }).then((res) => {
        this.templateList = res.data
      })
      this.isClickUpdateTemplate = false
    },
    handleTemplateSelect() {
      if (this.form.template_id !== '') {
        const idx = this.activeTemplateList.findIndex((item) =>
          item.id === this.form.template_id
        )
        this.focusTemplate = this.activeTemplateList[idx]
        this.form.tag_name = this.versionList[0] ? this.versionList[0].name : ''
        this.setCachedTemplates()
        this.handleVersionSelect()
      } else {
        this.$emit('clearTemplate')
        this.clearFocusTemplate()
      }
    },
    setCachedTemplates() {
      if (this.focusSources === 'Public Templates') {
        this.cachedTemplates.publicPath = this.focusTemplate.path
      } else {
        this.cachedTemplates.localPath = this.focusTemplate.path
      }
    },
    handleVersionSelect() {
      if (this.form.tag_name !== '') {
        this.fetchTemplateParamsByVersion()
      } else {
        this.fetchTemplateParams()
      }
      this.$emit('resetTemplate')
    },
    fetchTemplateParams() {
      this.isLoadingTemplate = true
      getTemplateParams(this.form.template_id)
        .then((res) => {
          if (res.data['arguments']) {
            this.handleArguments(res.data['arguments'])
          } else {
            this.form.argumentsForm = []
          }
        })
        .catch((err) => {
          this.form.template_id = ''
          this.$emit('clearTemplate')
          this.clearFocusTemplate()
          console.error('fetchTemplateParams error', err)
        })
        .finally(() => {
          this.isLoadingTemplate = false
        })
    },
    fetchTemplateParamsByVersion() {
      this.isLoadingTemplate = true
      getTemplateParamsByVersion(this.form.template_id, this.form.tag_name)
        .then((res) => {
          if (res.data.arguments) {
            this.handleArguments(res.data.arguments)
          } else {
            this.form.argumentsForm = []
          }
        })
        .catch((err) => {
          this.form.template_id = ''
          this.$emit('clearTemplate')
          this.clearFocusTemplate()
          console.error(err)
        })
        .finally(() => {
          this.isLoadingTemplate = false
        })
    },
    handleArguments(data) {
      this.form.argumentsForm = data.map((item) => {
        const result = item
        result.value = item.default_value
        return result
      })
    },
    clearFocusTemplate() {
      this.focusTemplate = {}
    }
  }
}
</script>
