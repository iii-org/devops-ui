<template>
  <div ref="table_harbor">
    <table class="test-report">
      <caption>
        <div class="caption">
          <div />
          <el-button
            slot="link"
            type="text"
            icon="el-icon-position"
            :class="hasClairData ? 'linkTextColor' : ''"
            :disabled="!hasClairData"
            @click="openClair"
          >
            {{ $t('TestReport.DetailReport') }}
          </el-button>
        </div>
      </caption>
      <tbody>
        <tr>
          <th id="">{{ $t('DevOps.Tools') }}</th>
          <th id="">{{ $t('Clair.size') }}</th>
          <th id="">{{ $t('Clair.high') }}</th>
          <th id="">{{ $t('Clair.medium') }}</th>
          <th id="">{{ $t('Clair.low') }}</th>
          <th id="">{{ $t('Docker.Fixable') }}</th>
        </tr>
        <tr>
          <td>Clair</td>
          <template v-if="hasClairData">
            <td>
              <span v-if="hasEachItemData('size')">{{ clair[0].size }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('High')">{{ clair[0].High }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('Medium')">{{ clair[0].Medium }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('Low')">{{ clair[0].Low }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('fixable')">{{ clair[0].fixable }}</span>
              <span v-else>0</span>
            </td>
          </template>
          <template v-else>
            <td colspan="5">{{ $t('general.NoData') }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Clair',
  props: {
    clair: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasClairData() {
      return !!(this.clair && this.clair[0] && this.clair[0].status !== 'failed')
    },
    hasEachItemData() {
      return key => !!(this.clair[0].hasOwnProperty(key))
    }
  },
  methods: {
    openClair() {
      const { project_id, branch, commit } = this.clair[0]
      const routeUrl = this.$router.resolve({
        name: 'DockerReport', params: { projectId: project_id, branch: branch, commitId: commit }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
