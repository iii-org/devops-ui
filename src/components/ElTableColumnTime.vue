
<template>
  <el-table-column align="center" v-bind="$props">
    <template slot-scope="scope">
      <el-tooltip placement="top" :open-delay="200" :content="scope.row[prop] | UTCtoLocalTime">
        <span>{{ scope.row[prop] | relativeTime }}</span>
      </el-tooltip>
    </template>
  </el-table-column>
</template>

<script>
import i18n from '@/lang'

export default {
  name: 'ElTableColumnTime',
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: i18n.t('general.LastUpdateTime')
    },
    minWidth: {
      type: String,
      default: '130'
    },
    width: {
      type: String,
      default: '130'
    },
    sortable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    UTCtoLocalTime(dateTime) {
      const localTime = this.$dayjs(dateTime)
        .utc()
        .local()
        .format('YYYY-MM-DD HH:mm:ss')
      if (dateTime === 'Invalid date') {
        return '-'
      }
      return localTime
    },
    relativeTime(dateTime) {
      return dateTime
        ? this.$dayjs(dateTime)
          .utc()
          .local()
          .fromNow()
        : '-'
    }
  }
}
</script>
