<template>
  <el-row v-if="issue.family || family" v-loading="issue.hasOwnProperty('isLoadingFamily') && issue.isLoadingFamily">
    <div v-if="issue.hasOwnProperty('isLoadingFamily') && issue.isLoadingFamily" class="p-5" />
    <ul v-else class="family">
      <li v-if="issue.hasOwnProperty('parent') && Object.keys(issue.parent).length > 0">
        <span class="title">{{ $t('Issue.ParentIssue') }}:</span>
        <ul class="issue-list">
          <li class="issue-item">
            <IssueRow
              :issue="issue.parent"
              :reload="reload"
              @click-title="handleEdit"
              @show-context-menu="handleContextMenu(issue.parent, '', $event)"
              @remove-confirm="removeIssueRelation"
            />
          </li>
        </ul>
      </li>
      <li v-if="issue.hasOwnProperty('children') && issue.children.length > 0">
        <span class="title">{{ $t('Issue.ChildrenIssue') }}:</span>
        <ol class="issue-list">
          <template v-for="child in issue.children">
            <li v-if="Object.keys(child).length > 0" :key="child.id" class="issue-item">
              <IssueRow
                :issue="child"
                :reload="reload"
                @click-title="handleEdit"
                @show-context-menu="handleContextMenu(child, '', $event)"
                @remove-confirm="removeIssueRelation"
              />
            </li>
          </template>
        </ol>
      </li>
      <li v-if="issue.hasOwnProperty('relations') && issue.relations.length > 0">
        <span class="title">{{ $t('Issue.RelatedIssue') }}:</span>
        <ol class="issue-list">
          <template v-for="child in issue.relations">
            <li v-if="Object.keys(child).length > 0" :key="child.id" class="issue-item">
              <IssueRow
                :issue="child"
                :reload="reload"
                @click-title="handleEdit"
                @show-context-menu="handleContextMenu(child, '', $event)"
                @remove-confirm="removeRelationIssue"
              />
            </li>
          </template>
        </ol>
      </li>
    </ul>
    <slot />
  </el-row>
</template>

<script>
import { deleteIssueRelation, updateIssue } from '@/api/issue'
import IssueRow from './components/IssueRow'

export default {
  name: 'ExpandSection',
  components: { IssueRow },
  props: {
    issue: {
      type: Object,
      default: () => ({})
    },
    popup: {
      type: Boolean,
      default: false
    },
    family: {
      type: Boolean,
      default: false
    },
    reload: {
      type: [String, Number],
      default: 0
    }
  },
  methods: {
    async removeIssueRelation(issue) {
      this.listLoading = true
      try {
        await updateIssue(issue.id, { parent_id: '' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.loadData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    async removeRelationIssue(issue) {
      const { relation_id } = issue
      this.listLoading = true
      try {
        await deleteIssueRelation(relation_id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.loadData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    loadData() {
      this.$emit('update-list')
    },
    handleEdit(issueId) {
      if (!this.popup) {
        this.$router.push({ name: 'issue-detail', params: { issueId }})
      } else {
        this.$emit('popup-dialog', issueId)
      }
    },
    handleContextMenu(row, column, event) {
      this.$emit('on-context-menu', { row, column, event })
    }
  }
}
</script>

<style lang="scss" scoped>
.family {
  @apply space-y-3;
  .title {
    @apply text-sm font-bold;
  }
  .issue-list {
    @apply space-y-1;
    .issue-item:hover {
      @apply bg-gray-100 text-primary font-bold;
      >>>.el-tag{
        @apply font-normal;
      }
    }
  }
}
</style>
