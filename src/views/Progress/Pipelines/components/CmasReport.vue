<template>
  <div>
    <ToolBar>
      <span slot="toolName">CMAS</span>
      <el-button
        slot="link"
        type="text"
        icon="el-icon-download"
        :disabled="disabled"
        @click="openCmas"
      >
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_cmas"
      v-loading="listLoading"
      class="mb-10"
      :element-loading-text="$t('Loading')"
      :data="cmas"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">CMAS</el-table-column>
      <el-table-column align="center" :label="$t('Cmas.MOEA')">
        <template slot-scope="scope">
          <div v-if="scope.row && scope.row.MOEA">{{ joinSpecification(scope.row, 'MOEA') }}</div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="OWASP Mobile TOP 10">
        <template slot-scope="scope">
          <div v-if="scope.row && scope.row.OWASP">{{ joinSpecification(scope.row, 'OWASP') }}</div>
          <div v-else>-</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'
import { getCmasReport } from '@/api/cmas'

export default {
  name: 'Cmas',
  components: { ToolBar },
  props: {
    cmas: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.levels = ['High', 'Medium', 'Low']
    this.MOEA = ['L3', 'L2', 'L1']
    this.OWASP = ['高', '中', '低']
    return {}
  },
  computed: {
    disabled() {
      return this.cmas[0] ? Object.keys(this.cmas[0]).length === 0 : true
    },
    joinSpecification() {
      return function (row, spec) {
        const arr = this.levels.map((level, index) => {
          return `${this[spec][index]} = ${row[spec][level]}`
        })
        return arr[0] ? arr.join(', ') : '-'
      }
    }
  },
  methods: {
    async openCmas() {
      const file_type = 'pdf'
      const { task_id } = this.cmas
      getCmasReport(task_id, file_type)
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', this.cmas.filenames.pdf)
          document.body.appendChild(link)
          link.click()
          link.remove()
        })
        .catch((error) => console.error(error))
    }
  }
}
</script>
