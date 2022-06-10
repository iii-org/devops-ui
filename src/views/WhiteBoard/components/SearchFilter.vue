<template>
  <div>
    <el-input
      v-if="searchVisible"
      v-model="keyword"
      style="width: 250px"
      :placeholder="$t('general.Search')"
      prefix-icon="el-icon-search"
      clearable
      @blur="searchVisible=!searchVisible"
    />
    <el-button
      v-else
      type="text"
      icon="el-icon-search"
      class="headerTextColor"
      @click="searchVisible=!searchVisible"
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
  </div>
</template>

<script>

export default {
  name: 'SearchFilter',
  data() {
    return {
      searchVisible: false,
      keyword: ''
    }
  },
  computed: {
    isFilterChanged() {
      return !!this.keyword
    }
  },
  watch: {
    keyword(val) {
      this.$emit('update:keyword', val)
    }
  },
  methods: {
    cleanFilter() {
      this.keyword = ''
    }
  }
}
</script>
