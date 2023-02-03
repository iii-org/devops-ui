/**
 * ! Before using this module, you need to know:
 * 1. The main feature of searchBar mixins is offer filterValue.
 * 2. Define function for saving filter information in sessionStorage.
 *    ! Have to define storageName if you want to save filter info.
 */

import { mapGetters, mapActions } from 'vuex'
import {
  getProjectUserList,
  getProjectVersion,
  getTagsByProject
} from '@/api/projects'
import { SearchFilter, CustomFilter } from '@/components/Issue'

/**
 * * How to use SearchFilter component
 * ! for required
 * ? for optional
 *
 * ! @listLoading {Boolean}
 * ! @filterOptions {Array}
 * ! @selectionOptions {Object}
 * ! @prefill {Object}
 * ! @changeFilter {Function}
 * ! @changeFixedVersion {Function}
 * ! @addCustomFilter {Function}
 * ! @cleanFilter {Function}
 *
 * * Component example
 *  <SearchFilter
 *    :filter-options="filterOptions"
 *    :list-loading="listLoading"
 *    :selection-options="contextOptions"
 *    :prefill="{
 *      filterValue: filterValue,
 *      keyword: keyword,
 *      displayClosed: displayClosed,
 *      fixed_version_closed: fixed_version_closed
 *    }"
 *    @change-filter="onChangeFilterForm"
 *    @change-fixed-version="onChangeFixedVersionStatus"
 *    @add-custom-filter="updateCustomFilter"
 *    @clean-filter="cleanFilter"
 *  >
 * ?  <slot />
 * ?  <slot name="download" />
 *  </SearchFilter>
 */

/**
 * * How to use CustomFilter component
 * ! for required
 * ? for optional
 *
 * ! @selectionOptions {Object}
 * ! @type {String}
 * ? @projectId {Number, String}
 * ? @activeTab {String}
 * ? @groupBy {Object}
 * ! @applyFilter {Function}
 *
 * * Component example
 *  <CustomFilter
 *    type="my_work"
 *    :selection-options="contextOptions"
 *    :project-id="projectId"
 *    :active-tab="activeTab"
 *    :group-by="groupBy"
 *    @apply-filter="applyCustomFilter"
 *  />
 */

export default {
  components: { SearchFilter, CustomFilter },
  data() {
    return {
      filterOptions: Object.freeze([
        {
          id: 1,
          label: this.$t('Issue.FilterDimensions.tracker'),
          value: 'tracker',
          placeholder: 'Type',
          tag: true
        },
        {
          id: 2,
          label: this.$t('Issue.FilterDimensions.status'),
          value: 'status',
          placeholder: 'Status',
          tag: true
        },
        {
          id: 3,
          label: this.$t('Issue.FilterDimensions.tags'),
          value: 'tags',
          placeholder: 'Tag'
        },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.assigned_to'),
          value: 'assigned_to',
          placeholder: 'Member'
        },
        {
          id: 5,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version'
        },
        {
          id: 6,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true
        },
        {
          id: 7,
          label: this.$t('Issue.FilterDimensions.due_date_start'),
          value: 'due_date_start',
          placeholder: 'Date',
          component: 'el-date-picker',
          componentOptions: { type: 'date' },
          tag: true
        },
        {
          id: 8,
          label: this.$t('Issue.FilterDimensions.due_date_end'),
          value: 'due_date_end',
          placeholder: 'Date',
          component: 'el-date-picker',
          componentOptions: { type: 'date' },
          tag: true
        }
      ]),
      storageName: '',
      sort: '',
      filterValue: {},
      originFilterValue: {},
      keyword: null,
      tracker_id: null,
      assigned_to: [],
      fixed_version: [],
      tags: [],
      fixed_version_closed: false,
      displayClosed: false
    }
  },
  computed: {
    ...mapGetters([
      'selectedProjectId',
      'userRole',
      'userId'
    ]),
    mainSelectedProjectId() {
      return this.filterValue.project || this.selectedProjectId
    },
    isDisabled() {
      return this.mainSelectedProjectId === -1
    }
  },
  watch: {
    selectedProjectId: {
      async handler() {
        await this.getInitStoredData()
        await this.loadSelectionList()
      }
    },
    fixed_version_closed(value) {
      this.setFixedVersionShowClosed({ [this.storageName]: value })
      this.loadVersionList(value)
    }
  },
  async mounted() {
    // await this.getInitStoredData()
    await this.loadSelectionList()
  },
  methods: {
    ...mapActions('projects', [
      'getIssueFilter',
      'setIssueFilter',
      'getKeyword',
      'setKeyword',
      'getDisplayClosed',
      'setDisplayClosed',
      'getFixedVersionShowClosed',
      'setFixedVersionShowClosed'
    ]),
    getParams(limit) {
      const result = {
        offset: this.listQuery.offset,
        limit: limit || this.listQuery.limit,
        only_superproject_issues: !!this.filterValue.project
      }
      if (this.sort) result['sort'] = this.sort
      if (this.keyword) result['search'] = this.keyword
      if (this.tracker_id) result['tracker_id'] = this.tracker_id
      if (!this.displayClosed) result['status_id'] = 'open'
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          if (item === 'tags' && this.filterValue[item].length > 0) {
            result[item] = this.filterValue[item].join()
          } else {
            (result[item + '_id'] = this.filterValue[item])
          }
        }
      })
      return result
    },
    async getInitStoredData() {
      if (!this.storageName) return
      const key = this.storageName
      const storedData = await this.fetchStoredData()
      const {
        storedFilterValue,
        storedKeyword,
        storedDisplayClosed,
        storedVersionClosed
      } = storedData
      this.filterValue = storedFilterValue[key] ? storedFilterValue[key] : {}
      this.keyword = storedKeyword[key] ? storedKeyword[key] : null
      this.displayClosed = storedDisplayClosed[key] ? storedDisplayClosed[key] : false
      this.fixed_version_closed = storedVersionClosed[key] ? storedVersionClosed[key] : false
    },
    async fetchStoredData() {
      let storedFilterValue, storedKeyword, storedDisplayClosed, storedVersionClosed
      await Promise.all([
        this.getIssueFilter(),
        this.getKeyword(),
        this.getDisplayClosed(),
        this.getFixedVersionShowClosed()
      ]).then((res) => {
        const [filterValue, keyword, displayClosed, fixedVersionClosed] = res.map((item) => item)
        storedFilterValue = filterValue
        storedKeyword = keyword
        storedDisplayClosed = displayClosed
        storedVersionClosed = fixedVersionClosed
      })
      return { storedFilterValue, storedKeyword, storedDisplayClosed, storedVersionClosed }
    },
    async loadSelectionList() {
      if (this.selectedProjectId === -1) return
      await Promise.all([
        getProjectUserList(this.mainSelectedProjectId),
        getTagsByProject(this.mainSelectedProjectId)
      ]).then(
        (res) => {
          const [assigneeList, tagsList] = res.map((item) => item.data)
          this.tags = tagsList.tags
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
          if (this.userRole === 'Engineer') {
            this.$set(this.filterValue, 'assigned_to', this.userId)
            this.$set(this.originFilterValue, 'assigned_to', this.userId)
          }
        }
      )
      await this.loadVersionList(this.fixed_version_closed)
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.mainSelectedProjectId, params)
      this.fixed_version = [
        { name: this.$t('Issue.VersionUndecided'), id: 'null' },
        ...versionList.data.versions
      ]
    },
    async onChangeFilterForm(value) {
      Object.keys(value).forEach((item) => {
        this[item] = value[item]
      })
      if (this.filterValue['tags'] && this.filterValue['tags'].length <= 0) {
        this.$delete(this.filterValue, 'tags')
      }
      if (value.isReloadFilterList) {
        await this.loadSelectionList()
      }
      await this.onChangeFilter()
    },
    async onChangeFilter() {
      if (this.storageName) {
        const key = this.storageName
        const storedData = await this.fetchStoredData()
        const {
          storedFilterValue,
          storedKeyword,
          storedDisplayClosed
        } = storedData
        storedFilterValue[key] = this.filterValue
        storedKeyword[key] = this.keyword
        storedDisplayClosed[key] = this.displayClosed
        await this.setIssueFilter(storedFilterValue)
        await this.setKeyword(storedKeyword)
        await this.setDisplayClosed(storedDisplayClosed)
      }
      await this.loadData()
    },
    onChangeFixedVersionStatus(value) {
      this.fixed_version_closed = value
    },
    updateCustomFilter() {
      this.$refs.customFilter.fetchCustomFilter()
    },
    cleanFilter() {
      if (this.$refs.customFilter) {
        this.$refs.customFilter.resetApplyFilter()
      } else {
        this.filterValue = Object.assign({}, this.originFilterValue)
        this.keyword = ''
        this.displayClosed = false
      }
    },
    applyCustomFilter(filters) {
      const { result, displayClosed, fixed_version_closed } = filters
      this.onChangeFilterForm({ filterValue: result })
      this.displayClosed = displayClosed
      this.fixed_version_closed = fixed_version_closed
    }
  }
}
