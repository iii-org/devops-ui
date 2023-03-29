<template>
  <div>
    <el-button
      v-if="isMessageConsole === false"
      :disabled="isReadDisable"
      size="small"
      class="buttonPrimary"
      @click="handleReadAll"
    >
      <em class="ri-mail-check-fill" />
      {{ $t('Inbox.ReadAll') }}
    </el-button>
    <el-popover placement="bottom" trigger="click">
      <h3 style="margin: 0">{{ $t('Inbox.TimeRange') }}</h3>
      <el-form :model="filter">
        <el-form-item>
          <div slot="label">{{ $t('Inbox.From') }}</div>
          <el-date-picker
            v-model="filter.from_date"
            type="date"
            clearable
            align="right"
            :placeholder="$t('Inbox.SelectDate')"
            value-format="yyyy-MM-dd"
            :picker-options="{
              disabledDate(date) {
                if (filter.to_date) {
                  return date > new Date(filter.to_date)
                }
                return false
              }
            }"
          />
        </el-form-item>
        <el-form-item>
          <div slot="label">{{ $t('Inbox.To') }}</div>
          <el-date-picker
            v-model="filter.to_date"
            type="date"
            clearable
            align="right"
            :placeholder="$t('Inbox.SelectDate')"
            value-format="yyyy-MM-dd"
            :picker-options="{
              disabledDate(date) {
                if (filter.from_date) {
                  return (
                    date < new Date(filter.from_date).setDate(
                      new Date(filter.from_date).getDate() - 1)
                  )
                }
                return false
              }
            }"
          />
        </el-form-item>
        <el-form-item>
          <div slot="label">{{ $t('general.Type') }}</div>
          <el-select v-model="filter.alert_ids" multiple :placeholder="$t('Inbox.SelectMessageType')">
            <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isMessageConsole === false">
          <el-checkbox v-model="filter.unread">{{ $t('Inbox.Unread') }}</el-checkbox>
        </el-form-item>
        <el-form-item v-else-if="isMessageConsole === true">
          <el-checkbox v-model="filter.include_system_message">{{ $t('Inbox.IncludeSystemMessage') }}</el-checkbox>
        </el-form-item>
      </el-form>
      <el-button class="w-full buttonPrimary" @click="onChangeFilter">{{ $t('Inbox.Apply') }}</el-button>
      <el-button slot="reference" icon="el-icon-s-operation" class="headerTextColor" type="text">
        {{ displayFilterValue }}
        <em class="el-icon-arrow-down el-icon--right" />
      </el-button>
    </el-popover>
    <el-divider direction="vertical" />
    <el-input
      v-if="searchVisible"
      v-model="keyword"
      style="width: 250px"
      :placeholder="$t('Inbox.SearchLabel')"
      prefix-icon="el-icon-search"
      clearable
      @blur="searchVisible = !searchVisible"
    />
    <el-button v-else type="text" icon="el-icon-search" class="headerTextColor" @click="searchVisible = !searchVisible">
      {{ $t('general.Search') + (keyword ? ': ' + keyword : '') }}
    </el-button>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button size="small" icon="el-icon-close" class="buttonSecondaryReverse" @click="cleanFilter">
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
  </div>
</template>

<script>
const defaultFilter = () => ({
  from_date: null,
  to_date: null,
  unread: false,
  include_system_message: false,
  alert_ids: []
})

export default {
  name: 'SearchFilter',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    isMessageConsole: {
      type: Boolean,
      default: false
    },
    isReadDisable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      searchVisible: false,
      keyword: '',
      filter: defaultFilter(),
      filterList: []
    }
  },
  computed: {
    displayFilterValue() {
      const list = []
      this.filter.alert_ids.forEach((item) => {
        list.push(this.options.find((x) => x.id === item).label)
      })
      if (this.filter.from_date !== null && this.filter.to_date !== null) {
        list.push(`${this.filter.from_date} - ${this.filter.to_date}`)
      } else {
        if (this.filter.from_date !== null) {
          list.push(`${this.filter.from_date}`)
        }
        if (this.filter.to_date !== null) {
          list.push(`${this.filter.to_date}`)
        }
      }
      if (this.filter.include_system_message) {
        list.push(this.$t('Inbox.IncludeSystemMessage'))
      }
      const listJoined = list.join(', ')
      return list.length > 0 ? `${this.$t('general.Filter')}: ${listJoined}` : `${this.$t('general.Filter')}`
    },
    isFilterChanged() {
      return this.displayFilterValue.search(':') !== -1
    }
  },
  watch: {
    keyword(val) {
      this.$emit('update:keyword', val)
    }
  },
  methods: {
    async onChangeFilter() {
      const cleanFilter = JSON.parse(JSON.stringify(this.filter))
      for (const key of Object.keys(this.filter)) {
        if (key === 'alert_ids' && this.filter.alert_ids.length > 0) {
          cleanFilter.alert_ids = JSON.stringify(this.filter.alert_ids)
        }
      }
      this.$emit('changeFilter', cleanFilter)
    },
    cleanFilter() {
      this.keyword = ''
      this.filter = defaultFilter()
      this.$emit('changeFilter')
      // this.onChangeFilter()
    },
    handleReadAll() {
      this.$emit('readAll')
    }
  }
}
</script>
