<template>
  <div>
    <el-alert v-if="traceCheck.exception" type="error" class="mb-4 loading" :closable="false">
      <h2 slot="title">
        <i class="el-icon-loading" /> {{ $t('general.Error') }}
        ( {{ traceCheck.current_num }} / {{ traceCheck.total_num }} )
      </h2>
      <h3>{{ traceCheck.exception }}</h3>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <el-alert v-else-if="getPercentProgress<100" type="warning" class="mb-4 loading" :closable="false">
      <h2 slot="title">
        <i class="el-icon-loading" /> {{ $t('Track.TraceChecking') }}
        ( {{ traceCheck.current_num }} / {{ traceCheck.total_num }} )
      </h2>
      <el-progress :percentage="getPercentProgress" />
    </el-alert>
    <div class="text-right">
      <span v-if="traceCheck.start_time">執行時間:{{ traceCheck.start_time |relativeTime }}</span>
      <span v-if="traceCheck.finish_time">運算時間:{{ $dayjs(traceCheck.finish_time).from($dayjs(traceCheck.start_time)) }}</span>
    </div>
    <el-table :data="traceCheck.result" height="60vh" style="width: 100%">
      <el-table-column v-for="track in traceCheckList" :key="track" :label="$t(`Issue.${track}`)" :prop="track"
                       show-tooltip-when-overflow
      >
        <template v-if="row[track]" slot-scope="{row}">
          <el-link v-if="row[track].name" @click="onRelationIssueDialog(row[track].id)">
            <template>
              <status :name="row[track].status.name" size="small" />
              #{{ row[track].id }} - {{ row[track].name }}
            </template>
          </el-link>
          <template v-else-if="row[track]&&Array.isArray(row[track])">
            <ol>
              <li v-for="(item, idx) in row[track]" :key="idx">
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
    <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close
               :before-close="handleRelationIssueDialogBeforeClose"
    >
      <ProjectIssueDetail v-if="relationIssue.visible"
                          ref="children"
                          :props-issue-id="relationIssue.id"
                          :is-in-dialog="true"
                          @update="handleRelationUpdate"
                          @delete="handleRelationUpdate"
      />
    </el-dialog>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import ProjectIssueDetail from '@/views/Plugin/QA/views/Project/IssueDetail'
import Status from '@/components/Issue/Status'
import { getTraceOrderResult } from '@/views/Plugin/QA/api/qa'
import { mapGetters } from 'vuex'

export default {
  name: 'TraceCheck',
  components: { ProjectIssueDetail, Status },
  filter: {
    relativeTime(dateTime) {
      return dateTime
        ? this.$dayjs(dateTime)
          .utc()
          .local()
          .fromNow()
        : '-'
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
      relationIssue: {
        visible: false,
        id: null
      },
      intervalTimer: null
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
    },
    async getTraceCheck() {
      try {
        const res = await getTraceOrderResult({ project_id: this.selectedProjectId })
        this.traceCheck = res.data
        return Promise.resolve(res.data)
      } catch (e) {
        console.log(e)
        return Promise.reject(e)
      }
    },
    resetData() {
      if (this.intervalTimer) {
        window.clearInterval(this.intervalTimer)
        this.intervalTimer = null
      }
      this.traceCheck = []
    },
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
    },
    handleRelationUpdate() {
      this.onCloseRelationIssueDialog()
      this.initChart()
      this.$emit('update-issue')
    },
    handleRelationIssueDialogBeforeClose(done) {
      if (this.$refs.children.hasUnsavedChanges()) {
        this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            done()
          })
          .catch(() => {
          })
      } else {
        done()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  > > > .el-alert__content {
    width: 100%;
  }
}
</style>
