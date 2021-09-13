<template>
  <el-row class="app-container">
    <project-list-selector>
      <el-row slot="button">
        <el-col class="text-right">
          <p v-if="updateLoading" class="text-blue-500">
            <em class="el-icon-loading" /> 儲存中......
          </p>
          <p v-else-if="lastUpdated&&lastUpdated.time" class="text-success">
            <em class="el-icon-check" /> <strong>儲存完成：</strong>{{ lastUpdated.time|relativeTime }}
          </p>
          <p v-else-if="lastUpdated&&lastUpdated.error" class="text-danger">
            <em class="el-icon-check" /> <strong>儲存失敗：</strong>{{ lastUpdated.error }}
          </p>
        </el-col>
      </el-row>
      <SearchFilter
        :filter-options="filterOptions"
        :list-loading="listLoading"
        :selection-options="contextOptions"
        :prefill="{ filterValue: filterValue, keyword: keyword, displayClosed: displayClosed, originFilterValue:originFilterValue }"
        @change-filter="onChangeFilterForm"
      >
        <el-popover
          placement="bottom"
          trigger="click"
        >
          <el-checkbox v-for="item in columnsOptions" :key="item.value" v-model="checkedColumns[item.value]" :label="item.label">{{ item.label }}</el-checkbox>
          <el-button slot="reference" icon="el-icon-s-operation" type="text"> 顯示欄位
            <i class="el-icon-arrow-down el-icon--right" /></el-button>
        </el-popover>
        <el-divider direction="vertical" />
      </SearchFilter>
      <!--      <el-popover-->
      <!--        placement="bottom"-->
      <!--        trigger="click"-->
      <!--      >-->
      <!--        <el-form v-loading="listLoading">-->
      <!--          &lt;!&ndash;          <el-form-item label="結束日期範圍">&ndash;&gt;-->
      <!--          &lt;!&ndash;            <el-date-picker&ndash;&gt;-->
      <!--          &lt;!&ndash;              v-model="dateRange"&ndash;&gt;-->
      <!--          &lt;!&ndash;              type="daterange"&ndash;&gt;-->
      <!--          &lt;!&ndash;            />&ndash;&gt;-->
      <!--          &lt;!&ndash;          </el-form-item>&ndash;&gt;-->
      <!--          <template v-for="dimension in filterOptions">-->
      <!--            <el-form-item :key="dimension.id">-->
      <!--              <div slot="label">-->
      <!--                {{ $t('Issue.' + dimension.value) }}-->
      <!--                <el-tag v-if="dimension.value==='fixed_version'" type="info" class="flex-1">-->
      <!--                  <el-checkbox v-model="fixed_version_closed"> {{ $t('Issue.DisplayClosedVersion') }}</el-checkbox>-->
      <!--                </el-tag>-->
      <!--              </div>-->
      <!--              <el-select-->
      <!--                v-model="filterValue[dimension.value]"-->
      <!--                :placeholder="$t('Issue.Select'+dimension.placeholder)"-->
      <!--                :disabled="selectedProjectId === -1"-->
      <!--                filterable-->
      <!--                :clearable="!dimension.non_cleanable"-->
      <!--                @change="onChangeFilter"-->
      <!--              >-->
      <!--                <el-option-->
      <!--                  v-for="item in (dimension.value==='status')? filterClosedStatus(getOptionsData(dimension.value)):getOptionsData(dimension.value)"-->
      <!--                  :key="(dimension.value==='assigned_to')? item.login: item.id"-->
      <!--                  :label="getSelectionLabel(item)"-->
      <!--                  :class="{[item.class]:item.class}"-->
      <!--                  :value="item.id"-->
      <!--                >-->
      <!--                  <component :is="dimension.value" v-if="dimension.tag" :name="item.name" />-->
      <!--                </el-option>-->
      <!--              </el-select>-->
      <!--            </el-form-item>-->
      <!--          </template>-->
      <!--          <el-form-item :label="$t('Issue.DisplayClosedIssue')" class="checkbox">-->
      <!--            <el-checkbox v-model="displayClosed" @change="onChangeFilter" />-->
      <!--          </el-form-item>-->
      <!--        </el-form>-->
      <!--        <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}-->
      <!--          <i class="el-icon-arrow-down el-icon&#45;&#45;right" /></el-button>-->
      <!--      </el-popover>-->
      <!--      <el-divider direction="vertical" />-->
      <!--      <el-input-->
      <!--        v-if="searchVisible"-->
      <!--        id="input-search"-->
      <!--        v-model="keyword"-->
      <!--        prefix-icon="el-icon-search"-->
      <!--        :placeholder="$t('Issue.SearchNameOrAssignee')"-->
      <!--        style="width: 250px;"-->
      <!--        clearable-->
      <!--        @blur="searchVisible=!searchVisible"-->
      <!--        @change="onChangeFilter"-->
      <!--      />-->
      <!--      <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">-->
      <!--        {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}-->
      <!--      </el-button>-->
      <!--      <template v-if="isFilterChanged">-->
      <!--        <el-divider direction="vertical" />-->
      <!--        <el-button size="small" icon="el-icon-close" @click="cleanFilter">-->
      <!--          {{ $t('Issue.CleanFilter') }}-->
      <!--        </el-button>-->
      <!--      </template>-->
    </project-list-selector>
    <el-divider />
    <el-tabs v-model="activeTab" type="border-card" @tab-click="onChangeFilter">
      <el-tab-pane name="WBS" label="WBS">
        <WBS ref="WBS" :filter-value="filterValue" :keyword="keyword" :columns="columns" :assigned_to="assigned_to"
             :fixed_version="fixed_version" @update-loading="handleUpdateLoading" @update-status="handleUpdateStatus"
        />
      </el-tab-pane>
      <el-tab-pane name="Gantt" label="Gantt">
        <Gantt ref="Gantt" :filter-value="filterValue" :keyword="keyword" :assigned_to="assigned_to"
               :fixed_version="fixed_version"
        />
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Gantt from '@/views/Plugin/QA/views/Project/Milestone/components/Gantt'
import WBS from '@/views/Plugin/QA/views/Project/Milestone/components/WBS'
import SearchFilter from '@/components/Issue/SearchFilter'
import { getProjectAssignable, getProjectVersion } from '@/api/projects'

export default {
  name: 'ProjectMilestone',
  components: {
    SearchFilter,
    WBS,
    Gantt,
    ProjectListSelector
  },
  data() {
    return {
      listLoading: false,
      contentLoading: false,

      updateLoading: false,
      lastUpdated: null,

      assigned_to: [],
      fixed_version: [],

      activeNames: '',
      searchVisible: false,
      displayClosed: false,
      filterValue: { tracker: 1 },
      originFilterValue: { tracker: 1 },
      checkedColumns: { name: true, tracker: true, fixed_version: true, StartDate: true, EndDate: true,
        priority: true, assigned_to: true, DoneRatio: true, points: true },
      keyword: null,

      listData: [],
      activeTab: 'WBS',
      addTopicDialog: {
        visible: false,
        parentId: 0,
        parentName: null,
        LoadingConfirm: false
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'selectedProjectId', 'tracker', 'fixedVersionShowClosed']),
    contextOptions() {
      const result = {}
      const getOptions = ['assigned_to', 'fixed_version']
      getOptions.forEach((item) => {
        result[item] = this[item]
      })
      return result
    },
    filterOptions() {
      return [
        { id: 1, label: this.$t('Issue.FilterDimensions.status'), value: 'status', placeholder: 'Status', tag: true },
        { id: 2, label: this.$t('Issue.FilterDimensions.tracker'), value: 'tracker', placeholder: 'Type', tag: true },
        { id: 3, label: this.$t('Issue.FilterDimensions.assigned_to'), value: 'assigned_to', placeholder: 'Member' },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version'
        },
        {
          id: 5,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true
        }
      ]
    },
    columnsOptions() {
      return [
        { label: this.$t('Issue.name'), value: 'name' },
        { label: this.$t('Issue.tracker'), value: 'tracker' },
        { label: this.$t('Issue.fixed_version'), value: 'fixed_version' },
        { label: this.$t('Issue.StartDate'), value: 'StartDate' },
        { label: this.$t('Issue.EndDate'), value: 'EndDate' },
        { label: this.$t('Issue.priority'), value: 'priority' },
        { label: this.$t('Issue.assigned_to'), value: 'assigned_to' },
        { label: this.$t('Issue.DoneRatio'), value: 'DoneRatio' },
        { label: this.$t('Issue.points'), value: 'points' }
      ]
    },
    columns() {
      const result = []
      Object.keys(this.checkedColumns).forEach(item => {
        if (this.checkedColumns[item]) { result.push(item) }
      })
      return result
    }
  },
  watch: {
    selectedProjectId() {
      this.onChangeFilter()
    },
    fixedVersionShowClosed(value) {
      this.loadVersionList(value)
    }
  },
  async created() {
    this.loadSelectionList()
    const tracker = this.tracker.find(item => item.name === 'Epic')
    const storeFilterValue = await this.getFilter()
    if (storeFilterValue['milestone']) {
      this.filterValue = storeFilterValue['milestone']
    } else {
      this.fillterValue = { tracker: tracker.id }
    }
    this.originalFillterValue = { tracker: tracker.id }
    const storeKeyword = await this.getKeyword()
    if (storeKeyword['milestone']) { this.keyword = storeKeyword['milestone'] }
    const storeDisplayClosed = await this.getDisplayClosed()
    if (storeDisplayClosed['milestone']) { this.displayClosed = storeDisplayClosed['milestone'] }
  },
  methods: {
    ...mapActions('projects', ['getFilter', 'getKeyword', 'getDisplayClosed', 'setFilter', 'setKeyword', 'setDisplayClosed']),
    loadSelectionList() {
      this.loadVersionList(this.fixedVersionShowClosed)
      this.loadAssignedToList()
    },
    async loadAssignedToList() {
      const res = await getProjectAssignable(this.selectedProjectId)
      this.assigned_to = [
        {
          name: this.$t('Issue.me'),
          login: '-Me-',
          id: this.userId,
          class: 'bg-yellow-100'
        }, ...res.data.user_list
      ]
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    handleUpdateLoading(value) {
      this.updateLoading = value
    },
    handleUpdateStatus(value) {
      this.lastUpdated = value
    },
    async onChangeFilterForm(value) {
      Object.keys(value).forEach(item => {
        this[item] = value[item]
      })
      const storeFilterValue = await this.getFilter()
      storeFilterValue['milestone'] = this.filterValue
      const storeKeyword = await this.getKeyword()
      storeKeyword['milestone'] = this.keyword
      const storeDisplayClosed = await this.getDisplayClosed()
      storeDisplayClosed['milestone'] = this.displayClosed
      await this.setFilter(storeFilterValue)
      await this.setKeyword(storeKeyword)
      await this.setDisplayClosed(storeDisplayClosed)
      await this.onChangeFilter()
    },
    onChangeFilter() {
      this.$refs[this.activeTab].loadData()
    }
  }
}
</script>

<style lang="scss" scoped></style>
