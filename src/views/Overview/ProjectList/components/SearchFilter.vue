<template>
  <div>
    <el-popover placement="bottom" trigger="click">
      <el-form>
        <el-form-item>
          <div slot="label">{{ $t('general.Active') }}</div>
          <el-select
            v-model="isDisabled"
            multiple
            :placeholder="$t('Issue.SelectStatus')"
            @change="onChangeFilter"
          >
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button slot="reference" icon="el-icon-s-operation" type="text"> {{ listFilter }}
        <i class="el-icon-arrow-down el-icon--right" />
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
    <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">
      {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
    </el-button>
    <template v-if="isFilterChanged">
      <el-divider direction="vertical" />
      <el-button size="small" icon="el-icon-close" @click="cleanFilter">
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  data() {
    this.options = [{
      value: 0,
      label: this.$t('general.Enable')
    }, {
      value: 1,
      label: this.$t('general.Disable')
    }]
    return {
      isDisabled: [],
      keyword: '',
      searchVisible: false
    }
  },
  computed: {
    listFilter() {
      const list = []
      this.isDisabled.forEach(item => {
        list.push(this.options[item].label)
      })
      const listJoined = list.join(', ')
      const listFilter = list.length > 0 ? `${this.$t('general.Filter')}: ${listJoined}` : `${this.$t('general.Filter')}`
      return listFilter
    },
    isFilterChanged() {
      return !!this.keyword || this.isDisabled.length > 0
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
      this.isDisabled = []
      this.keyword = ''
      this.onChangeFilter()
    }
  }
}
</script>
