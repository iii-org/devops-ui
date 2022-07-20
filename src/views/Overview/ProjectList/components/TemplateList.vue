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
          <span class="mr-3">{{ $t('Project.TemplateName') }}</span>
          <el-radio-group
            v-model="focusSources"
            size="mini"
          >
            <el-radio-button label="Public Templates">Public</el-radio-button>
            <el-radio-button label="Local Templates">Local</el-radio-button>
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
          <span>{{ $t('Project.Version') }}</span>
        </div>
        <el-select
          v-model="form.tag_name"
          style="width:100%"
          :disabled="!form.template_id"
          @change="handleVersionSelect"
        >
          <el-option
            v-for="item in versionList"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          >
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col
      v-if="focusTemplate.description"
      :span="24"
    >
      <el-form-item :label="$t('Project.TemplateDescription')">
        <p v-html="focusTemplate.description" />
      </el-form-item>
    </el-col>
    <div>
      <el-col
        v-for="(argument, idx) in form.argumentsForm"
        :key="argument.key"
        :span="8"
      >
        <el-form-item
          :label="argument.display"
          :prop="'argumentsForm.' + idx + '.value'"
          :rules="{
            required: true,
            message: $t('general.PleaseInput') + ' ' + argument.display,
            trigger: 'blur'
          }"
        >
          <el-input
            v-if="argument.input_type === 'text'"
            v-model="argument.value"
            :placeholder="$t('general.PleaseInput')"
          />
          <el-input
            v-else-if="argument.input_type === 'password'"
            v-model="argument.value"
            :placeholder="$t('general.PleaseInput')"
            show-password
          />
        </el-form-item>
      </el-col>
    </div>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getTemplateList,
  getTemplateParams,
  getTemplateParamsByVersion
} from '@/api/template'

export default {
  name: 'TemplateList',
  props: {
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      templateList: [],
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
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init(isForceUpdate) {
      if (this.userRole !== 'Engineer') {
        this.getTemplateList(isForceUpdate)
      }
    },
    getCachedTemplateId(path) {
      return this.activeTemplateList.find((item) => item.path === path).id
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
        const idx = this.activeTemplateList.findIndex((item) => item.id === this.form.template_id)
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
        .then(() => {
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
        .then(() => {
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
    openTemplateFullLoading(loadingText) {
      if (loadingText) this.templateLoadingInstance.setText(loadingText)
      else this.templateLoadingInstance.close()
    },
    clearFocusTemplate() {
      this.focusTemplate = {}
    }
  }
}
</script>
