<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="50%"
    top="8vh"
    append-to-body
    destroy-on-close
  >
    <el-row>
      <el-col>
        <h2 class="text-center">
          {{ $t('Test.TestFile.CreateTestDataSetting') }}
        </h2>
      </el-col>
    </el-row>
    <el-row
      v-loading="isLoading"
      class="el-card scroll"
      :element-loading-text="$t('Loading')"
    >
      <el-col class="el-card__body">
        <el-row :gutter="20">
          <el-col :span="24" class="mb-5">
            <h4 class="mb-3">
              {{ $t('Test.TestFile.ParamsAndRange') }}
            </h4>
            <template v-for="(item,index) in params">
              <el-form ref="rules" :key="index" :model="item" :rules="rules">
                <el-col :span="5">
                  <el-form-item prop="name">
                    <span class="font-bold">{{ item.name }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item prop="type">
                    <el-select
                      v-model="item.type"
                      :placeholder="$t('RuleMsg.PleaseSelect')"
                    >
                      <el-option label="文字" value="str" />
                      <el-option label="數值" value="int" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item prop="value">
                    <el-input
                      v-model="item.value"
                      placeholder="請輸入範圍,請以,隔開,如1,2,3"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button
                    type="danger"
                    icon="el-icon-close"
                    @click="clear(index)"
                  >
                    {{ $t('general.Clear') }}
                  </el-button>
                </el-col>
              </el-form>
            </template>
          </el-col>
          <el-col :span="24">
            <div class="flex justify-between mb-3">
              <h4 style="display: inline;">
                {{ $t('Test.TestFile.ParamsLimit') }}
              </h4>
              <div>
                {{ $t('Test.TestFile.SettingReference') }}
                <el-link
                  type="primary"
                  target="_blank"
                  href="https://github.com/microsoft/pict/blob/main/doc/pict.md"
                >
                  https://github.com/microsoft/pict/blob/main/doc/pict.md
                </el-link>
              </div>
            </div>
            <el-col :span="24">
              <el-input
                v-model="limit"
                type="textarea"
                :rows="10"
                :placeholder="limitPlaceholder"
              />
            </el-col>
            <el-col :span="24">
              <span class="text-danger">
                [注意] 欲設限之變數，記得以中括弧包起來，如[變數]
              </span>
            </el-col>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <template slot="footer">
      <el-button
        :loading="isLoading"
        :disabled="isDisabled"
        class="buttonPrimary"
        @click="update"
      >
        {{ $t('Test.TestFile.CreateNow') }}
      </el-button>
      <el-button
        :loading="isLoading"
        class="buttonSecondaryReverse"
        @click="close"
      >
        {{ $t('general.Close') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getSideexVariable,
  updateSideexVariable,
  generateSideex
} from '@/api/sideex'

export default {
  name: 'CreateTestDataDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    fileName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false,
      params: [],
      limit: '',
      limitPlaceholder: `IF [File system] = "FAT" THEN [Size] <= 4096;\nIF [File system] = "FAT32" THEN [Size] <= 32000;\n
IF [File system] <> "NTFS" OR\n  ( [File system] =  "NTFS" AND [Cluster size] > 4096 )\nTHEN [Compression] = "Off";\n
IF NOT ( [File system] = "NTFS" OR\n  ( [File system] = "NTFS" AND NOT [Cluster size] <= 4096 ))\nTHEN [Compression] = "Off";`,
      rules: {
        type: [
          { required: true, message: '請選擇類型' }
        ],
        value: [
          { required: true, message: '請填上範圍' },
          { validator: this.numberCheck, trigger: 'blur' }
        ]
      },
      createLoading: false,
      loadingText: ['createRedmine', 'createGitLab', 'createHarbor', 'integrationProject'],
      loadingInstance: {},
      timer: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    isDisabled() {
      return this.params.some((item) => item.value === '')
    }
  },
  watch: {
    createLoading(val) {
      if (val) {
        this.loadingInstance = this.$loading({
          text: this.$t('Loading'),
          lock: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
          customClass: 'project-dialog-loading'
        })
        this.loadingText.forEach((text, index) => {
          this.timer = setTimeout(() =>
            this.openFullLoading(text), 3000 * index
          )
        })
      } else {
        clearTimeout(this.timer)
        this.loadingInstance.close()
        this.close()
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    openFullLoading(loadingText) {
      // handle i18n log warning when loadingText is undefined
      const text = loadingText
        ? this.$t(`LoadingText.${loadingText}`)
        : this.$t('LoadingText.integrationProject')
      // set loading text every 3 second
      this.loadingInstance.setText(text)
    },
    numberCheck (rule, value, callback) {
      if (this.params.filter((item) => item.value === value)[0].type !== 'int') callback()
      if (!value.split(',').every((item) => /^\+?[1-9][0-9]*$/.test(item))) {
        callback(new Error('請確認所輸入都是正整數!'))
      } else {
        callback()
      }
    },
    async fetchData() {
      this.isLoading = true
      const data = (await getSideexVariable(this.selectedProjectId, { filename: this.fileName })).data
      this.params = data.var.map((item) => ({
        name: item.name,
        type: item.type,
        value: item.value.toString()
      }))
      this.limit = data.rule.toString()
      this.isLoading = false
    },
    clear(index) {
      this.params[index].value = ''
    },
    async update() {
      const validity = []
      this.$refs['rules'].forEach((item) => { item.validate((valid) => { validity.push(valid) }) })
      if (!validity.every((item) => item)) return
      this.createLoading = true
      const data = {
        var: this.params.map((item) => ({
          name: item.name,
          type: item.type,
          value: item.type === 'int'
            ? item.value.split(',').map(Number)
            : item.value.split(',')
        })),
        rule: []
      }
      try {
        await updateSideexVariable(this.selectedProjectId, data)
      } catch (e) {
        console.error(e)
        this.createLoading = false
      } finally {
        this.generate()
      }
    },
    async generate() {
      try {
        await generateSideex(this.selectedProjectId, { filename: this.fileName })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Added'),
          type: 'success'
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.createLoading = false
      }
    },
    close() {
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding-top: 0;
}
.scroll {
  overflow: auto;
  height: 500px;
}
</style>
