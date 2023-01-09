import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      remote: false,
      listLoading: false,
      listData: [],
      storageType: [],
      notRequiredProject: [
        'Dashboard',
        'ProjectList',
        'Inbox',
        'MessageConsole',
        'AccountManage',
        'SystemActivities',
        'SystemArguments',
        'SystemDeploySettings',
        'SubAdminProjects',
        'SystemPluginManage',
        'Profile',
        'SystemVersion'
      ]
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
    }
  },
  watch: {
    async selectedProject() {
      if (this.remote) {
        await this.initTableData()
      } else {
        await this.loadData()
      }
    }
  },
  async created() {
    if (!this.remote) {
      if (this.storageType.includes('SearchBar')) await this.getInitStoredKeywordData()
      if (this.storageType.includes('SearchFilter')) await this.getInitStoredData()
      if (this.storageType.includes('Pagination')) await this.getStoredListQuery()
      await this.loadData()
    }
  },
  methods: {
    async loadData() {
      if (!this.notRequiredProject.includes(this.$route.name) && this.selectedProjectId === -1) return
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
    },
    async fetchData() {
      return []
    }
  }
}
