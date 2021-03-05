<template>
  <el-dialog
    :title="`${$t('general.Delete')} ${$t('route.Projects')}`"
    :visible.sync="showDialog"
    width="40%"
    :close-on-click-modal="false"
    @closed="onDialogClosedDelete"
  >
    <p>{{ $t('Project.deleteProjectConfirmText') }}</p>
    <p>
      {{ $t('Project.PleaseType') }}
      <strong>{{ deleteProjectObj.name }}</strong>
      {{ $t('Project.AndThen') }}
    </p>
    <el-input v-model="confirmProjectName" :placeholder="`Please Input ${deleteProjectObj.name}`" />
    <span slot="footer" class="dialog-footer">
      <el-button id="dialog-btn-cancel" :loading="isLoading" @click="showDialog = false">
        {{ $t('general.Cancel') }}
      </el-button>
      <el-button id="dialog-btn-delete" type="danger" :loading="isLoading" @click="handleDeleteModal">
        {{ $t('general.Delete') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'DeleteProjectDialog',
  props: {
    deleteProjectObj: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    showDialog: false,
    isLoading: false,
    confirmProjectName: ''
  }),
  methods: {
    ...mapActions('projects', ['deleteProject']),
    onDialogClosedDelete() {
      this.confirmProjectName = ''
    },
    async handleDeleteModal() {
      if (this.deleteProjectObj.name !== this.confirmProjectName) {
        return this.$message({
          title: this.$t('general.Error'),
          message: this.$t('Notify.WrongProjectName'),
          type: 'error'
        })
      } else {
        try {
          this.isLoading = true
          const res = await this.deleteProject(this.deleteProjectObj.id)
          if (res.message !== 'success') {
            throw new Error()
          }
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.$emit('update')
          this.isLoading = false
          this.showDialog = false
        } catch (err) {
          this.isLoading = false
          console.error(err)
        }
      }
    }
  }
}
</script>
