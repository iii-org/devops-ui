<template>
  <span v-if="filters.length">
    <el-popover
      placement="bottom"
      trigger="click"
      width="320"
      @hide="onPopoverHide"
    >
      <div class="filter-list">
        <div
          v-for="filter in filters"
          :key="filter.id"
          class="my-2"
        >
          <div class="flex justify-between mx-5">
            <span
              class="filter-list-name"
              @click.prevent="onFilterClick(filter.id)"
            >
              <em
                v-show="filter.isApplying"
                class="el-icon-check text-success"
              />
              {{ filter.name }}
            </span>
            <span>
              <el-button
                icon="el-icon-edit"
                size="mini"
                circle
                @click="onEditClick(filter.id)"
              />
              <el-popconfirm
                :confirm-button-text="$t('general.Remove')"
                :cancel-button-text="$t('general.Cancel')"
                icon="el-icon-info"
                icon-color="red"
                :title="$t('Issue.RemoveCustomFilter')"
                @confirm="removeFilter(filter.id)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                />
              </el-popconfirm>
            </span>
          </div>
          <div class="mx-6 my-2 bg-gray-200 flex justify-center">
            <el-form
              v-if="filter.isShowForm"
              label-position="top"
              label-width="80px"
              :model="formData"
              class="mb-3"
            >
              <el-form-item :label="$t('Issue.status')">
                <el-select
                  v-model="formData.status_id"
                  :placeholder="$t('Issue.SelectStatus')"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in statusOptions"
                    :key="item.id"
                    :label="$t(`Issue.${item.name}`)"
                    :value="item.id"
                  >
                    <component
                      :is="'Status'"
                      :name="$t(`Issue.${item.name}`)"
                      :type="item.name"
                    />
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.tags')">
                <el-select
                  v-model="formData.tags"
                  :placeholder="$t('Issue.SelectTag')"
                  clearable
                  filterable
                  collapse-tags
                  multiple
                >
                  <el-option
                    v-for="item in selectionOptions.tags"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.tracker')">
                <el-select
                  v-model="formData.tracker_id"
                  :placeholder="$t('Issue.SelectType')"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in trackerOptions"
                    :key="item.id"
                    :label="$t(`Issue.${item.name}`)"
                    :value="item.id"
                  >
                    <component
                      :is="'Tracker'"
                      :name="$t(`Issue.${item.name}`)"
                      :type="item.name"
                    />
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.assigned_to')">
                <el-select
                  v-model="formData.assigned_to_id"
                  :placeholder="$t('Issue.SelectMember')"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in selectionOptions.assigned_to"
                    :key="item.login"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.fixed_version')">
                <el-select
                  v-model="formData.fixed_version_id"
                  :placeholder="$t('Issue.SelectVersion')"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in selectionOptions.fixed_version"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('Issue.priority')">
                <el-select
                  v-model="formData.priority_id"
                  :placeholder="$t('Issue.SelectPriority')"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in priorityOptions"
                    :key="item.id"
                    :label="$t(`Issue.${item.name}`)"
                    :value="item.id"
                  >
                    <component
                      :is="'Priority'"
                      :name="$t(`Issue.${item.name}`)"
                      :type="item.name"
                    />
                  </el-option>
                </el-select>
              </el-form-item>
              <div class="flex justify-between">
                <el-button
                  size="small"
                  @click="onEditClick(filter.id)"
                >
                  {{ $t('general.Cancel') }}
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="editFilter(filter)"
                >
                  {{ $t('general.Save') }}
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <el-button
        slot="reference"
        type="text"
      >
        {{ $t('Issue.CustomFilter') }}
        <em class="el-icon-arrow-down" />
      </el-button>
    </el-popover>
    <el-divider direction="vertical" />
  </span>
</template>>

<script>
import { mapGetters } from 'vuex'
import { getIssueFilter, editIssueFilter, removeIssueFilter } from '@/api/issueFilter'

const defaultFormData = () => ({
  status_id: null,
  tags: [],
  tracker_id: null,
  assigned_to_id: null,
  fixed_version_id: null,
  priority_id: null
})
const keysMap = {
  assigned_to_id: 'assigned_to',
  fixed_version_id: 'fixed_version',
  priority_id: 'priority',
  status_id: 'status',
  tags: 'tags',
  tracker_id: 'tracker'
}
export default {
  name: 'CustomFilter',
  components: {
    Tracker: () => import('@/components/Issue/Tracker'),
    Status: () => import('@/components/Issue/Status'),
    Priority: () => import('@/components/Issue/Priority')
  },
  props: {
    selectionOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      filters: [],
      formData: defaultFormData(),
      showEditForm: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'tracker', 'status', 'priority']),
    trackerOptions() {
      return this.tracker
    },
    statusOptions() {
      return this.status
    },
    priorityOptions() {
      return this.priority
    }
  },
  mounted() {
    this.fetchCustomFilter()
  },
  methods: {
    fetchCustomFilter() {
      this.isLoading = true
      getIssueFilter(this.selectedProjectId).then((res) => {
        this.filters = res.data.map((item) =>
          Object.assign({}, item, {
            custom_filter: this.formateCustomFilter(item.custom_filter),
            isShowForm: false,
            isApplying: false
          })
        )
      })
      this.isLoading = false
    },
    formateCustomFilter(options) {
      const result = Object.assign({}, options)
      Object.keys(options).forEach((key) => {
        if (key === 'tags') {
          result[key] = options[key] === null ? null : options[key].split(',').map((i) => Number(i))
        } else {
          result[key] = options[key] === null ? null : Number(options[key])
        }
      })
      return result
    },
    onEditClick(filterId) {
      this.onPopoverHide()
      const idx = this.filters.findIndex((item) => item.id === filterId)
      this.formData = Object.assign({}, this.filters[idx].custom_filter)
      this.filters[idx].isShowForm = !this.filters[idx].isShowForm
    },
    removeFilter(filterId) {
      removeIssueFilter(this.selectedProjectId, filterId).then((res) => {
        this.fetchCustomFilter()
      })
    },
    onPopoverHide() {
      this.filters.forEach((filter) => {
        filter.isShowForm = false
      })
    },
    editFilter(filter) {
      const { id, name } = filter
      const sendData = Object.assign({}, this.formData)
      sendData['name'] = name
      sendData['type'] = 'issue_list'
      sendData['tags'] = sendData['tags'] === null ? null : sendData['tags'].join(',')
      this.modifyCustomFilter(id, sendData)
    },
    modifyCustomFilter(filterId, sendData) {
      editIssueFilter(this.selectedProjectId, filterId, sendData).then((res) => {
        this.fetchCustomFilter()
      })
    },
    resetApplyFilter() {
      this.filters.forEach((filter) => {
        filter.isApplying = false
      })
    },
    onFilterClick(filterId) {
      this.resetApplyFilter()
      const idx = this.filters.findIndex((item) => item.id === filterId)
      this.filters[idx].isApplying = !this.filters[idx].isApplying
      this.emitCustomFilter(this.filters[idx].custom_filter)
    },
    emitCustomFilter(filters) {
      const options = Object.assign({}, filters)
      const result = Object.keys(options).reduce(
        (acc, key) => ({ ...acc, ...{ [keysMap[key] || key]: options[key] }}),
        {}
      )
      this.$emit('apply-filter', result)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-list {
  max-height: 80vh;
  overflow-x: hidden;
  overflow-y: scroll;
  overflow-y: overlay;
  &-name {
    @apply font-medium text-base truncate w-3/5 cursor-pointer;
  }
}
</style>
