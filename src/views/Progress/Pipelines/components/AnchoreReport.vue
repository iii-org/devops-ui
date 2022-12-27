<template>
  <div ref="table_anchore">
    <table class="test-report">
      <caption>
        <div class="caption">
          <div />
          <el-button
            slot="link"
            type="text"
            icon="el-icon-position"
            :class="hasAnchoreData ? 'linkTextColor' : ''"
            :disabled="!hasAnchoreData"
            @click="openAnchore"
          >
            {{ $t('TestReport.DetailReport') }}
          </el-button>
        </div>
      </caption>
      <tbody>
        <tr>
          <th id="">{{ $t('DevOps.Tools') }}</th>
          <th id="">{{ $t('Anchore.high') }}</th>
          <th id="">{{ $t('Anchore.medium') }}</th>
          <th id="">{{ $t('Anchore.low') }}</th>
          <th id="">{{ $t('Docker.Fixable') }}</th>
        </tr>
        <tr>
          <td>Anchore</td>
          <template v-if="hasAnchoreData">
            <td>
              <span v-if="hasEachItemData('3')">{{ anchore[0].result['3'] }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('2')">{{ anchore[0].result['2'] }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('1')">{{ anchore[0].result['1'] }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('0')">{{ anchore[0].result['0'] }}</span>
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
  name: 'Anchore',
  props: {
    anchore: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasAnchoreData() {
      return !!(this.anchore && this.anchore[0] && this.anchore[0].hasOwnProperty('result'))
    },
    hasEachItemData() {
      return key => !!(this.anchore[0].result.hasOwnProperty(key))
    }
  },
  methods: {
    openAnchore() {
      const { full_log } = this.anchore[0]
      this.showFullLog(full_log)
    },
    showFullLog(log) {
      const wnd = window.open(' ')
      wnd.document.write(log)
    }
  }
}
</script>
