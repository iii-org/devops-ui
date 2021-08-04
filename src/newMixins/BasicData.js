import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      remote: false,
      listLoading: false,
      listData: []
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
      await this.loadData()
    }
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
    },
    async fetchData() {
      return []
    }
  }
}
