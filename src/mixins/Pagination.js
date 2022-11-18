import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  data() {
    return {
      listQuery: {
        offset: 0,
        limit: 10,
        total: 0,
        page: 1
      }
    }
  },
  computed: {
    pagedData() {
      if (this.remote) { return [] }
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      if (!this.filteredData) return
      return this.filteredData.slice(start, end)
    }
  },
  watch: {
    selectedProject() {
      this.listQuery.page = 1
    }
  },
  methods: {
    async onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
