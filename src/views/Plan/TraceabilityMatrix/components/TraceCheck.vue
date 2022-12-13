<template>
  <div
    id="check-wrapper"
    ref="wrapper"
  >
    <el-alert
      v-if="traceCheck.exception"
      type="error"
      class="mb-4 loading"
      :closable="false"
    >
      <h2 slot="title">
        <em class="el-icon-loading" /> {{ $t('general.Error') }}
        ( {{ traceCheck.current_num }} / {{ traceCheck.total_num }} )
      </h2>
      <h3>{{ traceCheck.exception }}</h3>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <el-alert
      v-else-if="getPercentProgress<100"
      type="warning"
      class="mb-4 loading"
      :closable="false"
    >
      <h2 slot="title">
        <em class="el-icon-loading" /> {{ $t('Track.TraceChecking') }}
        ( {{ traceCheck.current_num }} / {{ traceCheck.total_num }} )
      </h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <div class="text-right">
      <span v-if="traceCheck.start_time">{{ $t('Track.Run_at') }}:
        {{ traceCheck.start_time |relativeTime }}</span>
      <span v-if="traceCheck.finish_time">{{ $t('Track.Running_time') }}:
        {{ $dayjs(traceCheck.finish_time).from($dayjs(traceCheck.start_time), true) }}</span>
    </div>
    <el-table
      :data="traceCheck.result"
      :element-loading-text="$t('Loading')"
      :height="tableHeight"
    >
      <el-table-column
        v-for="track in traceCheckList"
        :key="track"
        :label="$t(`Issue.${track}`)"
        :prop="track"
        show-overflow-tooltip
      >
        <template
          v-if="row[track]"
          slot-scope="{row}"
        >
          <el-link
            v-if="row[track].name"
            @click="onRelationIssueDialog(row[track].id)"
          >
            <template>
              <Status
                :name="$t(`Issue.${row[track].status.name}`)"
                :type="row[track].status.name"
                size="small"
              />
              #{{ row[track].id }} - {{ row[track].name }}
            </template>
          </el-link>
          <template v-else-if="row[track]&&Array.isArray(row[track])">
            <ol>
              <li
                v-for="(item, idx) in row[track]"
                :key="idx"
              >
                <span v-if="item.software_name||item.file_name">
                  <el-tag>{{ item.software_name }}</el-tag>
                  <br>
                  {{ item.file_name }}
                </span>
                <template v-if="item.branch||item.commit_id||item.result">
                  <span v-if="item.result.success||item.result.failure">
                    {{ item.result.success }} / {{ item.result.failure }}
                  </span>
                  <span v-else-if="item.result.casesPassed||item.result.casesTotal">
                    {{ item.result.casesPassed }} / {{ item.result.casesTotal }}
                  </span>
                  <br>
                  {{ item.branch }}
                  <br>
                  {{ item.commit_id }}
                  <br>
                </template>
              </li>
            </ol>
          </template>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getTraceOrderResult } from '@/api/qa'
import { cloneDeep } from 'lodash'
import { Status } from '@/components/Issue'

export default {
  name: 'TraceCheck',
  components: { Status },
  filter: {
    relativeTime(dateTime) {
      return dateTime ? this.$dayjs(dateTime).utc().local().fromNow() : '-'
    }
  },
  props: {
    trackerMapTarget: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      traceCheck: { start_time: '' },
      intervalTimer: null,
      tableHeight: 0
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    traceCheckList() {
      const result = cloneDeep(this.trackerMapTarget.order)
      if (result.includes('Test Plan')) {
        result.splice(result.indexOf('Test Plan') + 1, 0, 'TestFile', 'TestResult')
      }
      return result
    },
    getPercentProgress() {
      return Math.round((this.traceCheck.current_num / this.traceCheck.total_num) * 100)
    }
  },
  mounted() {
    this.loadData()
    this.$nextTick(() => {
      this.tableHeight = this.$refs['wrapper'].clientHeight
    })
    window.onresize = () => {
      this.$nextTick(() => {
        this.tableHeight = this.$refs['wrapper'].clientHeight
      })
    }
  },
  destroyed() {
    this.resetData()
  },
  methods: {
    async loadData() {
      await this.getTraceCheck()
      if (this.traceCheck.current_num === this.traceCheck.total_num || this.traceCheck.exception) {
        if (this.intervalTimer) {
          window.clearInterval(this.intervalTimer)
          this.intervalTimer = null
        }
      } else if (!this.intervalTimer) {
        this.intervalTimer = window.setInterval(this.loadData, 5000)
      }
      return Promise.resolve()
    },
    async getTraceCheck() {
      try {
        const res = await getTraceOrderResult({ project_id: this.selectedProjectId })
        this.traceCheck = res.data
        return Promise.resolve(res.data)
      } catch (e) {
        console.error(e)
        return Promise.reject(e)
      }
    },
    resetData() {
      if (this.intervalTimer) {
        window.clearInterval(this.intervalTimer)
        this.intervalTimer = null
      }
      this.traceCheck = []
      return Promise.resolve()
    },
    onRelationIssueDialog(id) {
      this.$emit('show-issue', id)
    }
  }
}
</script>

<style lang="scss" scoped>
#check-wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px - 60px);
}

.loading {
  >>> .el-alert__content {
    width: 100%;
  }
}
</style>
