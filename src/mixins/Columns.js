/**
 * ! Before using this module, you need to know:
 * 1. The feature of Columns mixins is define table column that need to show up.
 */

import { getIssueFieldDisplay } from '@/api/issue'
import { Columns } from '@/components/Issue'

/**
 * * How to use Columns component
 * ! for required
 * ? for optional
 *
 * ! @columnsOptions {Array}
 * ! @displayFields {Array}
 * ? @filterValue {Object}
 * ! @type {String}
 *
 * * Component example
 *  <Columns
 *    :columns-options="columnsOptions"
 *    :display-fields.sync="displayFields"
 *    :filter-value="filterValue"
 *    :type="'issue_list' or 'wbs_cache'"
 *  />
 */

export default {
  components: { Columns },
  data() {
    return {
      columnsOptions: Object.freeze([
        { display: this.$t('Issue.project'), field: 'project' },
        { display: this.$t('Issue.name'), field: 'name' },
        { display: this.$t('Issue.tracker'), field: 'tracker' },
        { display: this.$t('Issue.status'), field: 'status' },
        { display: this.$t('Issue.fixed_version'), field: 'fixed_version' },
        { display: this.$t('Issue.StartDate'), field: 'StartDate' },
        { display: this.$t('Issue.EndDate'), field: 'EndDate' },
        { display: this.$t('Issue.priority'), field: 'priority' },
        { display: this.$t('Issue.assigned_to'), field: 'assigned_to' },
        { display: this.$t('Issue.DoneRatio'), field: 'DoneRatio' }
      ]),
      displayFields: []
    }
  },
  computed: {
    columns() {
      if (this.displayFields.length <= 0) {
        return this.columnsOptions.map(item => item.field)
      }
      return this.displayFields
    },
    deploy_column() {
      return this.columnsOptions.filter((item) => this.columns.includes(item.field))
    }
  },
  async mounted() {
    await this.loadDisplayColumns()
  },
  methods: {
    async loadDisplayColumns() {
      const res = await getIssueFieldDisplay({
        project_id: this.filterValue.project || this.selectedProjectId,
        type: 'issue_list'
      })
      this.displayFields = res.data
    }
  }
}
