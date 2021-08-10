import { deleteIssueRelation, updateIssue } from '@/api/issue'

export default {
  name: 'ExpandSection',
  methods: {
    async removeIssueRelation(childIssueId) {
      this.listLoading = true
      try {
        await updateIssue(childIssueId, { parent_id: '' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    async removeRelationIssue(relation_id) {
      this.listLoading = true
      try {
        await deleteIssueRelation(relation_id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    handleEdit(issueId) {
      this.$router.push({ name: 'issue-detail', params: { issueId }})
    }
  }
}
