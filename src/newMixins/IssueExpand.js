import { deleteIssueRelation, updateIssue } from '@/api/issue'

export default {
  methods: {
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    },
    async removeIssueRelation(childIssueId) {
      this.listLoading = true
      try {
        const formData = this.getFormData({ parent_id: '' })
        await updateIssue(childIssueId, formData)
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
      this.$router.push({ name: 'IssueDetail', params: { issueId }})
    }
  }
}
