import { getIssueFieldDisplay } from '@/api/issue'
import { Columns } from '@/components/Issue'

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
