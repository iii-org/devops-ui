<template>
  <div class="app-container">
    <ProjectListSelector
      :has-unsaved-changes="hasUnsavedChanges"
      :is-confirm-leave="isConfirmLeave"
      @checkUnsavedChanges="checkShowDialog"
    />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card">
      <el-tab-pane label="Cluster" name="cluster">
        <el-card>
          <Cluster @isClusterFormChanged="checkFormDataChanged" />
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="Registry" name="registry">
        <el-card>
          <Registry @isRegistryFormChanged="checkFormDataChanged" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="$t('general.Warning')"
      :visible.sync="dialogVisible"
      top="40vh"
      width="420px"
      destroy-on-close
    >
      <span>
        <i class="el-icon-warning text-lg" style="color: #E6A23C;" />
        <span class="text-base">{{ $t('Notify.UnSavedChanges') }}</span>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" @click="handleConfirmLeave">{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ProjectListSelector from '@/components/ProjectListSelector'
import Cluster from '@/views/SystemSettings/components/Cluster'
import Registry from '@/views/SystemSettings/components/Registry'

export default {
  name: 'SystemDeploySettings',
  components: { ProjectListSelector, Cluster, Registry },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          console.log('confirm')
          this.isConfirmLeave = true
          next()
        })
        .catch(() => {
          next(false)
        })
    } else {
      next()
    }
  },
  data() {
    return {
      tabActiveName: 'cluster',
      hasUnsavedChanges: false,
      isConfirmLeave: false,
      dialogVisible: false
    }
  },
  methods: {
    checkFormDataChanged(bool) {
      this.hasUnsavedChanges = bool
    },
    checkShowDialog() {
      if (this.isConfirmLeave) return
      this.dialogVisible = true
    },
    handleConfirmLeave() {
      this.dialogVisible = false
      this.isConfirmLeave = true
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  background: #e4ecf7 ;
  color: #3e3f41;
  border-top: 5px solid #3e3f41;
  border-bottom-color: #e4ecf7 ;
  height: 45px;
}

>>> .el-tabs--card>.el-tabs__header .el-tabs__item {
  background: #3e3f41;
  color: #e4ecf7 ;
  border-radius: 5px;
  width: 125%;
  &:hover {
    color: #409eff;
  }
}

>>> .el-tabs__content {
  background: #e4ecf7 ;
  border-radius: 3px;
}

>>> .el-tabs__header {
  margin: 0;
}

>>> .el-tab-pane {
  margin: 15px;
  background: #e4ecf7 ;
}
</style>
