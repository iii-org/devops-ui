<template>
  <div>
    <slot />
    <el-popover
      placement="bottom"
      trigger="click"
    >
      <el-form v-loading="listLoading">
        <template v-for="dimension in filterOptions">
          <el-form-item :key="dimension.id">
            <div slot="label">
              {{ $t(`Issue.${dimension.value}`) }}
              <el-tag v-if="dimension.value==='fixed_version'" type="info" class="flex-1">
                <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
              </el-tag>
            </div>
            <component :is="dimension.component"
                       v-if="dimension.component"
                       v-model="filterValue[dimension.value]"
                       v-bind="dimension.componentOptions"
                       @change="onChangeFilter"
            />
            <el-select v-else
                       v-model="filterValue[dimension.value]"
                       :placeholder="$t('Issue.Select'+dimension.placeholder)"
                       :disabled="selectedProjectId === -1"
                       filterable
                       clearable
                       :multiple="dimension.value === 'tags'"
                       :collapse-tags="dimension.value === 'tags'"
                       @change="onChangeFilter"
            >
              <el-option
                v-for="item in (dimension.value==='status') ? filterClosedStatus(getOptionsData(dimension.value)) : getOptionsData(dimension.value)"
                :key="(dimension.value==='assigned_to')? item.login: item.id"
                :label="getSelectionLabel(item)"
                :class="{[item.class]:item.class}"
                :value="item.id"
              >
                <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">
          <el-checkbox v-model="displayClosed" @change="onChangeFilter" />
        </el-form-item>
      </el-form>
      <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}
        <i class="el-icon-arrow-down el-icon--right" /></el-button>
    </el-popover>
    <el-divider direction="vertical" />
    <el-input
      v-if="searchVisible"
      id="input-search"
      v-model="keyword"
      prefix-icon="el-icon-search"
      :placeholder="$t('Issue.SearchNameOrAssignee')"
      style="width: 250px;"
      clearable
      @blur="searchVisible=!searchVisible"
      @change="onChangeFilter"
    />
    <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">
      {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
    </el-button>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button size="small" icon="el-icon-close" @click="cleanFilter">
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
    <slot name="download" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { Priority, Status, Tracker } from '@/components/Issue/index'
import { cloneDeep } from 'lodash'

export default {
  name: 'SearchFilter',
  components: { Tracker, Status, Priority },
  props: {
    listLoading: {
      type: Boolean,
      default: false
    },
    filterOptions: {
      type: Array,
      default: () => ([])
    },
    selectionOptions: {
      type: Object,
      default: () => ({})
    },
    prefill: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columns: [],
      filterValue: {},
      originFilterValue: {},
      keyword: null,
      searchVisible: false,
      fixed_version_closed: false,
      displayClosed: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker', 'status', 'priority']),
    isFilterChanged() {
      for (const item of Object.keys(this.originFilterValue)) {
        const checkFilterValue = this.originFilterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.filterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
      for (const item of Object.keys(this.filterValue)) {
        const checkFilterValue = this.filterValue
        if (checkFilterValue[item] === '') {
          delete checkFilterValue[item]
        }
        if (this.originFilterValue[item] !== checkFilterValue[item]) {
          return true
        }
      }
      return !!this.keyword
    },
    listFilter() {
      const result = []
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          if (this.getOptionsData(item) && this.getOptionsData(item).length > 0) {
            if (Array.isArray(this.filterValue[item]) && this.filterValue[item].length > 0) {
              const value = this.getOptionsData(item).filter((search) => (this.filterValue[item].includes(search.id)))
              if (value) {
                result.push(`#${value.map(subItem => this.getSelectionLabel(subItem)).join('/')}`)
              }
            } else {
              const value = this.getOptionsData(item).find((search) => (search.id === this.filterValue[item]))
              if (value) {
                result.push(this.getSelectionLabel(value))
              }
            }
          } else {
            const due_date = this.filterValue[item].map(date => this.$dayjs(date).format('YYYY-MM-DD'))
            result.push(due_date.join('~'))
          }
        }
      })
      return this.$t('general.Filter') + ((result.length > 0) ? ': ' : '') + result.join(', ')
    }
  },
  watch: {
    prefill(value) {
      Object.keys(value).forEach(item => {
        this[item] = value[item]
      })
    }
  },
  methods: {
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = (this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      if (item.hasOwnProperty('login')) {
        result += ' (' + (item.login) + ')'
      }
      return result
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    getOptionsData(option_name) {
      const options = { ...this.selectionOptions, tracker: this.tracker, status: this.status, priority: this.priority }
      return options[option_name]
    },
    async onChangeFilter() {
      this.$emit('change-filter', {
        filterValue: this.filterValue,
        keyword: this.keyword,
        displayClosed: this.displayClosed
      })
    },
    cleanFilter() {
      this.$set(this.$data, 'filterValue', cloneDeep(this.originFilterValue))
      this.keyword = ''
      this.displayClosed = false
      this.onChangeFilter()
    }
  }
}
</script>

<style scoped>

</style>
