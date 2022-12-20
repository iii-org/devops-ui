<template>
  <div>
    <table class="test-report">
      <caption>
        <div class="caption">
          <div />
          <el-button
            slot="link"
            type="text"
            icon="el-icon-position"
            :class="hasZapData ? 'linkTextColor' : ''"
            :disabled="!hasZapData"
            @click="openZap"
          >
            {{ $t('TestReport.DetailReport') }}
          </el-button>
        </div>
      </caption>
      <tbody>
        <tr>
          <th id="">{{ $t('DevOps.Tools') }}</th>
          <th id="">{{ $t('Zap.high') }}</th>
          <th id="">{{ $t('Zap.medium') }}</th>
          <th id="">{{ $t('Zap.low') }}</th>
          <th id="">{{ $t('general.Info') }}</th>
        </tr>
        <tr>
          <td>Zap</td>
          <template v-if="hasZapData">
            <td>
              <span v-if="hasEachItemData('3')">{{ zap[0].result['3'] }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('2')">{{ zap[0].result['2'] }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('1')">{{ zap[0].result['1'] }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('0')">{{ zap[0].result['0'] }}</span>
              <span v-else>-</span>
            </td>
          </template>
          <template v-else>
            <td colspan="4">{{ $t('general.NoData') }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Zap',
  props: {
    zap: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasZapData() {
      return !!(this.zap && this.zap[0] && this.zap[0].hasOwnProperty('result'))
    },
    hasEachItemData() {
      return key => !!(this.zap[0].result.hasOwnProperty(key))
    }
  },
  methods: {
    openZap() {
      const { full_log } = this.zap[0]
      this.showFullLog(full_log)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
