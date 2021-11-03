<template>
  <project-list-selector>
    <el-popover
      placement="bottom"
      trigger="click"
    >
      <el-form v-loading="isLoading">
        <template v-for="dimension in filterOptions">
          <el-form-item v-if="groupBy.dimension !== dimension.value" :key="dimension.id">
            <div slot="label">
              {{ $t('Issue.' + dimension.value) }}
              <el-tag v-if="dimension.value ==='fixed_version'" type="info" class="flex-1">
                <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>
              </el-tag>
            </div>
            <el-select
              v-model="filterValue[dimension.value]"
              :placeholder="$t(`Issue.Select${dimension.placeholder}`)"
              :disabled="selectedProjectId === -1"
              filterable
              clearable
              value-key="id"
              :multiple="dimension.value === 'tags'"
              :collapse-tags="dimension.value === 'tags'"
              @change="onChangeFilter"
            >
              <el-option
                v-for="item in (dimension.value === 'status') ? filterClosedStatus(getOptionsData(dimension.value)) : getOptionsData(dimension.value)"
                :key="dimension.value === 'assigned_to' ? item.login : item.id"
                :label="getSelectionLabel(item)"
                :class="{[item.class]: item.class}"
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
      <el-button slot="reference" :loading="isLoading" icon="el-icon-s-operation" type="text"> {{ listFilter }}
        <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
    </el-popover>
    <el-divider direction="vertical" />
    <el-popover
      placement="bottom"
      trigger="click"
    >
      <el-form v-loading="isLoading">
        <el-form-item :label="$t('Issue.FilterDimensions.label')">
          <el-select
            v-model="groupBy.dimension"
            class="mr-4"
            filterable
            @change="onChangeGroupByDimension($event, true)"
          >
            <template v-for="item in filterOptions">
              <el-option
                v-if="item.value !== 'tags'"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Issue.Display')">
          <el-select-all
            ref="groupByValue"
            :value="groupBy.value"
            filterable
            multiple
            collapse-tags
            :loading="isLoading"
            :options="groupByOptions"
            value-key="id"
            @change="onChangeGroupByValue($event, true)"
          />
        </el-form-item>
      </el-form>
      <el-button slot="reference" :loading="isLoading" type="text">
        <i18n path="Issue.GroupBy">
          <b slot="filter">{{ showSelectedGroupByName }}</b>
        </i18n>
        ({{ showSelectedGroupByLength }})
        <i class="el-icon-arrow-down el-icon--right" />
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
      :disabled="isLoading"
      @blur="searchVisible=!searchVisible"
      @change="onChangeFilter"
    />
    <el-button v-else type="text" :loading="isLoading" icon="el-icon-search" @click="searchVisible=!searchVisible">
      {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
    </el-button>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button size="small" icon="el-icon-close" :loading="isLoading" @click="cleanFilter">
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
  </project-list-selector>
</template>

<script>
import ProjectListSelector from '@/components/ProjectListSelector'
import { mapGetters, mapActions } from 'vuex'
import { getProjectVersion, getProjectUserList, getTagsByProject } from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'
import Tracker from '@/components/Issue/Tracker'
import Priority from '@/components/Issue/Priority'
import Status from '@/components/Issue/Status'

export default {
  name: 'FactorFilter',
  components: { ProjectListSelector, ElSelectAll, Tracker, Priority, Status },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    filterOptions: {
      type: Array,
      default: () => []
    },
    groupBy: {
      type: Object,
      default: () => ({
        dimension: 'status',
        value: []
      })
    }
  },
  data() {
    return {
      fixed_version_closed: false,
      displayClosed: false,
      searchVisible: false,
      filterValue: {},
      originFilterValue: {},
      keyword: null,
      tags: [],
      assigned_to: [],
      fixed_version: []
    }
  },
  computed: {
    ...mapGetters([
      'selectedProjectId',
      'userId',
      'status',
      'tracker',
      'priority'
    ]),
    listFilter() {
      const result = []
      Object.keys(this.filterValue).forEach(item => {
        if (!this.filterValue[item]) return
        if (Array.isArray(this.filterValue[item]) && this.filterValue[item].length > 0) {
          const value = this.getOptionsData(item).filter(search => this.filterValue[item].includes(search.id))
          if (value) result.push(`#${value.map(subItem => this.getSelectionLabel(subItem)).join('/')}`)
        } else {
          console.log(item)
          const value = this.getOptionsData(item).find(search => search.id === this.filterValue[item])
          if (value) result.push(this.getSelectionLabel(value))
        }
      })
      const colon = result.length > 0 ? ': ' : ''
      const factor = result.join(', ')
      return `${this.$t('general.Filter')}${colon}${factor}`
    },
    isFilterChanged() {
      return this.checkFilterValue('originFilterValue') || this.checkFilterValue('filterValue') || !!this.keyword
    },
    checkFilterValue() {
      return function(key) {
        const comparedKey = this.getComparedKey(key)
        for (const item of Object.keys(this[key])) {
          const checkFilterValue = this[key]
          if (checkFilterValue[item] === '') delete checkFilterValue[item]
          if (this[comparedKey][item] !== checkFilterValue[item]) return true
        }
      }
    },
    getComparedKey() {
      return function(key) {
        let comparedKey = ''
        comparedKey = key === 'filterValue' ? 'originFilterValue' : 'filterValue'
        return comparedKey
      }
    },
    groupByOptions() {
      const dimension = this.getDimension
      return dimension.map((item, idx) => ({
        id: idx,
        label: this.getTranslateHeader(item.name),
        value: item
      }))
    },
    showSelectedGroupByLength() {
      if (this.groupByOptions.length === this.groupBy.value.length || this.groupBy.value.length === 0) {
        return this.$t('general.All')
      }
      return this.groupBy.value.length
    },
    getDimension() {
      const dimensionKey = this.groupBy.dimension
      let dimension = dimensionKey === 'status' ? this.filterClosedStatus(this[dimensionKey]) : this[dimensionKey]
      dimension = dimensionKey === 'assigned_to' ? this.filterMe(dimension) : dimension
      return dimension
    },
    showSelectedGroupByName() {
      return this.filterOptions.find(item => item.value === this.groupBy.dimension).label
    }
  },
  watch: {
    async selectedProjectId() {
      await this.loadSelectionList()
      await this.cleanFilter()
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed(value)
      this.loadVersionList(value)
    }
  },
  async created() {
    const storedData = await this.fetchStoredData()
    const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
    this.filterValue = storedFilterValue['board'] ? storedFilterValue['board'] : {}
    this.keyword = storedKeyword['board'] ? storedKeyword['board'] : null
    this.displayClosed = storedDisplayClosed['board'] ? storedDisplayClosed['board'] : false
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', [
      'setFixedVersionShowClosed',
      'getIssueFilter',
      'getKeyword',
      'getDisplayClosed',
      'setIssueFilter',
      'setKeyword',
      'setDisplayClosed'
    ]),
    getOptionsData(option_name) {
      return this[option_name]
    },
    getSelectionLabel(item) {
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
    async loadSelectionList() {
      if (this.selectedProjectId === -1) return
      await Promise.all([
        getProjectUserList(this.selectedProjectId),
        getTagsByProject(this.selectedProjectId)
      ]).then(res => {
        const [assigneeList, tagsList] = res.map(item => item.data)
        this.assigned_to = [
          { name: this.$t('Issue.Unassigned'), id: 'null' },
          {
            name: this.$t('Issue.me'),
            login: '-Me-',
            id: this.userId,
            class: 'bg-yellow-100'
          },
          ...assigneeList.user_list
        ]
        this.tags = tagsList.tags
        // if (this.userRole === 'Engineer') {
        //   this.$set(this.filterValue, 'assigned_to', this.userId)
        //   this.$set(this.originFilterValue, 'assigned_to', this.userId)
        // }
      })
      await this.loadVersionList(this.fixed_version_closed)
    },
    async loadVersionList(status) {
      const params = status ? { status: 'open,locked,closed' } : { status: 'open,locked' }
      const versionList = await this.fetchVersionList(params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList]
      const version = this.fixed_version.filter(item => new Date(`${item.due_date}T23:59:59`) >= new Date() && item.status !== 'closed')
      if (version.length > 0) {
        const sessionValue = sessionStorage.getItem('issueFilter')
        if (!sessionValue || !JSON.parse(sessionValue)['board']) {
          this.$set(this.filterValue, 'fixed_version', version[0].id)
        }
        this.$set(this.originFilterValue, 'fixed_version', version[0].id)
      } else {
        this.$delete(this.originFilterValue, 'fixed_version')
      }
    },
    async fetchVersionList(params) {
      const res = await getProjectVersion(this.selectedProjectId, params)
      const versionList = res.data.versions
      return versionList
    },
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed
      await Promise.all([this.getIssueFilter(), this.getKeyword(), this.getDisplayClosed()]).then(res => {
        const [filterValue, keyword, displayClosed] = res.map(item => item)
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed }
    },
    filterMe(userList) {
      return userList.filter((item) => (item.login !== '-Me-'))
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => (item.is_closed === false))
    },
    cleanFilter() {
      this.filterValue = Object.assign({}, this.originFilterValue)
      this.keyword = ''
      this.displayClosed = false
      this.$emit('onChangeGroupByDimension')
      this.onChangeFilter()
    },
    async onChangeFilter() {
      const storedData = await this.fetchStoredData()
      const { storedFilterValue, storedKeyword, storedDisplayClosed } = storedData
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
      storedFilterValue['board'] = this.filterValue
      storedKeyword['board'] = this.keyword
      storedDisplayClosed['board'] = this.displayClosed
      await this.setIssueFilter(storedFilterValue)
      await this.setKeyword(storedKeyword)
      await this.setDisplayClosed(storedDisplayClosed)
      this.$emit('loadData')
    },
    onChangeGroupByDimension(event, boolean) {
      this.$emit('onChangeGroupByValue', event, boolean)
    },
    onChangeGroupByValue(event, boolean) {
      this.$emit('onChangeGroupByValue', event, boolean)
    }
  }
}
</script>
