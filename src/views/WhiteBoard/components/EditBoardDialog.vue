<template>
  <el-dialog
    :title="$t('Excalidraw.EditBoard')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :fullscreen="true"
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
    <el-collapse v-model="isCollapse">
      <el-collapse-item title="Excalidraw" name="1">
        <iframe
          title="excalidraw"
          :src="row.url + '#' + userName"
          :height="computedItemHeight"
          width="100%"
        />
      </el-collapse-item>
    </el-collapse>
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
        @click="handleEdit"
      >
        {{ $t('general.Confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateExcalidraw } from '@/api_v2/excalidraw'

const formTemplate = () => ({
  issue_ids: [],
  name: ''
})

export default {
  name: 'EditBoardDialog',
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
      isCollapse: [],
      row: {},
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
    ...mapGetters(['userName']),
    computedItemHeight() {
      return window.innerHeight - Array.from(document.querySelectorAll('.el-collapse-item'))
        .reduce((s, el) => {
          return s + el.children[0].offsetHeight
        }, 0)
    }
  },
  watch: {
    row(value) {
      if (value) {
        this.getSearchIssue()
        this.form.issue_ids = value.issue_ids
        this.form.name = value.name
      }
    }
  },
  methods: {
    getSearchIssue(query) {
      this.$emit('getIssue', query)
    },
    handleEdit() {
      this.$refs['form'].validate(async(valid) => {
        if (valid) {
          this.isLoading = true
          try {
            const sendData = new FormData()
            sendData.append('name', this.form.name)
            if (this.form.issue_ids.length > 0) {
              sendData.append('issue_ids', this.form.issue_ids)
            }
            await updateExcalidraw(this.row.id, sendData)
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
      this.dialogVisible = false
    }
  }
}
</script>

<style>
</style>
