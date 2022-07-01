<template>
  <el-dialog
    :title="$t('Excalidraw.EditBoard')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :fullscreen="true"
    @closed="onDialogClosed"
  >
    <ExcalidrawForm
      ref="ExcalidrawForm"
      :form="form"
      :is-loading="isLoading"
    />
    <el-collapse v-if="dialogVisible" v-model="isCollapse">
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
import ExcalidrawForm from '@/views/WhiteBoard/components/ExcalidrawForm'

const formTemplate = () => ({
  issue_ids: [],
  name: ''
})

export default {
  name: 'EditBoardDialog',
  components: { ExcalidrawForm },
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
    ...mapGetters(['selectedProjectId', 'userName']),
    computedItemHeight() {
      return window.innerHeight - Array.from(document.querySelectorAll('.el-collapse-item'))
        .reduce((s, el) => {
          return s + el.children[0].offsetHeight
        }, 0)
    }
  },
  watch: {
    row(value) {
      if (Object.keys(value).length > 0) {
        this.form.issue_ids = value.issue_ids
        this.form.name = value.name
      }
    },
    dialogVisible(value) {
      if (value) {
        window.history.pushState(null, '')
      } else {
        window.history.back()
      }
    }
  },
  mounted() {
    window.addEventListener('popstate', this.goBackConfirm, false)
  },
  destroyed() {
    window.removeEventListener('popstate', this.goBackConfirm, false)
  },
  methods: {
    handleEdit() {
      this.$refs['ExcalidrawForm'].$refs['form'].validate(async(valid) => {
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
            this.isLoading = false
            this.$emit('update')
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
      this.row = {}
      this.$refs['ExcalidrawForm'].$refs['form'].resetFields()
      this.dialogVisible = false
    },
    goBackConfirm() {
      if (this.dialogVisible) {
        this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        }).then(() => {
          window.history.back()
        }).catch(() => {
          window.history.pushState(null, '')
        })
      }
    }
  }
}
</script>

<style>
</style>
