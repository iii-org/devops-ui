<template>
  <el-row class="app-container">
    <ProjectListSelector>
      <el-input
        v-model="keyword"
        :placeholder="$t('general.SearchBranch')"
        prefix-icon="el-icon-search"
        style="width: 250px"
      />
    </ProjectListSelector>
    <el-divider />
    <div class="text-right mb-2">
      <el-button
        type="primary"
        icon="el-icon-refresh"
        size="mini"
        plain
        @click="loadData"
      >
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
    >
      <el-table-column
        align="center"
        :label="$t('Log.testId')"
        prop="task_id"
        min-width="240"
      />
      <el-table-column
        align="center"
        :label="$t('Git.Branch')"
        prop="branch"
      />
      <el-table-column
        align="center"
        :label="$t('Git.Commit')"
      >
        <template slot-scope="scope">
          <el-link
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :href="scope.row.commit_url"
          >
            <svg-icon
              class="mr-1"
              icon-class="ion-git-commit-outline"
            />{{ scope.row.commit_id }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column-tag
        prop="status"
        :label="$t('general.Status')"
        min-width="130"
        location="cmas"
        i18n-key="Cmas"
      />
      <el-table-column
        align="center"
        :label="$t('Cmas.MOEA')"
        width="220"
      >
        <template slot-scope="scope">
          <div>{{ joinSpecification(scope.row, 'MOEA') }}</div>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="OWASP Mobile TOP 10"
        width="200"
      >
        <template slot-scope="scope">
          <div>{{ joinSpecification(scope.row, 'OWASP') }}</div>
        </template>
      </el-table-column>
      <el-table-column-time
        align="center"
        :label="$t('general.RunAt')"
        prop="run_at"
      />
      <el-table-column
        align="center"
        :label="$t('general.Report')"
        width="100"
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.filenames"
            type="primary"
            target="_blank"
            style="font-size: 16px"
            :underline="false"
            icon="el-icon-download"
            @click="fetchCmasReport(scope.row)"
          />
          <div v-else>-</div>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </el-row>
</template>

<script>
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import {
  getCmasScans,
  getCmasScansStatus,
  getCmasReport
} from '@/api/cmas'
import ElTableColumnTag from '@/components/ElTableColumnTag'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'Cmas',
  components: { ElTableColumnTag, ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data() {
    this.levels = ['High', 'Medium', 'Low']
    this.MOEA = ['L3', 'L2', 'L1']
    this.OWASP = ['高', '中', '低']
    return {
      searchKeys: ['branch']
    }
  },
  computed: {
    joinSpecification() {
      return function (row, spec) {
        const arr = this.levels.map((level, index) => {
          if (!row.stats) return
          return `${this[spec][index]} = ${row.stats[spec][level]}`
        })
        return arr[0] ? arr.join(', ') : '-'
      }
    }
  },
  watch: {
    listData(data) {
      if (data.length > 0) {
        this.updateCmasScanStatus(data)
      }
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedRepositoryId === -1) return
      const res = await getCmasScans(this.selectedRepositoryId)
      return res.data
    },
    updateCmasScanStatus(listData) {
      listData.forEach((item) => {
        const { task_id, status } = item
        if (status === 'RUNNING') {
          this.fetchScanStatus(task_id)
          return
        }
      })
    },
    fetchScanStatus(taskId) {
      this.listLoading = true
      getCmasScansStatus(taskId)
        .then((res) => {
          if (res.data.status === 'SUCCESS') {
            this.loadData()
          }
        })
      this.listLoading = false
    },
    fetchCmasReport(row) {
      const file_type = 'pdf'
      const { task_id } = row
      getCmasReport(task_id, file_type)
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', row.filenames.pdf)
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch((error) => console.error(error))
    }
  }
}
</script>
