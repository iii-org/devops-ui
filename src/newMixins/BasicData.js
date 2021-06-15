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
    selectedProject() {
      if (this.remote) {
        this.adjustTable()
      }
      this.loadData()
    }
  },
  created() {
    if (!this.remote) { this.loadData() }
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
