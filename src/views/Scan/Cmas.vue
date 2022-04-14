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
        class="buttonPrimaryReverse"
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
            class="linkTextColor"
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
      <el-table-column
        prop="status"
        :label="$t('general.Status')"
        min-width="130"
        align="center"
      >
        <template slot-scope="scope">
          <el-tooltip
            :disabled="scope.row.logs === null"
            placement="bottom"
          >
            <template slot="content">
              <p class="tooltip">{{ scope.row.logs }}</p>
            </template>
            <el-tag
              v-if="scope.row.status"
              :type="handleType(scope.row.status)"
              class="el-tag--circle"
              :effect="getTagEffect(scope.row.status)"
            >
              <span>{{ $t(`Cmas.${scope.row.status}`) }}</span>
            </el-tag>
            <span v-else>-</span>
          </el-tooltip>
        </template>
      </el-table-column>
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
            class="linkTextColor"
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
import ElTableColumnTime from '@/components/ElTableColumnTime'
import * as elementTagType from '@/utils/element-tag-type'

export default {
  name: 'Cmas',
  components: { ElTableColumnTime },
  mixins: [MixinElTableWithAProject],
  data() {
    this.levels = ['High', 'Medium', 'Low']
    this.MOEA = ['L3', 'L2', 'L1']
    this.OWASP = [this.$t('general.High'), this.$t('general.Medium'), this.$t('general.Low')]
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
        return !arr.includes(undefined) ? arr.join(', ') : '-'
      }
    }
  },
  watch: {
    listData(data) {
      if (data.length > 0) {
        this.updateCmasScanStatus(data)
      }
    },
    '$i18n.locale'() {
      this.setI18n()
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
    },
    setI18n() {
      this.OWASP = [
        this.$t('general.High'),
        this.$t('general.Medium'),
        this.$t('general.Low')
      ]
    },
    handleType(prop) {
      return elementTagType['cmas'][prop] || 'default'
    },
    getTagEffect(status) {
      const tagMap = { Building: 'light' }
      return tagMap[status] || 'dark'
    }
  }
}
</script>

<style scoped>
.tooltip {
  max-width: 500px;
  margin: 0;
  text-align: center;
}
</style>
