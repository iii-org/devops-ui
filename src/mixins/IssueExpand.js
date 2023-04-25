/**
 * ! Before using this module, you need to know:
 * 1. The feature of IssueExpand mixins is offer public function.
 */

import { getIssueFamily } from '@/api/issue'
import { IssueExpand } from '@/components/Issue'

/**
 * * How to use IssueExpand component
 * ! for required
 * ? for optional
 *
 * ! @issue {Object}
 * ? @popup {Boolean}
 * ? @family {Boolean}
 * ? @reload {String, Number}
 * ? @isButtonDisabled {Boolean}
 * ! @handleExpandRow {Function}
 * ! @updateList {Function}
 * ? @popupDialog {Function}
 * ? @onContextMenu {Function}
 *
 * * Component example
 *  <IssueExpand
 *    :issue="row"
 *    :popup="true"
 *    :family="countRelationIssue > 0"
 *    :reload="relationVisible"
 *    :is-button-disabled="isButtonDisabled"
 *    @handle-expand-row="handleExpandRow"
 *    @update-list="getIssueFamilyData(issue)"
 *    @popup-dialog="onRelationIssueDialog"
 *    @on-context-menu="onContextMenu"
 *  />
 */

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
      const store = this.$refs['issueList'].layout.store
      const { expandRows } = store.states
      const expandIndex = expandRows.findIndex(x => x.id === row.id)
      if (expandIndex === -1) {
        this.$set(row, 'showQuickAddIssue', false)
      } else {
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
      }
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
