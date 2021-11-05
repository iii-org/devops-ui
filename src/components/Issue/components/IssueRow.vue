<template>
  <div class="issue-row">
    <div class="title">
      <div
        @click="clickTitle(issue.id)"
        @contextmenu="contextMenu"
      >
        <status :name="issue.status.name" size="mini" />
        <tracker :name="issue.tracker.name" />
        #{{ issue.id }} - <el-tag v-for="item in issue.tags" :key="item.id" size="mini" class="mr-1">[{{ item.name }}]</el-tag>
        {{ issue.name }}
        <span v-if="issue.hasOwnProperty('assigned_to') && Object.keys(issue.assigned_to).length > 1">
          ({{ $t('Issue.Assignee') }}: {{ issue.assigned_to.name }} - {{ issue.assigned_to.login }})
        </span>
      </div>
    </div>
    <div class="action">
      <el-popconfirm
        :confirm-button-text="$t('general.Remove')"
        :cancel-button-text="$t('general.Cancel')"
        icon="el-icon-info"
        icon-color="red"
        :title="$t('Issue.RemoveIssueRelation')"
        @confirm="removeConfirm(issue.relation_id)"
      >
        <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
          {{ $t('Issue.Unlink') }}
        </el-button>
      </el-popconfirm>
    </div>
  </div>
</template>

<script>
import { Tracker } from '@/components/Issue'
import { Status } from '@/components/Issue'

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
    }
  },
  methods: {
    clickTitle(id) {
      this.$emit('click-title', id)
    },
    removeConfirm(id) {
      this.$emit('remove-confirm', id)
    },
    contextMenu(id) {
      this.$emit('show-context-menu', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.issue-row{
  @apply flex items-center justify-between p-1;
  .title{
    @apply flex-grow min-w-0;
    div{
      @apply truncate text-sm;
      cursor: context-menu;
    }
  }
  .action{
    @apply flex-none max-w-max;
  }
}
</style>
