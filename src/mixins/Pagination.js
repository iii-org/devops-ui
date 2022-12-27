
import { mapActions } from 'vuex'
import { Pagination } from '@/components'

export default {
  components: { Pagination },
  data() {
    return {
      storageName: '',
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
  async mounted() {
    // await this.getStoredListQuery()
  },
  methods: {
    ...mapActions('projects', ['getListQuery', 'setListQuery']),
    async onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async getStoredListQuery() {
      if (!this.storageName) return
      const key = this.storageName
      const storeListQuery = await this.getListQuery()
      const storedTabQuery = storeListQuery[key]
      if (storedTabQuery !== undefined) {
        this.listQuery = storedTabQuery
      //   this.fetchData()
      // } else {
      //   this.fetchData()
      }
      return Promise.resolve()
    },
    async handleCurrentChange(val) {
      this.listQuery.offset = val.limit * val.page - val.limit
      this.listQuery.limit = val.limit
      this.listQuery.page = val.page
      await this.loadData()
      if (this.storageName) {
        const key = this.storageName
        const storeListQuery = await this.getListQuery()
        storeListQuery[key] = this.listQuery
        await this.setListQuery(storeListQuery)
      }
    },
    setNewListQuery(pageInfo) {
      const { offset, limit, current, total, pages } = pageInfo
      if (pages !== 0 && current > pages) {
        this.resetListQuery()
      } else {
        this.listQuery = { offset, limit, total, page: current }
      }
    },
    async resetListQuery() {
      this.listQuery.offset = 0
      this.listQuery.page = 1
      if (this.storageName) {
        const key = this.storageName
        const storeListQuery = await this.getListQuery()
        storeListQuery[key] = this.listQuery
        await this.setListQuery(storeListQuery)
      }
      await this.loadData()
    }
  }
}
