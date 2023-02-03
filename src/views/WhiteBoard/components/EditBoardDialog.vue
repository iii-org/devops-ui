<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    top="1vh"
    width="98%"
    append-to-body
    :before-close="onDialogClosed"
  >
    <el-collapse
      v-if="dialogVisible"
      v-model="collapse"
      v-loading="isLoading"
    >
      <el-collapse-item name="1">
        <div
          slot="title"
          class="flex justify-between text-title"
          style="width: -webkit-fill-available;"
        >
          <span class="text-xl" style="margin: auto;">
            {{ row.name }}
          </span>
          {{ $t('general.Settings', { name: $t('Issue.Issue') }) }}
        </div>
        <el-row>
          <el-col :md="22" :span="20">
            <ExcalidrawForm
              ref="ExcalidrawForm"
              :form="form"
            />
          </el-col>
          <el-col :md="2" :span="4">
            <el-button
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
        <div slot="title" class="text-title" style="margin-right: auto;">
          {{ $t('Excalidraw.EditBoard') }}
        </div>
        <div :style="{height:isShowExcalidraw?null:excalidrawHeight+'px'}">
          <iframe
            v-if="isShowExcalidraw"
            title="excalidraw"
            :src="row.url + '#' + userName"
            :height="excalidrawHeight"
            width="100%"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  updateExcalidraw,
  postExcalidrawHistory,
  patchExcalidrawHistory
} from '@/api_v2/excalidraw'
import ExcalidrawForm from '@/views/WhiteBoard/components/ExcalidrawForm'

const formTemplate = () => ({
  issue_ids: [],
  name: ''
})

export default {
  name: 'EditBoardDialog',
  components: { ExcalidrawForm },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      excalidrawHeight: 0,
      isLoading: false,
      isShowExcalidraw: false,
      collapse: [],
      form: formTemplate()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userName']),
    formHeight() {
      return this.collapse.includes('1') ? 0 : 60
    }
  },
  watch: {
    collapse: {
      handler: 'handleHeight'
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleHeight)
    this.init()
    this.handleHistory(true)
  },
  methods: {
    init() {
      this.form.issue_ids = this.row.issue_ids
      this.form.name = this.row.name
      this.collapse = this.row.collapse
    },
    async handleHistory(value) {
      this.isLoading = true
      if (value) {
        await postExcalidrawHistory(this.row.id).then(() => {
          this.isShowExcalidraw = true
        })
      } else {
        await patchExcalidrawHistory(this.row.id)
      }
      this.isLoading = false
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
      window.removeEventListener('resize', this.handleHeight)
      this.handleHistory(false)
      this.$emit('update:dialogVisible', false)
    },
    handleHeight() {
      this.excalidrawHeight = window.innerHeight + this.formHeight - 185
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
