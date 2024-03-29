<template>
  <el-row
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    class="app-container"
  >
    <el-col>
      <el-row
        :gutter="10"
        type="flex"
        align="middle"
      >
        <el-col :span="2">
          <el-button
            type="text"
            size="medium"
            icon="el-icon-arrow-left"
            class="text-title linkTextColor"
            @click="handleBack"
          >
            {{ $t('general.Back') }}
          </el-button>
        </el-col>
        <el-col :span="16">
          <span class="text-title">
            {{ selectedProject.display }}
          </span>
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
      <div class="flex justify-between mb-3">
        <div
          style="color: red; font-size: 12px;"
          class="mt-3"
        >
          {{ isShowWarning ? $t('Notify.pluginRepeatMessage') : '' }}
        </div>
        <div>
          <el-button
            class="buttonSecondaryReverse"
            size="small"
            @click="handleReset"
          >
            {{ $t('general.Cancel') }}
          </el-button>
          <el-button
            class="buttonPrimary"
            size="small"
            :disabled="isShowWarning"
            @click="updatePipelineBranch"
          >
            {{ $t('general.Save') }}
          </el-button>
        </div>
      </div>
      <el-table
        ref="tableData"
        :data="filteredData"
        :cell-style="cellStyle"
        fit
      >
        <el-table-column
          :label="$t('Git.Branch')"
          align="center"
          prop="branch"
          width="100"
        />
        <el-table-column
          :label="$t('general.Description')"
          align="center"
          prop="commit_message"
          show-overflow-tooltip
          min-width="120"
        />
        <el-table-column-time
          :label="$t('general.LastUpdateTime')"
          prop="commit_time"
          width="160"
        />
        <el-table-column
          v-for="(tool, idx) in testingToolNames"
          :key="`${tool.name}-${idx}`"
          align="center"
          width="120"
        >
          <template slot="header" slot-scope="scope">
            <div class="mb-2">{{ tool.name }}</div>
            <el-checkbox
              v-if="listData.length > 1"
              v-model="tool.selectedAll"
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
import { getPipelineBranch, editPipelineBranch } from '@/api/projects'
import { BasicData, SearchBar, Pagination, Table } from '@/mixins'
import { ElTableColumnTime } from '@/components'

export default {
  name: 'AdvanceBranchSettings',
  components: { ElTableColumnTime },
  mixins: [BasicData, SearchBar, Pagination, Table],
  data() {
    return {
      isLoading: false,
      searchKeys: ['branch'],
      testingToolNames: [],
      isChanged: false
    }
  },
  computed: {
    // count the frequency of each plugin appeared by row
    // for example: [
    //  { Web: 2, Sonarqube: 1, Checkmarx: 1, ...},
    //  { Web: 1, Sonarqube: 1, Checkmarx: 1, ...}
    // ]
    countFrequency() {
      return this.listData.map(item => item.testing_tools.reduce((preVal, curVal) => {
        if (curVal.name in preVal) preVal[curVal.name]++
        else preVal[curVal.name] = 1
        return preVal
      }, {}))
    },
    // find the repeat plugin name by row
    repeatPlugins() {
      const repeatPlugins = []
      this.countFrequency.forEach((plugin, index) => {
        Object.keys(plugin).forEach(item => {
          if (this.countFrequency[index][item] > 1) {
            repeatPlugins.push(item)
          }
        })
      })
      return repeatPlugins
    },
    // if the enable values of repeat plugins are not the same, showWarning will be true
    // rowShowWarning gets the showWarning by row
    showWarning() {
      let showWarning = false
      const rowShowWarning = []
      this.listData.forEach(item => {
        item.testing_tools.reduce((preVal, curVal) => {
          const enable = 'enable'
          const hasProperty = preVal.hasOwnProperty(curVal.name)
          if (hasProperty && preVal[curVal.name] !== curVal[enable]) showWarning = true
          else showWarning = false
          preVal[curVal.name] = curVal[enable]
          return preVal
        }, {})
        rowShowWarning.push(showWarning)
      })
      return rowShowWarning
    },
    isShowWarning() {
      return this.showWarning.find(item => item)
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
  mounted() {
    this.fetchPipelineBranch()
  },
  methods: {
    async fetchPipelineBranch() {
      this.isLoading = true
      try {
        const param = {
          all_data: true
        }
        const res = await getPipelineBranch(this.selectedRepositoryId, param)
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
      if (this.isShowWarning) {
        this.showWarningMessage()
        return
      }
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
        await editPipelineBranch(this.selectedRepositoryId, sendData)
        this.isChanged = false
      } catch (err) {
        this.$message({
          title: this.$t('general.Error'),
          message: err,
          type: 'error'
        })
      } finally {
        this.fetchPipelineBranch()
        this.isLoading = false
      }
    },
    handleSelectAll(tool) {
      this.isChanged = true
      const { selectedAll, name } = tool
      this.filteredData.forEach(i =>
        i.testing_tools.forEach(testingTool => {
          if (testingTool.name === name) testingTool.enable = selectedAll
        })
      )
    },
    checkAllSelect(tool) {
      const { name } = tool
      this.isChanged = true
      const status = this.filteredData
        .flatMap(i => i.testing_tools)
        .filter(i => i.name === name)
        .map(i => i.enable)
      const value = status.every(i => i === true)
      const idx = this.testingToolNames.findIndex(i => i.name === name)
      this.testingToolNames[idx].selectedAll = value
    },
    handleReset() {
      this.testingToolNames = []
      this.isChanged = false
      this.fetchPipelineBranch()
    },
    handleBack() {
      this.$router.push({ name: 'ProjectSettings', params: { projectName: this.selectedProject.name }})
    },
    showWarningMessage() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.pluginWarnNotifications'),
        type: 'warning'
      })
    },
    cellStyle(cell) {
      const style = {}
      // there are 3 columns in the front of data columns now
      const columnIndex = cell.columnIndex - 3
      const rowIndex = cell.rowIndex
      const name = columnIndex >= 0 ? cell.row.testing_tools[columnIndex].name : ''
      if (name === this.repeatPlugins[rowIndex] && this.showWarning[rowIndex]) style['background-color'] = '#F9CECE'
      return style
    }
  }
}
</script>
