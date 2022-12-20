<template>
  <div>
    <table class="test-report">
      <caption>
        <div class="caption">
          <div />
          <el-button
            slot="link"
            type="text"
            icon="el-icon-tickets"
            :class="hasWebInspectData ? 'linkTextColor' : ''"
            :disabled="!hasWebInspectData"
            @click="openWebInspect"
          >
            {{ $t('TestReport.DetailReport') }}
          </el-button>
        </div>
      </caption>
      <tbody>
        <tr>
          <th id="">{{ $t('DevOps.Tools') }}</th>
          <th id="">{{ $t('WebInspect.Critical') }}</th>
          <th id="">{{ $t('WebInspect.HighSeverity') }}</th>
          <th id="">{{ $t('WebInspect.MediumSeverity') }}</th>
          <th id="">{{ $t('WebInspect.LowSeverity') }}</th>
          <th id="">{{ $t('WebInspect.InfoSeverity') }}</th>
          <th id="">{{ $t('WebInspect.BpSeverity') }}</th>
        </tr>
        <tr>
          <td>WebInspect</td>
          <template v-if="hasWebInspectData">
            <td>
              <span v-if="hasEachItemData('criticalCount')">
                {{ webInspect[0].stats.criticalCount }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('highCount')">
                {{ webInspect[0].stats.highCount }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('mediumCount')">
                {{ webInspect[0].stats.mediumCount }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('lowCount')">
                {{ webInspect[0].stats.lowCount }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('infoCount')">
                {{ webInspect[0].stats.infoCount }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('bpCount')">
                {{ webInspect[0].stats.bpCount }}
              </span>
              <span v-else>-</span>
            </td>
          </template>
          <template v-else>
            <td colspan="6">{{ $t('general.NoData') }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Webinspect',
  props: {
    webinspect: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasWebInspectData() {
      return !!(this.webinspect && this.webinspect[0] && this.webinspect[0].hasOwnProperty('stats'))
    },
    hasEachItemData() {
      return key => !!(this.webinspect[0].stats.hasOwnProperty(key))
    }
  },
  methods: {
    openWebInspect() {
      const { scan_id, run_at } = this.webinspect[0]
      const routeUrl = this.$router.resolve({
        name: 'WIEReportViewer', params: { scanId: scan_id, run_at }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
