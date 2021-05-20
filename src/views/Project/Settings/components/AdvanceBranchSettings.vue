<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-col>
      <el-row :gutter="10" type="flex" align="middle">
        <el-col :span="2">
          <router-link :to="{ name: 'Project Settings' }">
            <svg-icon icon-class="system-uicons-exit-left" />{{ $t('general.Exit') }}
          </router-link>
        </el-col>
        <el-col :span="16">
          <span class="text-h6">{{ selectedProject.display }}</span>
        </el-col>
        <el-col :span="6" class="text-right">
          <el-input
            v-model="keyword"
            size="small"
            prefix-icon="el-icon-search"
            :style="{ width: '250px' }"
            :placeholder="$t('general.SearchBranch')"
          />
        </el-col>
      </el-row>

      <el-divider />
      <div class="text-right mb-3">
        <el-button size="small" @click="handleReset">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" size="small" @click="updatePipelineBranch">{{ $t('general.Save') }}</el-button>
      </div>
      <el-table :data="filteredData" fit border>
        <el-table-column :label="$t('Git.Branch')" align="center" prop="branch" :width="150" />
        <el-table-column :label="$t('general.Description')" align="center" prop="commit_message" />
        <el-table-column-time :label="$t('general.LastUpdateTime')" prop="commit_time" :min-width="80" />
        <el-table-column v-for="(tool, idx) in testingToolNames" :key="tool.name" align="center">
          <template slot="header" slot-scope="scope">
            <div class="mb-2">{{ tool.name }}</div>
            <el-checkbox
              v-if="listData.length > 1"
              v-model="tool.selectedAll"
              size="small"
              @change="handleSelectAll(tool)"
            />
          </template>
          <template slot-scope="scope">
            <el-checkbox
              v-model="scope.row.testing_tools[idx].enable"
              @change="checkAllSelect(scope.row.testing_tools[idx], scope.row.branch)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPipelineBranch, editPipelineBranch } from '@/api/projects'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import MixinBasicTable from '@/mixins/MixinBasicTable'

export default {
  name: 'AdvanceBranchSettings',
  components: { ElTableColumnTime },
  mixins: [MixinBasicTable],
  data() {
    return {
      services: ['Web', 'Database'],
      dependenceKeys: ['Postman', 'WebInspect', 'ZAP', 'SideeX'],
      listData: [],
      isLoading: false,
      keyword: '',
      searchKeys: ['branch'],
      testingToolNames: [],
      isChanged: false
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.isChanged) {
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
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectRepositoryId() {
      return this.selectedProject.repository_id
    },
    filteredData() {
      const { listData, searchKeys } = this
      const keyword = this.keyword.toLowerCase()
      return listData.filter(data => {
        let result = false
        for (let i = 0; i < searchKeys.length; i++) {
          const columnValue = data[searchKeys[i]].toLowerCase()
          result = result || columnValue.includes(keyword)
          if (result) break
        }
        return result
      })
    }
  },
  mounted() {
    this.fetchPipelineBranch()
  },
  methods: {
    async fetchPipelineBranch() {
      this.isLoading = true
      try {
        const res = await getPipelineBranch(this.selectedProjectRepositoryId)
        this.listData = Object.keys(res.data).map(key => {
          const { commit_message, commit_time, testing_tools } = res.data[key]
          return {
            branch: key,
            commit_message,
            commit_time,
            testing_tools
          }
        })
        this.testingToolNames = this.listData[0].testing_tools.map(tool => ({
          selectedAll: this.checkAllSelected(tool.name),
          name: tool.name
        }))
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },
    checkAllSelected(name) {
      const status = this.filteredData
        .flatMap(i => i.testing_tools)
        .filter(i => i.name === name)
        .map(i => i.enable)
      return status.every(i => i === true)
    },
    async updatePipelineBranch() {
      const sendData = {
        detail: this.listData.reduce(
          (result, cur) =>
            Object.assign(result, {
              [cur.branch]: cur.testing_tools.map(tool => ({ enable: tool.enable, key: tool.key }))
            }),
          {}
        )
      }
      this.isLoading = true
      try {
        await editPipelineBranch(this.selectedProjectRepositoryId, sendData)
        this.isChanged = false
      } catch (err) {
        this.fetchPipelineBranch()
        this.$message({
          title: this.$t('general.Error'),
          message: err,
          type: 'error'
        })
      } finally {
        this.isLoading = false
      }
    },
    handleSelectAll(tool) {
      this.isChanged = true
      const { selectedAll, name } = tool
      this.filteredData.forEach(i =>
        i.testing_tools.forEach(tool => {
          if (tool.name === name) tool.enable = selectedAll
        })
      )
      if (this.dependenceKeys.includes(name)) this.selectAllService(selectedAll)
      if (this.services.includes(name)) this.selectAllDependence(selectedAll)
    },
    selectAllService(selectedAll) {
      if (!selectedAll) return
      const toolList = this.testingToolNames.map(tool => tool.name)
      this.services.forEach(name => {
        if (toolList.includes(name)) {
          this.handleSelectAll({ selectedAll, name })
          this.checkAllSelect({ name })
        }
      })
    },
    selectAllDependence(selectedAll) {
      if (selectedAll) return
      const toolList = this.testingToolNames.map(tool => tool.name)
      this.dependenceKeys.forEach(name => {
        if (toolList.includes(name)) {
          this.handleSelectAll({ selectedAll, name })
          this.checkAllSelect({ name })
        }
      })
    },
    checkAllSelect(tool, branch) {
      const { name, enable } = tool
      this.isChanged = true
      const status = this.filteredData
        .flatMap(i => i.testing_tools)
        .filter(i => i.name === name)
        .map(i => i.enable)
      const value = status.every(i => i === true)
      const idx = this.testingToolNames.findIndex(i => i.name === name)
      this.testingToolNames[idx].selectedAll = value
      this.handleDependence(enable, name, branch)
      if (this.dependenceKeys.includes(name)) this.checkServiceAllSelect()
    },
    checkServiceAllSelect() {
      const toolList = this.testingToolNames.map(tool => tool.name)
      this.services.forEach(name => {
        if (toolList.includes(name)) {
          this.checkAllSelect({ name })
        }
      })
    },
    checkDependenceAllSelect() {
      const toolList = this.testingToolNames.map(tool => tool.name)
      this.dependenceKeys.forEach(name => {
        if (toolList.includes(name)) {
          this.checkAllSelect({ name })
        }
      })
    },
    handleDependence(enable, name, branch) {
      if (!branch) return
      if (this.services.includes(name)) this.selectDependence(enable, branch)
      if (this.dependenceKeys.includes(name)) this.selectServices(enable, branch)
    },
    selectDependence(enable, branch) {
      if (enable) return
      const idx = this.listData.findIndex(item => item.branch === branch)
      this.dependenceKeys.forEach(key => {
        const toolIdx = this.listData[idx].testing_tools.findIndex(item => item.name === key)
        if (toolIdx < 0) return
        this.listData[idx].testing_tools[toolIdx].enable = enable
      })
    },
    selectServices(enable, branch) {
      if (!enable) return
      const idx = this.listData.findIndex(item => item.branch === branch)
      this.services.forEach(key => {
        const toolIdx = this.listData[idx].testing_tools.findIndex(item => item.name === key)
        if (toolIdx < 0) return
        this.listData[idx].testing_tools[toolIdx].enable = enable
      })
    },
    handleReset() {
      this.testingToolNames = []
      this.isChanged = false
      this.fetchPipelineBranch()
    }
  }
}
</script>
