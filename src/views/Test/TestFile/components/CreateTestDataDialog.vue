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
    <h2 class="text-center">
      {{ $t('Test.TestFile.CreateTestDataSetting') }}
    </h2>
    <div
      v-loading="isLoading"
      class="el-card scroll"
      :element-loading-text="$t('Loading')"
    >
      <div v-if="variable.length > 0" class="el-card__body">
        <el-row :gutter="10">
          <el-col class="mb-5">
            <h4 class="mb-3">
              {{ $t('Test.TestFile.VariableAndRange') }}
            </h4>
            <el-form
              v-for="(item,index) in variable"
              ref="form"
              :key="index"
              :model="item"
            >
              <el-col :span="4">
                <el-form-item prop="name">
                  <span class="font-bold">{{ item.name }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item
                  prop="type"
                  :rules="{
                    trigger: 'blur',
                    required: item.value ? true : false,
                    message: $t('Validation.Select', [$t('Test.TestFile.Type')])
                  }"
                >
                  <el-select
                    v-model="item.type"
                    :placeholder="$t('RuleMsg.PleaseSelect')"
                  >
                    <el-option :label="$t('Validation.String')" value="str" />
                    <el-option :label="$t('Validation.Number')" value="int" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  prop="value"
                  :rules=" { validator: numberCheck, trigger: 'blur' }"
                >
                  <el-input
                    v-model="item.value"
                    :placeholder="$t('Test.TestFile.RangePlaceholder')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-button
                  type="danger"
                  icon="el-icon-close"
                  @click="clear(index)"
                >
                  {{ $t('general.Clear') }}
                </el-button>
              </el-col>
            </el-form>
          </el-col>
          <el-col>
            <div class="flex justify-between mb-3">
              <h4 style="display: inline;">
                {{ $t('Test.TestFile.VariableLimit') }}
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
            <el-col>
              <el-input
                v-model="limit"
                type="textarea"
                :rows="10"
                :disabled="isDisabled"
                :placeholder="limitPlaceholder"
              />
            </el-col>
            <el-col>
              <span class="text-danger">
                {{ $t('Test.TestFile.LimitNotes') }}
              </span>
            </el-col>
          </el-col>
        </el-row>
      </div>
      <el-empty
        v-else
        :description="$t('general.NoData')"
      />
    </div>
    <template slot="footer">
      <div class="flex justify-between">
        <span>
          <el-button
            v-if="selectedProject.owner_id === userId || userRole==='Administrator'"
            type="danger"
            :loading="isLoading"
            :disabled="isDisabled"
            @click="remove"
          >
            {{ $t('general.Delete') }}
          </el-button>
        </span>
        <span>
          <el-button
            class="buttonPrimary"
            :loading="isLoading"
            :disabled="isDisabled"
            @click="confirm"
          >
            {{ $t('Test.TestFile.CreateNow') }}
          </el-button>
          <el-button
            class="buttonSecondaryReverse"
            :loading="isLoading"
            @click="close"
          >
            {{ $t('general.Close') }}
          </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getSideexVariable,
  updateSideexVariable,
  deleteSideexVariable,
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
      variable: [],
      limit: '',
      limitPlaceholder: `IF [File system] = "FAT" THEN [Size] <= 4096;\nIF [File system] = "FAT32" THEN [Size] <= 32000;\n
IF [File system] <> "NTFS" OR\n ( [File system] = "NTFS" AND [Cluster size] > 4096 )\nTHEN [Compression] = "Off";\n
IF NOT ( [File system] = "NTFS" OR\n ( [File system] = "NTFS" AND NOT [Cluster size] <= 4096 )\nTHEN [Compression] = "Off";`,
      createLoading: false,
      loadingText: ['saveParamsSetting', 'createTestData', 'sideeXTestDataConverting'],
      loadingInstance: {},
      timer: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'selectedProject', 'userId', 'userRole']),
    isAllFill() {
      return this.variable.every((item) => item.value)
    },
    isDisabled() {
      return this.variable.every((item) => item.value === '')
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
        : this.$t('LoadingText.sideeXTestDataConverting')
      // set loading text every 3 second
      this.loadingInstance.setText(text)
    },
    numberCheck (rule, value, callback) {
      const variable = this.variable.find((item) => item.value === value)
      if (variable.type !== 'int' || !variable.type || !variable.value) callback()
      if (!value.split(',').every((item) => /^\+?[1-9][0-9]*$/.test(item))) {
        callback(new Error(this.$t('Test.TestFile.EnterPositive')))
      }
      callback()
    },
    async fetchData() {
      this.isLoading = true
      const data = (await getSideexVariable(this.selectedProjectId, { filename: this.fileName })).data
      this.variable = data.var.map((item) => ({
        name: item.name,
        type: item.type,
        value: typeof item.value === 'string' ? item.value : item.value.join()
      }))
      this.limit = data.rule.join('\n')
      this.isLoading = false
    },
    clear(index) {
      this.variable[index].type = ''
      this.variable[index].value = ''
    },
    confirm() {
      const validity = []
      this.$refs['form'].forEach((item) => { item.validate((valid) => { validity.push(valid) }) })
      if (!validity.every((item) => item)) return
      if (this.isAllFill) {
        this.update()
      } else {
        this.$confirm(this.$t('Notify.confirmVariableSetting'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        }).then(() => {
          this.update()
        }).catch(() => {})
      }
    },
    async update() {
      this.createLoading = true
      const data = {
        var: this.variable
          .filter((item) => item.name && item.type)
          .map((item) => ({
            name: item.name,
            type: item.type,
            value: item.type === 'int'
              ? item.value.split(',').map(Number)
              : item.value.split(',')
          })),
        rule: this.limit.split(';').filter((item) => item !== '')
          .map((item) => item.replace(/\r\n|\n/g, '').replace(/\"/g, "'") + ';')
      }
      try {
        await updateSideexVariable(this.selectedProjectId, data)
        this.generate()
      } catch (e) {
        console.error(e)
        this.createLoading = false
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
    remove() {
      this.$confirm(this.$t('Notify.confirmDeleteSideex'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      }).then(async() => {
        this.isLoading = true
        try {
          await deleteSideexVariable(this.selectedProjectId)
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
        } catch (e) {
          console.error(e)
        } finally {
          this.isLoading = false
        }
      }).catch(() => {})
    },
    close() {
      this.$emit('update:dialogVisible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 10px 20px;
}
.scroll {
  overflow: auto;
  height: 500px;
}
</style>
