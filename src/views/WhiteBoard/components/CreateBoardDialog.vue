<template>
  <el-dialog
    :title="$t('Excalidraw.CreateBoard')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    @closed="onDialogClosed"
  >
    <ExcalidrawForm
      ref="ExcalidrawForm"
      :form="form"
      :is-loading="isLoading"
    />
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
import ExcalidrawForm from '@/views/WhiteBoard/components/ExcalidrawForm'

const formTemplate = () => ({
  issue_ids: [],
  name: ''
})

export default {
  name: 'CreateBoardDialog',
  components: { ExcalidrawForm },
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
    handleCreate() {
      this.$refs['ExcalidrawForm'].$refs['form'].validate(async(valid) => {
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
            this.isLoading = false
            this.$emit('update')
            this.$emit('handle', this.row)
          } catch (error) {
            console.error(error)
            this.$emit('handleError')
          } finally {
            this.onDialogClosed()
          }
        }
      })
    },
    onDialogClosed() {
      this.form = formTemplate()
      this.$refs['ExcalidrawForm'].$refs['form'].resetFields()
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
