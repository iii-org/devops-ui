<template>
  <div class="app-container">
    <ProjectListSelector />
    <el-divider />
    <el-tabs v-model="tabActiveName" type="card" :before-leave="checkBeforeLeave">
      <el-tab-pane label="Cluster" name="cluster">
        <el-card>
          <Cluster ref="cluster" />
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="Registry" name="registry">
        <el-card>
          <Registry ref="registry" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ProjectListSelector } from '@/components'
import Cluster from '@/views/SystemSettings/components/Cluster'
import Registry from '@/views/SystemSettings/components/Registry'

export default {
  name: 'SystemDeploySettings',
  components: { ProjectListSelector, Cluster, Registry },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), this.confirm_options)
        .then(() => {
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
      isConfirmLeave: false
    }
  },
  computed: {
    hasUnsavedChanges() {
      return this.$refs.cluster.isFormChanged || this.$refs.registry.isFormChanged
    },
    confirm_options() {
      const options = {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      }
      return options
    }
  },
  watch: {
    tabActiveName(val) {
      this.isConfirmLeave = false
    }
  },
  mounted() {
    this.initTabsStatus()
  },
  methods: {
    checkBeforeLeave() {
      if (this.isConfirmLeave) return true
      if (this.hasUnsavedChanges) return this.showLeaveMessage()
    },
    /*
      if return false or reject(), then it will prevent switching
      return true or resolve() on the contrary
      suggested to return reject() or resolve() because it will sometimes invalid when returned true or false
    */
    showLeaveMessage() {
      const isLeave = new Promise(async(resolve, reject) => {
        return await this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), this.confirm_options)
          .then(() => {
            this.isConfirmLeave = true
            this.initTabsStatus()
            return resolve()
          })
          .catch(() => {
            return reject()
          })
          .finally(() => {
            return reject()
          })
      })
      return isLeave
    },
    initTabsStatus() {
      const tabs = ['registry', 'cluster']
      tabs.forEach(tab => {
        this.$refs[tab].initData()
        this.$refs[tab].showAddPage = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

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
    color: $linkTextColor;
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
