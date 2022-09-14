<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    top="1vh"
    width="98%"
    append-to-body
    @closed="onDialogClosed"
  >
    <el-collapse v-if="dialogVisible" v-model="isCollapse">
      <el-collapse-item name="1">
        <div slot="title" style="margin-left: auto;">
          <div class="text-title">
            {{ $t('general.Settings', { name: $t('Issue.Issue') }) }}
          </div>
        </div>
        <el-row>
          <el-col :md="22" :span="20">
            <ExcalidrawForm
              ref="ExcalidrawForm"
              :form="form"
              :is-loading="isLoading"
            />
          </el-col>
          <el-col :md="2" :span="4">
            <el-button
              :loading="isLoading"
              type="primary"
              size="medium"
              @click="handleEdit"
            >
              {{ $t('general.Confirm') }}
            </el-button>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item name="2">
        <div slot="title" style="margin-right: auto;">
          <div class="text-title">
            {{ $t('Excalidraw.EditBoard') }}
          </div>
        </div>
        <iframe
          title="excalidraw"
          :src="row.url + '#' + userName"
          :height="excalidrawHeight"
          width="100%"
        />
      </el-collapse-item>
    </el-collapse>
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
      excalidrawHeight: 0,
      isLoading: false,
      isCollapse: [],
      row: {},
      form: formTemplate()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userName'])
  },
  watch: {
    row(value) {
      if (Object.keys(value).length > 0) {
        this.form.issue_ids = value.issue_ids
        this.form.name = value.name
      }
    }
  },
  mounted() {
    this.handleHeight()
    window.addEventListener('resize', this.handleHeight)
  },
  destroyed() {
    window.removeEventListener('resize', this.handleHeight)
  },
  methods: {
    handleHeight() {
      this.excalidrawHeight = window.innerHeight - 185
    },
    handleEdit() {
      this.$refs['ExcalidrawForm'].$refs['form'].validate(async(valid) => {
        if (valid) {
          this.isLoading = true
          try {
            const sendData = new FormData()
            sendData.append('name', this.form.name)
            sendData.append('issue_ids', this.form.issue_ids || '')
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
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__header {
  padding: 0;
}

>>> .el-dialog__body {
  padding: 0 3rem 0 10px;
}

>>> .el-collapse-item__content {
  padding-bottom: 0;
}

>>> .el-collapse-item__arrow {
  margin-left: 8px;
}
</style>
