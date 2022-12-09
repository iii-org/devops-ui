<template>
  <div>
    <el-popover
      placement="bottom"
      trigger="click"
    >
      <el-form>
        <el-form-item :label="$t('Version.Version')">
          <el-select
            ref="selectVersion"
            v-model="selectedVersion"
            :disabled="isLoading"
            :placeholder="$t('Version.SelectVersion')"
            clearable
            filterable
            @change="onBlurSelect"
          >
            <el-option
              v-for="item in versionList"
              :key="item.id"
              :label="getSelectionLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('general.ExpiredStatus')">
          <el-select
            v-model="selectedExpiredStatus"
            :disabled="isLoading"
            :placeholder="$t('RuleMsg.PleaseSelect') + $t('general.ExpiredStatus')"
            clearable
            filterable
            @change="onBlurSelect"
          >
            <el-option
              v-for="item in expiredStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button
        slot="reference"
        icon="el-icon-s-operation"
        class="headerTextColor"
        type="text"
      >
        {{ displayFilterValue }}
        <em class="el-icon-arrow-down el-icon--right" />
      </el-button>
    </el-popover>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button
        class="buttonSecondaryReverse"
        size="small"
        icon="el-icon-close"
        @click="clearSelect"
      >
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  props: {
    versionList: {
      default: () => [],
      type: Array
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    searchData: {
      default: () => ({}),
      type: Object
    }
  },
  data() {
    return {
      selectedVersion: '',
      selectedExpiredStatus: '',
      expiredStatusList: [
        {
          label: this.$t('general.UnassignedDate'),
          value: 'null'
        },

        {
          label: this.$t('general.Expired'),
          value: 'expire'
        },
        {
          label: this.$t('general.Unexpired'),
          value: 'normal'
        }
      ]
    }
  },
  computed: {
    displayFilterValue() {
      const filterWord = []
      if (this.selectedVersion) {
        filterWord.push(this.getSelectionLabel(
          this.versionList.find((item) => (item.id === this.selectedVersion))
        ))
      }
      if (this.selectedExpiredStatus) {
        filterWord.push(
          this.expiredStatusList.find((item) => (item.value === this.selectedExpiredStatus)).label
        )
      }
      return filterWord.length === 0 ? this.$t('general.Filter')
        : this.$t('general.Filter') + `: ${filterWord.concat()}`
    },
    isFilterChanged() {
      return !!this.selectedVersion || !!this.selectedExpiredStatus
    }
  },
  watch: {
    'searchData.selectedVersion'() {
      this.selectedVersion = this.searchData.selectedVersion
    }
  },
  methods: {
    getSelectionLabel(item) {
      const visibleStatus = ['closed', 'locked']
      let result = this.$te('Issue.' + item.name) ? this.$t('Issue.' + item.name) : item.name
      if (item.hasOwnProperty('status') && visibleStatus.includes(item.status)) {
        result += ' (' + (this.$te('Issue.' + item.status) ? this.$t('Issue.' + item.status) : item.status) + ')'
      }
      return result
    },
    onBlurSelect() {
      this.$emit('update:searchData', {
        selectedVersion: this.selectedVersion,
        selectedExpiredStatus: this.selectedExpiredStatus
      })
    },
    clearSelect() {
      this.selectedVersion = null
      this.selectedExpiredStatus = ''
      this.onBlurSelect()
    }
  }
}
</script>
