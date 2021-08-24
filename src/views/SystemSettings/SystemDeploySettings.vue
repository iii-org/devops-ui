<template>
  <div class="app-container">
    <ProjectListSelector />
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
      hasUnsavedChanges: false
    }
  },
  methods: {
    checkFormDataChanged(bool) {
      this.hasUnsavedChanges = true
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs--card>.el-tabs__header .el-tabs__item.is-active {
  background: #c5c8cc;
  color: #3e3f41;
  border-top: 5px solid #3e3f41;
  border-bottom-color: #c5c8cc;
  height: 45px;
}

>>> .el-tabs--card>.el-tabs__header .el-tabs__item {
  background: #3e3f41;
  color: #c5c8cc;
  border-radius: 5px;
  width: 125%;
  &:hover {
    color: #409eff;
  }
}

>>> .el-tabs__content {
  background: #c5c8cc;
  border-radius: 3px;
}

>>> .el-tabs__header {
  margin: 0;
}

>>> .el-tab-pane {
  margin: 15px;
  background: #c5c8cc;
}
</style>
