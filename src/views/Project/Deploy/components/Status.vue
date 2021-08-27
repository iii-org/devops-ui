<template>
  <div class="status">
    <template v-for="(value, key) in statusCategory">
      <el-popover :key="key" placement="bottom-start" trigger="hover">
        <div v-for="item in value" :key="item" class="status-item">
          <div :class="`icon ${getSubStatusClass(item)}`">
            <em v-if="getSubStatusClass(item)" :class="`el-icon-${icon[getSubStatusClass(item)]}`" />
          </div>
          <div class="item-text">
            {{ statusList[item] }}
          </div>
        </div>
        <div slot="reference" class="item" :class="getStatusClass(key, value)">
          <em v-if="getStatusClass(key, value)" :class="`el-icon-${icon[getStatusClass(key, value)]}`" />
        </div>
      </el-popover>
    </template>
  </div>
</template>

<script>
const status = {
  1: 'Initial',
  2: 'Start Image replication',
  3: 'Finish Image replication',
  4: 'Start Kubernetes deployment ',
  5: 'Finish Kubernetes deployment ',
  9: 'Start Kubernetes deletion',
  10: 'Finish Kubernetes deletion',
  32: 'Deploy stopped',
  3001: 'Error, No Image need to be replicated',
  5001: 'Error, K8s Error'
}
const statusCategory = { 1: [1], 3: [2, 3], 5: [4, 5], 10: [9, 10] }
const icon = { error: 'warning', progress: 'loading', done: 'check' }
export default {
  name: 'Status',
  props: {
    id: {
      type: Number,
      default: 0
    }
  },
  computed: {
    statusCategory() {
      return statusCategory
    },
    statusList() {
      return status
    },
    icon() {
      return icon
    },
    status_id() {
      const id = this.id.toString()
      let intId = this.id
      let status = ''
      if (intId === 32) {
        intId = 0
      } else if (id.length >= 4) {
        intId = parseInt(id.substring(1))
        status = 'error'
      }
      return [intId, status]
    }
  },
  methods: {
    getStatusClass(key, value) {
      if (value.includes(this.status_id[0]) && this.status_id[1] === 'error') {
        return 'error'
      } else if (value.indexOf(this.status_id[0]) === 0) {
        return 'progress'
      } else if (this.status_id[0] >= key) {
        return 'done'
      }
      return null
    },
    getSubStatusClass(object) {
      if (object === this.status_id[0] && this.status_id[1] === 'error') {
        return 'error'
      } else if (object === this.status_id[0]) {
        return 'progress'
      } else if (this.status_id[0] >= object) {
        return 'done'
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.status {
  @apply w-full flex justify-between;
  span {
    @apply w-full;
    > > > .el-popover__reference-wrapper {
      @apply w-full;
    }
  }

  .item {
    @apply w-full px-1 h-7 border-2 border-white border-solid bg-gray-300 items-center justify-center;
    &.error {
      @apply bg-red-300 text-red-800;
    }

    &.progress {
      @apply bg-yellow-300 text-yellow-800;
    }

    &.done {
      @apply bg-green-300 text-green-800;
    }
  }
}

.el-popover {
  .status-item {
    @apply flex justify-start items-center my-2;
    .icon {
      @apply w-7 h-7 rounded-full border-2 border-white border-solid bg-gray-300 flex items-center justify-center mr-1;
      &.error {
        @apply bg-red-300 text-red-800;
      }

      &.progress {
        @apply bg-yellow-300 text-yellow-800;
      }

      &.done {
        @apply bg-green-300 text-green-800;
      }
    }
  }
}
</style>
