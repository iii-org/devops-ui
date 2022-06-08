<template>
  <el-dialog
    :title="$t('Excalidraw.CreateBoard')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <el-form
      ref="form"
      v-loading="isLoading"
      :model="form"
      :rules="rules"
      class="custom-list"
    >
      <el-row>
        <el-col
          :md="12"
          :span="24"
        >
          <el-form-item :label="$t('Issue.Issue')">
            <el-select
              v-model="form.issue_ids"
              style="width: 100%"
              :placeholder="$t('RuleMsg.PleaseSelect') + $t('Issue.Issue')"
              filterable
              multiple
            >
              <el-option
                v-for="item in issueList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :md="12"
          :span="24"
        >
          <el-form-item
            :label="$t('general.Name')"
            prop="name"
          >
            <el-input
              v-model="form.name"
              :placeholder="$t('RuleMsg.PleaseInput') + $t('general.Name')"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
        type="primary"
        :loading="isLoading"
        @click="handleCreate"
      >
        {{ $t('general.Add') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { createExcalidraw } from '@/api_v2/excalidraw'

const formTemplate = () => ({
  issue_ids: [],
  name: ''
})

export default {
  name: 'CreateBoardDialog',
  props: {
    issueList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      isLoading: false,
      form: formTemplate(),
      rules: {
        name: [
          {
            required: true,
            message: this.$t('RuleMsg.PleaseSelect') + this.$t('general.Name'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    handleCreate() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
          this.isLoading = true
          try {
            const sendData = new FormData()
            sendData.append('project_id', this.selectedProjectId)
            sendData.append('name', this.form.name)
            if (this.form.issue_ids.length > 0) {
              sendData.append('issue_ids', this.form.issue_ids)
            }
            await createExcalidraw(sendData)
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
    onDialogClosed() {
      this.form = formTemplate()
      this.$refs['form'].resetFields()
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.custom-list {
  .el-row {
    font-size: 0;
  }

  .el-col {
    float: none;
    padding: 0 10px;
    vertical-align: top;
    display: inline-block;
    @media (max-width: 767px) {
      width: 100%;
      display: block;
    }
  }

  .el-form-item__label {
    float: none;
    text-align: left;
  }
}
</style>
