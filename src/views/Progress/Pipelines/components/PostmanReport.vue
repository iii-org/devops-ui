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
            :class="hasPostmanData ? 'linkTextColor' : ''"
            :disabled="!hasPostmanData"
            @click="openPostman"
          >
            {{ $t('TestReport.DetailReport') }}
          </el-button>
        </div>
      </caption>
      <tbody>
        <tr>
          <th id="">{{ $t('DevOps.Tools') }}</th>
          <th id="">{{ $t('Postman.TestPass') }}</th>
          <th id="">{{ $t('Postman.TestFail') }}</th>
        </tr>
        <tr>
          <td>Postman</td>
          <template v-if="hasPostmanData">
            <td>
              <span v-if="hasEachItemData('success')">{{ postman[0].success }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="hasEachItemData('failure')">{{ postman[0].failure }}</span>
              <span v-else>-</span>
            </td>
          </template>
          <template v-else>
            <td colspan="2">{{ $t('general.NoData') }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Postman',
  props: {
    postman: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasPostmanData() {
      return !!(
        this.postman &&
        this.postman[0] &&
        (this.hasEachItemData('success') || this.hasEachItemData('failure'))
      )
    },
    hasEachItemData() {
      return key => !!(this.postman[0].hasOwnProperty(key))
    }
  },
  methods: {
    openPostman() {
      const { id } = this.postman[0]
      const routeUrl = this.$router.resolve({
        name: 'PostmanTestCase', params: { id }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
