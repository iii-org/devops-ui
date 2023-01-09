import { getIssueFamily } from '@/api/issue'
import { IssueExpand } from '@/components/Issue'

export default {
  components: { IssueExpand },
  methods: {
    handleExpandRow(row) {
      if (row.family) {
        this.getIssueFamilyData(row)
      } else {
        this.$refs['issueList'].toggleRowExpansion(row, false)
      }
    },
    async getIssueFamilyData(row) {
      try {
        await this.$set(row, 'isLoadingFamily', true)
        const family = await getIssueFamily(row.id)
        const data = family.data
        this.formatIssueFamilyData(row, data)
        this.$set(row, 'isLoadingFamily', false)
      } catch (e) {
        //   null
      }
      return Promise.resolve()
    },
    formatIssueFamilyData(row, data) {
      if (data.hasOwnProperty('parent')) {
        this.$set(row, 'parent', data.parent)
      }
      if (data.hasOwnProperty('children')) {
        this.$set(row, 'children', data.children)
      }
      if (data.hasOwnProperty('relations')) {
        this.$set(row, 'relations', data.relations)
      }
    }
  }
}
