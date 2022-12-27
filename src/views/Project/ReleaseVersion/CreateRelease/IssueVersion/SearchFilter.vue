<template>
  <div>
    <el-popover placement="bottom" trigger="click" width="225">
      <el-form>
        <el-form-item :label="$t('general.Search')">
          <el-checkbox
            v-model="isClosed"
            :label="$t('Issue.DisplayClosedIssue')"
            @change="onChangeFilter"
          />
          <el-input
            v-model="keyword"
            :placeholder="$t('Project.SearchProjectNameOrId')"
            prefix-icon="el-icon-search"
            clearable
            @input="onChangeFilter"
          />
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
      <el-button
        class="buttonSecondaryReverse"
        icon="el-icon-close"
        size="small"
        @click="cleanFilter"
      >
        {{ $t('Issue.CleanFilter') }}
      </el-button>
    </template>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SearchFilter',
  data() {
    return {
      isClosed: false,
      keyword: ''
    }
  },
  computed: {
    displayFilterValue() {
      const filterWord = []
      if (this.isClosed) filterWord.push(this.$t('Issue.DisplayClosedIssue'))
      if (this.keyword) filterWord.push(this.keyword)
      return filterWord.length === 0 ? this.$t('general.Filter')
        : this.$t('general.Filter') + `: ${filterWord.concat()}`
    },
    isFilterChanged() {
      return this.isClosed || !!this.keyword
    }
  },
  methods: {
    async onChangeFilter() {
      this.$emit('changeFilter', {
        isClosed: this.isClosed,
        keyword: this.keyword
      })
    },
    cleanFilter() {
      this.isClosed = false
      this.keyword = ''
      this.onChangeFilter()
    }
  }
}
</script>
