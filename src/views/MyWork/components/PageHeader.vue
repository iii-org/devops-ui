<template>
  <ProjectListSelector
    :project-id.sync="focusedProjectId"
    :keep-selection="false"
    :clearable="true"
  >
    <template slot="button">
      <template v-if="!focusedProjectId">
        <el-button
          v-permission="['Administrator','Project Manager']"
          class="buttonPrimary"
          icon="el-icon-plus"
          @click="$emit('create-project')"
        >
          {{ $t('Project.AddProject') }}
        </el-button>
      </template>

      <el-button
        v-else
        v-permission="['Administrator','Project Manager', 'Engineer']"
        class="buttonSecondary"
        icon="el-icon-plus"
        @click="$emit('add-issue')"
      >
        {{ $t('Issue.AddIssue') }}
      </el-button>
    </template>

    <CustomFilter
      ref="customFilter"
      type="my_work"
      :project-id="projectId"
      :active-tab="activeTab"
      :selection-options="contextOptions"
      @apply-filter="applyCustomFilter"
    />

    <el-popover
      placement="bottom"
      trigger="click"
      @hide="resetSaveFilterButtons"
    >
      <el-form>
        <template v-for="condition in filterConditionGroup">
          <el-form-item
            v-if="!isHiddenFormItem(condition)"
            :key="condition.id"
          >
            <div slot="label">
              {{ $t('Issue.' + condition.value) }}
              <el-tag
                v-if="condition.value === 'fixed_version'"
                type="info"
                class="flex-1"
              >
                <el-checkbox
                  :value="displayClosedVersion"
                  @change="$emit('update:displayClosedVersion', $event)"
                >{{ $t('Issue.DisplayClosedVersion') }} </el-checkbox>
              </el-tag>
            </div>

            <el-select
              v-model="filterConditions[condition.value]"
              :placeholder="$t('Issue.Select' + condition.placeholder)"
              filterable
              clearable
              @clear="clearCondition(condition.value)"
            >
              <el-option
                v-for="option in filterOption(condition)"
                :key="option.id"
                :label="formatOptionName(condition.value, option.name)"
                :value="option.id"
              >
                <component
                  :is="condition.value"
                  v-if="condition.tag"
                  :name="$t(`Issue.${option.name}`)"
                  :type="option.name"
                />
              </el-option>
            </el-select>
          </el-form-item>
        </template>

        <el-form-item :label="$t('Issue.DisplayClosedIssue')">
          <el-checkbox
            :value="displayClosedIssue"
            @change="$emit('update:displayClosedIssue', $event)"
          />
        </el-form-item>
      </el-form>

      <SaveFilterButton
        ref="saveFilterButton"
        type="my_work"
        :project-id="projectId"
        :filter-value="filterValueClone"
        :active-tab="activeTab"
        @update="onCustomFilterAdded"
      />

      <el-button
        slot="reference"
        icon="el-icon-s-operation"
        type="text"
        class="filterTextColor"
      >
        {{ selectedConditions }}
        <em class="el-icon-arrow-down" />
      </el-button>
    </el-popover>

    <el-divider direction="vertical" />

    <el-button
      v-if="!searchVisible"
      type="text"
      class="filterTextColor"
      icon="el-icon-search"
      @click="showKeywordInput"
    >
      {{ $t('general.Search') + (keyword ? `: ${keyword}` : '') }}
    </el-button>
    <el-input
      v-else
      ref="keywordInput"
      :value="keyword"
      prefix-icon="el-icon-search"
      :placeholder="$t('Issue.SearchNameOrAssignee')"
      style="width: 250px"
      clearable
      @blur="searchVisible = !searchVisible"
      @input="$emit('update:keyword', $event)"
    />

    <template v-if="showClearFilterButton()">
      <el-divider direction="vertical" />
      <el-button
        size="small"
        class="filterTextColor"
        icon="el-icon-close"
        @click="clearFilter"
      >
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
  </ProjectListSelector>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectUserList, getProjectVersion } from '@/api/projects'
import { CustomFilter, Tracker, Priority, Status } from '@/components/Issue'
import ProjectListSelector from '@/components/ProjectListSelector'
import SaveFilterButton from '@/components/Issue/components/SaveFilterButton'

export default {
  name: 'MyWorkPageHeader',
  components: {
    ProjectListSelector,
    CustomFilter,
    SaveFilterButton,
    Tracker,
    Priority,
    Status
  },
  props: {
    projectId: {
      type: [Number, String],
      default: null
    },
    displayClosedIssue: {
      type: Boolean,
      default: false
    },
    displayClosedVersion: {
      type: Boolean,
      default: false
    },
    filterConditions: {
      type: Object,
      default: () => ({})
    },
    keyword: {
      type: String,
      default: ''
    },
    activeTab: {
      type: String,
      default: 'assigned_to_id'
    }
  },
  data() {
    return {
      filterConditionGroup: [
        {
          id: 1,
          label: this.$t('Issue.FilterDimensions.status'),
          value: 'status',
          placeholder: 'Status',
          tag: true,
          options: []
        },
        {
          id: 2,
          label: this.$t('Issue.FilterDimensions.tracker'),
          value: 'tracker',
          placeholder: 'Type',
          tag: true,
          options: []
        },
        {
          id: 3,
          label: this.$t('Issue.FilterDimensions.assigned_to'),
          value: 'assigned_to',
          placeholder: 'Member',
          options: []
        },
        {
          id: 4,
          label: this.$t('Issue.FilterDimensions.fixed_version'),
          value: 'fixed_version',
          placeholder: 'Version',
          options: []
        },
        {
          id: 5,
          label: this.$t('Issue.FilterDimensions.priority'),
          value: 'priority',
          placeholder: 'Priority',
          tag: true,
          options: []
        }
      ],
      searchVisible: false
    }
  },
  computed: {
    ...mapGetters(['status', 'tracker', 'priority']),
    selectedConditions() {
      const conditions = Object.keys(this.filterConditions).map((filterCondition) => {
        const groupIdx = this.filterConditionGroup.findIndex((condition) => condition.value === filterCondition)
        const filterOptionId = this.filterConditions[filterCondition]
        const optionNameIdx = this.filterConditionGroup[groupIdx].options.findIndex(
          (option) => option.id === filterOptionId
        )
        if (optionNameIdx === -1) return
        const optionName = this.filterConditionGroup[groupIdx].options[optionNameIdx].name
        return this.formatOptionName(filterCondition, optionName)
      })
      return this.$t('general.Filter') + (conditions.length ? ': ' : '') + conditions.join(', ')
    },
    focusedProjectId: {
      get() {
        return this.projectId
      },
      set(id) {
        this.$emit('update:projectId', id)
      }
    },
    filterValueClone() {
      return Object.assign({}, this.filterConditions, {
        fixed_version_closed: this.displayClosedVersion,
        displayClosed: this.displayClosedIssue
      })
    },
    contextOptions() {
      return {
        assigned_to: this.filterConditionGroup[2].options,
        fixed_version: this.filterConditionGroup[3].options
      }
    }
  },
  watch: {
    projectId(newId, oldId) {
      if (oldId !== null) this.clearFilter()
      if (newId) this.fetchData()
    },
    displayClosedVersion() {
      if (this.projectId) this.fetchVersionList()
    }
  },
  mounted() {
    this.setFilterOptions()
  },
  methods: {
    fetchData() {
      this.fetchUserList()
      this.fetchVersionList()
    },
    setFilterOptions() {
      const { status, tracker, priority } = this
      this.filterConditionGroup[0].options = status
      this.filterConditionGroup[1].options = tracker
      this.filterConditionGroup[4].options = priority
    },
    fetchUserList() {
      getProjectUserList(this.projectId).then((res) => {
        const userList = res.data.user_list.map((user) => ({
          id: user.id,
          name: user.name
        }))
        this.filterConditionGroup[2].options = [{ id: 'null', name: this.$t('Issue.Unassigned') }, ...userList]
      })
    },
    fetchVersionList() {
      const params = this.displayClosedVersion ? { status: 'open,locked,closed' } : { status: 'open,locked' }
      getProjectVersion(this.projectId, params).then((res) => {
        const versionList = res.data.versions.map((version) => {
          return {
            id: version.id,
            name: this.formatVersionName(version.status, version.name)
          }
        })
        this.filterConditionGroup[3].options = [{ id: 'null', name: this.$t('Issue.VersionUndecided') }, ...versionList]
      })
    },
    formatVersionName(versionStatus, versionName) {
      return versionStatus === 'open' ? versionName : versionName + ` (${this.$t('Version.' + versionStatus)})`
    },
    clearFilter() {
      this.$emit('update:keyword', '')
      this.$emit('update:filterConditions', {})
      this.$emit('update:displayClosedIssue', false)
      this.$emit('update:displayClosedVersion', false)
      this.$refs.customFilter.resetApplyFilter()
    },
    isHiddenFormItem(condition) {
      const isRequireProjectId = condition.value === 'fixed_version' && !this.focusedProjectId
      const isHideAssignedToSelect = condition.value === 'assigned_to' && this.activeTab === 'assigned_to_id'
      return isRequireProjectId || isHideAssignedToSelect
    },
    clearCondition(condition) {
      delete this.filterConditions[condition]
    },
    showClearFilterButton() {
      const hasSelectedConditions = Object.keys(this.filterConditions).length > 0
      const hasKeyword = this.keyword !== ''
      return hasSelectedConditions || hasKeyword
    },
    showKeywordInput() {
      this.searchVisible = !this.searchVisible
      this.$nextTick(() => this.$refs.keywordInput.focus())
    },
    formatOptionName(condition, optionName) {
      return ['fixed_version', 'assigned_to'].includes(condition) ? optionName : this.$t('Issue.' + optionName)
    },
    filterOption(condition) {
      const { value, options } = condition
      const showAllOptions = value !== 'status' || this.displayClosedIssue
      return showAllOptions ? options : options.filter((option) => option.id !== 6)
    },
    onCustomFilterAdded() {
      this.$refs.customFilter.fetchCustomFilter()
    },
    applyCustomFilter(filters) {
      const { result, displayClosed, fixed_version_closed, activeTab } = filters
      this.$emit('update:filterConditions', this.formatFilterResult(result))
      this.$emit('update:displayClosedIssue', displayClosed)
      this.$emit('update:displayClosedVersion', fixed_version_closed)
      this.$emit('update:activeTab', activeTab)
    },
    formatFilterResult(result) {
      Object.keys(result).forEach((key) => {
        if (result[key] === null) delete result[key]
      })
      return result
    },
    resetSaveFilterButtons() {
      this.$refs.saveFilterButton.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';
.buttonPrimary {
  background-color: $buttonPrimary;
  color: white
}
.buttonSecondary {
  background-color: $buttonSecondary;
  color: white
}
.filterTextColor {
  color: $headerTextColor !important;
  &:hover {
    border-color: transparent;
  }
}
</style>
