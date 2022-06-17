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
        <el-col
          :md="12"
          :span="24"
        >
          <el-form-item :label="$t('Issue.RelatedIssue')">
            <el-select
              v-model="form.issue_ids"
              style="width: 100%"
              :placeholder="$t('Issue.SearchNameOrAssignee')"
              clearable
              filterable
              remote
              multiple
              :remote-method="getSearchIssue"
              :loading="issueLoading"
              @focus="getSearchIssue()"
            >
              <el-option-group
                v-for="group in issueList"
                :key="group.name"
                :label="group.name"
              >
                <template v-for="item in group.options">
                  <el-option
                    :key="item.id"
                    :label="'#' + item.id +' - '+item.name"
                    :value="item.id"
                  />
                </template>
              </el-option-group>
            </el-select>
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
    },
    issueLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      isLoading: false,
      form: formTemplate(),
      row: {},
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
    getSearchIssue(query) {
      this.$emit('getIssue', query)
    },
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
            this.row = (await createExcalidraw(sendData)).data
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
          } catch (error) {
            console.error(error)
          } finally {
            this.isLoading = false
            this.$emit('update')
            this.$emit('handle', this.row)
            this.onDialogClosed()
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
