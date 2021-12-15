<template>
  <div>
    <slot />
    <el-popover
      placement="bottom"
      trigger="click"
      @hide="resetSaveFilterButtons"
    >
      <el-form v-loading="listLoading">
        <template v-for="dimension in filterOptions">
          <el-form-item :key="dimension.id">
            <div slot="label">
              {{ $t(`Issue.${dimension.value}`) }}
              <el-tag
                v-if="dimension.value === 'fixed_version'"
                type="info"
                class="flex-1"
              >
                <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
              </el-tag>
            </div>
            <component
              :is="dimension.component"
              v-if="dimension.component"
              v-model="filterValue[dimension.value]"
              v-bind="dimension.componentOptions"
              @change="onChangeFilter"
            />
            <el-select
              v-else
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
                v-for="item in (dimension.value === 'status') ?
                  filterClosedStatus(getOptionsData(dimension.value)) : getOptionsData(dimension.value)"
                :key="(dimension.value === 'assigned_to') ? item.login : item.id"
                :label="getSelectedLabel(item)"
                :class="{[item.class]:item.class}"
                :value="item.id"
              >
                <component
                  :is="dimension.value"
                  v-if="dimension.tag"
                  :name="$t(`Issue.${item.name}`)"
                  :type="item.name"
                />
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item :label="$t('Issue.DisplayClosedIssue')">
          <el-checkbox
            v-model="displayClosed"
            @change="onChangeFilter"
          />
        </el-form-item>
      </el-form>
      <SaveFilterButton
        ref="saveFilterButton"
        type="issue_list"
        :filter-value="filterValueClone"
        :show-button="showSaveFilterButton"
        @update="onCustomFilterAdded"
      />
      <el-button
        v-if="showSaveSettingsButton"
        style="width:100%"
        type="primary"
        @click="onSaveClick"
      >
        {{ $t('general.SaveSettings') }}
      </el-button>
      <el-button
        slot="reference"
        icon="el-icon-s-operation"
        type="text"
      > {{ displayFilterValue }}
        <em class="el-icon-arrow-down el-icon--right" />
      </el-button>
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
    <el-button
      v-else
      type="text"
      icon="el-icon-search"
      @click="searchVisible = !searchVisible"
    >
      {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
    </el-button>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button
        size="small"
        icon="el-icon-close"
        @click="cleanFilter"
      >
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
    <slot name="download" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'

export default {
  name: 'SearchFilter',
  components: {
    Tracker: () => import('@/components/Issue/Tracker'),
    Status: () => import('@/components/Issue/Status'),
    Priority: () => import('@/components/Issue/Priority'),
    SaveFilterButton: () => import('@/components/Issue/components/SaveFilterButton')
  },
  props: {
    listLoading: {
      type: Boolean,
      default: false
    },
    filterOptions: {
      type: Array,
      default: () => []
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
      displayClosed: false,
      showSaveFilterButton: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker', 'status', 'priority']),
    isFilterChanged() {
      return this.checkFilterValue('originFilterValue') || this.checkFilterValue('filterValue') || !!this.keyword
    },
    displayFilterValue() {
      const selectedLabels = this.getSelectedLabels
      const colon = selectedLabels.length > 0 ? ': ' : ''
      const factor = selectedLabels.join(', ')
      return `${this.$t('general.Filter')}${colon}${factor}`
    },
    getSelectedLabels() {
      const selectedLabels = []
      Object.keys(this.filterValue).forEach((item) => {
        if (!this.filterValue[item]) return
        const isArray = Array.isArray(this.filterValue[item]) && this.filterValue[item].length > 0
        isArray ? selectedLabels.push(this.handleArrayLabels(item)) : selectedLabels.push(this.handleLabels(item))
      })
      return selectedLabels
    },
    handleArrayLabels() {
      return function (item) {
        let label = ''
        const value = this.getOptionsData(item).filter((search) => this.filterValue[item].includes(search.id))
        if (value) {
          const joinedString = value.map((subItem) => this.getSelectedLabel(subItem)).join('/')
          label = `#${joinedString}`
        }
        return label
      }
    },
    handleLabels() {
      return function (item) {
        let label = ''
        const value = this.getOptionsData(item).find((search) => search.id === this.filterValue[item])
        if (value) label = this.getSelectedLabel(value)
        return label
      }
    },
    showSaveSettingsButton() {
      const whiteList = ['issue-list']
      const inWhiteList = whiteList.includes(this.$route.name)
      return inWhiteList && !this.showSaveFilterButton
    },
    filterValueClone() {
      return Object.assign({}, this.filterValue, {
        fixed_version_closed: this.fixed_version_closed,
        displayClosed: this.displayClosed
      })
    }
  },
  watch: {
    prefill(value) {
      Object.keys(value).forEach((item) => {
        this[item] = value[item]
      })
    },
    fixed_version_closed() {
      this.onChangeFixedVersionStatus()
    }
  },
  methods: {
    getSelectedLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.getTranslateHeader(item.name)
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ` (${this.getTranslateHeader(item.status)})`
      }
      if (item.hasOwnProperty('login')) {
        result += ` (${item.login})`
      }
      return result
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => item.is_closed === false)
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
    onChangeFixedVersionStatus() {
      this.$emit('change-fixed-version', this.fixed_version_closed)
    },
    cleanFilter() {
      this.$emit('clean-filter')
      this.$set(this.$data, 'filterValue', cloneDeep(this.originFilterValue))
      this.keyword = ''
      this.displayClosed = false
      this.fixed_version_closed = false
      this.onChangeFilter()
      this.onChangeFixedVersionStatus()
    },
    checkFilterValue(key) {
      const comparedKey = this.getComparedKey(key)
      for (const item of Object.keys(this[key])) {
        const checkFilterValue = this[key]
        if (checkFilterValue[item] === '') delete checkFilterValue[item]
        if (this[comparedKey][item] !== checkFilterValue[item]) return true
      }
    },
    getComparedKey(key) {
      return key === 'filterValue' ? 'originFilterValue' : 'filterValue'
    },
    onCustomFilterAdded() {
      this.resetSaveFilterButtons()
      this.$emit('add-custom-filter')
    },
    onSaveClick() {
      this.showSaveFilterButton = true
    },
    resetSaveFilterButtons() {
      this.showSaveFilterButton = false
      // this.$refs.saveFilterButton.reset()
    }
  }
}
</script>

<style scoped>
</style>
