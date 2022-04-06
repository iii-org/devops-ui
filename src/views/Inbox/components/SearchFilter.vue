<template>
  <div>
    <el-popover placement="bottom" trigger="click">
      <h3 style="margin: 0">Absolute time range</h3>
      <el-form>
        <el-form-item>
          <div slot="label">From</div>
          <el-date-picker
            v-model="dateFrom"
            type="date"
            clearable
            align="right"
            placeholder="Pick a day"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions(dateTo)"
          />
        </el-form-item>
        <el-form-item>
          <div slot="label">To</div>
          <el-date-picker
            v-model="dateTo"
            type="date"
            clearable
            align="right"
            placeholder="Pick a day"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions(dateFrom)"
          />
        </el-form-item>
        <el-form-item>
          <div slot="label">{{ $t('general.Type') }}</div>
          <el-select
            v-model="typeList"
            multiple
            placeholder="Select Type"
            @change="onChangeFilter"
          >
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button class="w-full buttonPrimary">Apply</el-button>
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
export default {
  name: 'SearchFilter',
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      typeList: [],
      keyword: '',
      searchVisible: false,
      dateFrom: '',
      dateTo: ''
    }
  },
  computed: {
    displayFilterValue() {
      const list = []
      this.typeList.forEach(item => {
        list.push(this.options[item].label)
      })
      const listJoined = list.join(', ')
      return list.length > 0 ? `${this.$t('general.Filter')}: ${listJoined}` : `${this.$t('general.Filter')}`
    },
    isFilterChanged() {
      return !!this.keyword || this.typeList.length > 0
    }
  },
  watch: {
    keyword(val) {
      this.$emit('update:keyword', val)
    }
  },
  methods: {
    async onChangeFilter() {
      this.$emit('changeFilter')
    },
    cleanFilter() {
      this.typeList = []
      this.keyword = ''
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
