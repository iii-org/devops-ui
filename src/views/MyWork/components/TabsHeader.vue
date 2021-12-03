<template>
  <el-row
    :gutter="10"
    class="mb-5"
  >
    <el-col
      v-for="tab in tabs"
      :key="tab.id"
      :span="12"
      :md="6"
      class="dashboard-card"
    >
      <div
        class="item"
        :class="{'active': activeTab === tab.id, [tab.id]: tab.id}"
        @click="$emit('update:active-tab', tab.id)"
      >
        <p class="font-bold m-1">
          <em
            v-show="activeTab === tab.id"
            class="el-icon-caret-right"
          />
          {{ $t('MyWork.' + tab.name) }}
          <span class="count">{{ tab.count }}</span>
        </p>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'MyWorkTabsHeader',
  props: {
    tabs: {
      type: Array,
      default: () => [{ id: '', name: '', count: 0 }]
    },
    activeTab: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-card {
  .item {
    @apply px-1.5 py-0.5 md:px-3 md:py-1 rounded-lg bg-gray-200 cursor-pointer hover:shadow-md;
    .divider {
      @apply border-white border-solid border-0 border-b-2;
    }

    .count {
      min-width: 30px;
      min-height: 30px;
      width: max-content;
      height: max-content;
      @apply inline-block m-0 p-1.5 bg-gray-500 rounded-full text-white text-center;
    }

    &.active {
      .count {
        @apply inline-block m-0 p-1.5 bg-danger rounded-full text-white text-center;
      }
    }
  }

  .assigned_to_id {
    @apply hover:bg-gradient-to-br hover:text-white hover:from-green-400 hover:to-blue-500;
    &.active {
      @apply bg-gradient-to-br text-white from-green-400 to-blue-500;
    }
  }

  .author_id {
    @apply hover:bg-gradient-to-br hover:text-white hover:from-pink-400 hover:to-indigo-500;
    &.active {
      @apply bg-gradient-to-br text-white from-pink-400 to-indigo-500;
    }
  }
}
</style>
