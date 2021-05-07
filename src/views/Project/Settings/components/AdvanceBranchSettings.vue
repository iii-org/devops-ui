<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-col>
      <router-link :to="{ name: 'Project Settings' }">
        <svg-icon icon-class="system-uicons-exit-left" class="mr-2" />{{ $t('general.Exit') }}
      </router-link>
      <div class="d-flex justify-space-between align-center mt-2">
        <div class="text-h6">{{ selectedProject.display }}</div>
        <el-input
          v-model="keyword"
          size="medium"
          prefix-icon="el-icon-search"
          :style="{ width: '250px' }"
          :placeholder="$t('general.SearchBranch')"
        />
      </div>
      <el-divider />
      <el-table :data="filteredData" border fit>
        <el-table-column :label="$t('Git.Branch')" align="center" prop="branch" :width="150" />
        <el-table-column :label="$t('general.Description')" align="center" prop="commit_message" />
        <el-table-column-time :label="$t('general.LastUpdateTime')" prop="commit_time" :min-width="80" />
        <el-table-column v-for="(tool, idx) in testingToolNames" :key="tool.name" align="center">
          <template slot="header">
            <div class="mb-1">{{ tool.name }}</div>
            <!-- <el-checkbox v-model="tool.checkAll" @change="handleCheckAllChange(idx)" /> -->
          </template>
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.testing_tools[idx].enable" @change="updatePipelineBranch" />
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
import { getPipelineBranch, editPipelineBranch } from '@/api/projects'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { mapGetters } from 'vuex'
import MixinBasicTable from '@/mixins/MixinBasicTable'

export default {
  name: 'AdvanceBranchSettings',
  components: { ElTableColumnTime },
  mixins: [MixinBasicTable],
  data() {
    return {
      listData: [],
      testingToolNames: [],
      isAllSelected: [],
      isLoading: false,
      keyword: '',
      searchKeys: ['branch']
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
        this.testingToolNames = this.listData[0].testing_tools.map((tool, idx) => ({
          checkAll: false,
          name: tool.name
        }))
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoading = false
      }
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
    }
    // handleCheckAllChange(idx) {
    //   console.log(idx)
    // }
  }
}
</script>
