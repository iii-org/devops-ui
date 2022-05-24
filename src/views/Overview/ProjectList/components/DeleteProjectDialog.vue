<template>
  <el-dialog :visible.sync="showDialog" width="40%" :close-on-click-modal="false" @closed="onDialogClosedDelete">
    <div slot="title">{{ `${$t('general.Delete')} 「${deleteProjectObj.name}」 ${$t('Project.Project')}` }}</div>
    <p v-if="projectRelationList.length > 0" class="text-danger">
      {{ $t('Project.deleteHasSonProjectText', [projectRelationList.map((item) => item.name)]) }}
    </p>
    <p class="text-danger">{{ $t('Project.deleteProjectConfirmText') }}</p>
    <p>
      <span>{{ $t('Project.PleaseType') }} </span>
      <span class="text-xl font-semibold text-danger mx-1">{{ deleteProjectObj.name }}</span>
      <span>{{ $t('Project.AndThen') }}</span>
    </p>
    <el-input v-model="confirmProjectName" :placeholder="`Please Input ${deleteProjectObj.name}`" />
    <span slot="footer" class="dialog-footer">
      <el-button id="dialog-btn-cancel" class="buttonSecondaryReverse" :loading="isLoading" @click="showDialog = false">
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
      default: () => ({})
    },
    isForceDelete: {
      type: Boolean,
      default: false
    },
    projectRelationList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showDialog: false,
      isLoading: false,
      confirmProjectName: ''
    }
  },
  methods: {
    ...mapActions('projects', ['deleteProject', 'forceDeleteProject']),
    onDialogClosedDelete() {
      this.confirmProjectName = ''
    },
    async handleDeleteModal() {
      if (this.deleteProjectObj.name !== this.confirmProjectName) {
        return this.$message({
          message: this.$t('Notify.WrongProjectName'),
          type: 'warning'
        })
      } else {
        try {
          this.isLoading = true
          let res = []
          if (this.isForceDelete) {
            res = await this.forceDeleteProject(this.deleteProjectObj.id)
          } else res = await this.deleteProject(this.deleteProjectObj.id)
          if (res.message !== 'success') {
            throw new Error()
          }
          this.$message({
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.$emit('update')
          this.isLoading = false
          this.showDialog = false
        } catch (err) {
          this.isLoading = false
          this.$message({
            message: err,
            type: 'error'
          })
          console.error(err)
        }
      }
    }
  }
}
</script>
