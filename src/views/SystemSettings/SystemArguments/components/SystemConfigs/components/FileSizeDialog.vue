<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="$t('general.Edit') + $t('SystemConfigs.FileSize')"
    width="30%"
    destroy-on-close
    append-to-body
    @closed="onDialogClosed"
  >
    <el-form
      ref="form"
      v-loading="isLoading"
      :model="form"
    >
      <el-form-item
        prop="fileSize"
        :rules="[
          { type: 'number',
            required: true,
            min: 0,
            max: 100,
            message: 'Please type number from 0 to 100'
          }
        ]"
      >
        <el-input
          v-model.number="form.fileSize"
          :placeholder="$t('RuleMsg.PleaseInput') + $t('SystemConfigs.FileSize')"
        >
          <template slot="prepend">{{ $t('SystemConfigs.FileSize') }} :</template>
          <template slot="append">MB</template>
        </el-input>
      </el-form-item>
      <el-form-item class="text-right">
        <el-button
          class="buttonSecondaryReverse"
          :loading="isLoading"
          @click="handleClose"
        >
          {{ $t('general.Close') }}
        </el-button>
        <el-button
          type="primary"
          :loading="isLoading"
          @click="handleUpdateFileSize"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'FileSizeDialog',
  data() {
    return {
      dialogVisible: false,
      isLoading: false,
      form: {
        fileSize: 0
      }
    }
  },
  computed: {
    ...mapGetters(['fileSizeLimit'])
  },
  mounted() {
    this.loadData()
  },
  methods: {
    ...mapActions('app', ['updateFileSize']),
    loadData() {
      this.form.fileSize = Number(this.fileSizeLimit.replace(/\D/g, ''))
    },
    handleUpdateFileSize() {
      this.$refs['form'].validate(async(valid) => {
        if (!valid) return
        this.isLoading = true
        try {
          await this.updateFileSize({ upload_file_size: this.form.fileSize })
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleClose()
        } catch (error) {
          console.error(error)
        } finally {
          this.isLoading = false
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
    },
    onDialogClosed() {
      this.$emit('update')
    }
  }
}
</script>
