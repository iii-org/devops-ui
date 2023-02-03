<template>
  <div>
    <slot />
    <el-popover
      popper-class="popper"
      placement="bottom"
      trigger="click"
      @hide="resetSaveFilterButtons"
    >
      <el-form v-loading="listLoading">
        <template v-for="dimension in filterOptionsWithProject">
          <el-form-item :key="dimension.id">
            <div slot="label">
              {{ $t(`Issue.${dimension.value}`) }}
              <el-tag
                v-if="dimension.value === 'fixed_version'"
                type="info"
                class="flex-1"
              >
                <el-checkbox v-model="fixed_version_closed">
                  {{ $t('Issue.DisplayClosedVersion') }}
                </el-checkbox>
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
                v-for="item in (dimension.value === 'status')
                  ? filterClosedStatus(getOptionsData(dimension.value))
                  : getOptionsData(dimension.value)"
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
        v-show="checkSaveFilterButtonDisplay()"
        ref="saveFilterButton"
        type="issue_list"
        :filter-value="filterValueClone"
        @update="onCustomFilterAdded"
      />
      <el-button
        slot="reference"
        icon="el-icon-s-operation"
        type="text"
        class="headerTextColor"
      >
        {{ displayFilterValue }}
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
      class="headerTextColor"
      @click="searchVisible = !searchVisible"
    >
      {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
    </el-button>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button
        size="small"
        icon="el-icon-close"
        class="buttonSecondaryReverse"
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
import { getLocalTime } from '@/utils/handleTime'
import { getHasSon, getProjectRelation } from '@/api_v2/projects'

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
      filterOptionsWithProject: [],
      projectRelationList: []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker', 'status', 'priority', 'selectedProject']),
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
        // isArray ? selectedLabels.push(this.handleArrayLabels(item)) : selectedLabels.push(this.handleLabels(item))
        if (isArray) selectedLabels.push(this.handleArrayLabels(item))
        else if (!isArray && this.handleLabels(item)) {
          selectedLabels.push(this.handleLabels(item))
        }
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
        const value = this.getOptionsData(item)
          ? this.getOptionsData(item).find((search) => search.id === this.filterValue[item])
          : this.filterValue[item]
        if (value) label = this.getSelectedLabel(value)
        return label
      }
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
    },
    selectedProjectId: {
      async handler(val) {
        const hasSon = await this.fetchHasSon(this.selectedProjectId)
        this.filterOptionsWithProject = await this.getFilterOptions(hasSon)
        if (hasSon) {
          this.projectRelationList = await this.getProjectRelationData(this.selectedProject)
        }
      },
      immediate: true
    }
  },
  methods: {
    getSelectedLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.getTranslateHeader(item.name || getLocalTime(item, 'YYYY-MM-DD'))
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
      const options = {
        ...this.selectionOptions,
        tracker: this.tracker,
        status: this.status,
        priority: this.priority,
        project: this.projectRelationList
      }
      return options[option_name]
    },
    async onChangeFilter() {
      this.$emit('change-filter', {
        filterValue: this.filterValue,
        keyword: this.keyword,
        displayClosed: this.displayClosed,
        isReloadFilterList: this.filterValueClone.hasOwnProperty('project')
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
        if (checkFilterValue[item] === '' || checkFilterValue[item].length === 0) delete checkFilterValue[item]
        if (this[comparedKey][item] !== checkFilterValue[item]) return true
      }
    },
    getComparedKey(key) {
      return key === 'filterValue' ? 'originFilterValue' : 'filterValue'
    },
    onCustomFilterAdded() {
      this.$emit('add-custom-filter')
    },
    resetSaveFilterButtons() {
      this.$refs.saveFilterButton.reset()
    },
    checkSaveFilterButtonDisplay() {
      const whiteList = ['issueList']
      return whiteList.includes(this.$route.name)
    },
    async fetchHasSon(pId) {
      const hasSon = await getHasSon(pId)
      return hasSon.has_child
    },
    async getFilterOptions(hasSon) {
      this.filterOptionsWithProject = hasSon ? [{
        id: this.filterOptions.length + 1,
        value: 'project',
        placeholder: 'Project'
      }].concat(this.filterOptions) : this.filterOptions
      return this.filterOptionsWithProject
    },
    async getProjectRelationData() {
      const { id, display } = this.selectedProject
      const projectRelation = (await getProjectRelation(id)).data
      const projectRelationList = [{ id, name: display }]
      if (projectRelation && projectRelation[0].child) projectRelationList.push(...projectRelation[0].child)
      return projectRelationList
    }
  }
}
</script>
