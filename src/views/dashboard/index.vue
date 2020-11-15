<template>
  <div class="dashboard-container">
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>{{ $t('Dashboard.UnfinishIssues') }}</span
            ><br />
            <span>&nbsp;</span>
          </div>
          <div class="text item" style="font-size: 40px; text-align: center; height: 86px">
            {{ this.issueNotFinishStatistics }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>{{ $t('Dashboard.IssuesShouldBeClosedWithinThisWeek') }}</span
            ><br />
            <span>{{ $t('Dashboard.Finished') }} / {{ $t('Dashboard.Total') }}</span>
          </div>
          <div class="text item" style="font-size: 40px; text-align: center">
            {{ issueWeekStatistics.closed }}/{{ issueWeekStatistics.closed + issueWeekStatistics.open }}
            <el-progress :percentage="returnPercentage(issueWeekStatistics)" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>{{ $t('Dashboard.IssuesShouldBeClosedWithinThisMonth') }}</span
            ><br />
            <span>{{ $t('Dashboard.Finished') }} / {{ $t('Dashboard.Total') }}</span>
          </div>
          <div class="text item" style="font-size: 40px; text-align: center">
            {{ issueMonthStatistics.closed }}/{{ issueMonthStatistics.closed + issueMonthStatistics.open }}
            <el-progress :percentage="returnPercentage(issueMonthStatistics)" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12" style="margin-top: 10px">
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>{{ $t('Dashboard.AssignIssuesPriority') }}</span>
          </div>
          <priorityPie />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>{{ $t('Dashboard.AssignIssuesProject') }}</span>
          </div>
          <projectPie />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>{{ $t('Dashboard.AssignIssuesType') }}</span>
          </div>
          <typePie />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssueMonthStatistics, getIssueWeekStatistics, getIssueOpenStatistics } from '@/api/issue'
import priorityPie from './components/priority_pie'
import projectPie from './components/project_pie'
import typePie from './components/type_pie'

export default {
  name: 'Dashboard',
  components: {
    priorityPie,
    projectPie,
    typePie
  },
  data() {
    return {
      issueMonthStatistics: { open: '', closed: '-' },
      issueWeekStatistics: { open: '', closed: '-' },
      issueNotFinishStatistics: '-'
    }
  },
  computed: {
    ...mapGetters(['name'])
  },
  mounted() {
    Promise.all([getIssueMonthStatistics(), getIssueWeekStatistics(), getIssueOpenStatistics()]).then((res) => {
      this.issueMonthStatistics = res[0].data
      this.issueWeekStatistics = res[1].data
      this.issueNotFinishStatistics = res[2].data.active_issue_number
    })
  },
  methods: {
    returnPercentage(statistics) {
      const total = parseInt(statistics.closed) + parseInt(statistics.open)
      const closed = parseInt(statistics.closed)
      const p = Math.round((closed / total) * 100)
      return isNaN(p) ? 0 : p
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
