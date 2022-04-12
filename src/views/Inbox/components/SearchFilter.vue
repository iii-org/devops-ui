<template>
  <div>
    <el-popover placement="bottom" trigger="click">
      <h3 style="margin: 0">Absolute time range</h3>
      <el-form :model="filter">
        <el-form-item>
          <div slot="label">From</div>
          <el-date-picker
            v-model="filter.from_date"
            type="date"
            clearable
            align="right"
            placeholder="Pick a day"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions(filter.to_date)"
          />
        </el-form-item>
        <el-form-item>
          <div slot="label">To</div>
          <el-date-picker
            v-model="filter.to_date"
            type="date"
            clearable
            align="right"
            placeholder="Pick a day"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions(filter.from_date)"
          />
        </el-form-item>
        <el-form-item>
          <div slot="label">{{ $t('general.Type') }}</div>
          <el-select
            v-model="filter.alert_ids"
            multiple
            placeholder="Select Type"
          >
            <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isMessageConsole === false">
          <el-checkbox v-model="filter.unread">Unread</el-checkbox>
        </el-form-item>
        <el-form-item v-else-if="isMessageConsole === true">
          <el-checkbox v-model="filter.include_system_message">Include System Message</el-checkbox>
        </el-form-item>
      </el-form>
      <el-button class="w-full buttonPrimary" @click="onChangeFilter">Apply</el-button>
      <el-button slot="reference" icon="el-icon-s-operation" class="headerTextColor" type="text"> {{ displayFilterValue }}
        <em class="el-icon-arrow-down el-icon--right" />
      </el-button>
    </el-popover>
    <el-divider direction="vertical" />
    <el-input
      v-if="searchVisible"
      v-model="keyword"
      style="width: 250px"
      :placeholder="$t('Project.SearchProjectNameOrIdOrManager')"
      prefix-icon="el-icon-search"
      clearable
      @blur="searchVisible=!searchVisible"
    />
    <el-button v-else type="text" icon="el-icon-search" class="headerTextColor" @click="searchVisible=!searchVisible">
      {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
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
  from_date: '',
  to_date: '',
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
    }
  },
  data() {
    return {
      searchVisible: false,
      keyword: '',
      filter: defaultFilter()
    }
  },
  computed: {
    displayFilterValue() {
      const list = []
      this.filter.alert_ids.forEach(item => {
        list.push(this.options.find(x => x.id === item).label)
      })
      const listJoined = list.join(', ')
      return list.length > 0 ? `${this.$t('general.Filter')}: ${listJoined}` : `${this.$t('general.Filter')}`
    },
    isFilterChanged() {
      return !!this.keyword || this.filter.alert_ids.length > 0
    }
  },
  watch: {
    keyword(val) {
      this.$emit('update:keyword', val)
    }
  },
  methods: {
    async onChangeFilter() {
      const cleanFilter = {}
      for (const [key, value] of Object.entries(this.filter)) {
        if (key === 'alert_ids' && this.filter.alert_ids.length > 0) {
          cleanFilter.alert_ids = JSON.stringify(this.filter.alert_ids)
        } else if (key !== 'alert_ids' && value !== defaultFilter()[key]) {
          cleanFilter[key] = this.filter[key]
        }
      }
      this.$emit('changeFilter', cleanFilter)
    },
    cleanFilter() {
      this.keyword = ''
      this.filter = defaultFilter()
      this.onChangeFilter()
    },
    pickerOptions() {
      const _this = this
      return {
        disabledDate(date) {
          if (_this.dateTo) {
            return date > new Date(_this.dateTo) || date < new Date(_this.dateFrom)
          }
          if (_this.dateFrom) {
            const setAfterDate = new Date(_this.dateFrom)
            return date < setAfterDate.setDate(setAfterDate.getDate() - 1) || date < setAfterDate.setDate(setAfterDate.getDate() + 1)
          }
          return false
        }
      }
    }
  }
}
</script>
