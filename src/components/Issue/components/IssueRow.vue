<template>
  <div class="issue-row">
    <div class="title">
      <el-tooltip :disabled="clientWidth >= scrollWidth" :content="title" placement="top">
        <div ref="title" @click="clickTitle(issue.id)" @contextmenu="contextMenu">
          <Status :name="issue.status.name" size="mini" />
          <Tracker :name="issue.tracker.name" />
          #{{ issue.id }} -
          <el-tag v-for="item in issue.tags" :key="item.id" size="mini" class="mr-1">[{{ item.name }}] </el-tag>
          {{ issue.name }}
          <span v-if="issue.hasOwnProperty('assigned_to') && Object.keys(issue.assigned_to).length > 1">
            ({{ $t('Issue.Assignee') }}: {{ issue.assigned_to.name }} - {{ issue.assigned_to.login }})
          </span>
        </div>
      </el-tooltip>
    </div>
    <div class="action">
      <el-popconfirm
        :confirm-button-text="$t('general.Remove')"
        :cancel-button-text="$t('general.Cancel')"
        icon="el-icon-info"
        icon-color="red"
        :title="$t('Issue.RemoveIssueRelation')"
        @confirm="removeConfirm(issue)"
      >
        <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
          {{ $t('Issue.Unlink') }}
        </el-button>
      </el-popconfirm>
    </div>
  </div>
</template>

<script>
import { Tracker, Status } from '@/components/Issue'

export default {
  name: 'IssueRow',
  components: {
    Tracker,
    Status
  },
  props: {
    issue: {
      type: Object,
      default: () => ({})
    },
    reload: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      clientWidth: 0,
      scrollWidth: 0
    }
  },
  computed: {
    title() {
      const result = []
      if (this.issue.tags) {
        result.push(this.issue.tags.map((tag) => `[${tag.name}]`).join(' '))
      }
      result.push(this.issue.name)
      if (this.issue.assigned_to) {
        result.push(`(${this.$t('Issue.Assignee')}: ${this.issue.assigned_to.name} - ${this.issue.assigned_to.login})`)
      }
      return result.join(' ')
    }
  },
  watch: {
    reload() {
      this.$nextTick(() => {
        this.handleResize()
      })
    }
  },
  mounted: function () {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      if (this.$refs['title']) {
        this.clientWidth = this.$refs['title'].clientWidth
        this.scrollWidth = this.$refs['title'].scrollWidth
      }
    },
    clickTitle(id) {
      this.$emit('click-title', id)
    },
    removeConfirm(issue) {
      this.$emit('remove-confirm', issue)
    },
    contextMenu(id) {
      this.$emit('show-context-menu', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.issue-row {
  @apply flex items-center justify-between p-1;
  .title {
    @apply flex-grow min-w-0;
    div {
      @apply truncate text-sm;
      cursor: context-menu;
    }
  }

  .action {
    @apply flex-none max-w-max;
  }
}
</style>
