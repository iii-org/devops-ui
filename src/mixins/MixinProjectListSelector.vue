<script>
/**
 * the core part of the mixin, combined with MixinElTable and MixinBasicTable
 */
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  data() {
    return {
      listData: [],
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      searchKeys: ['name'],
      keyword: ''
    }
  },
  computed: {
    filteredData() {
      const { listData, searchKeys } = this
      const keyword = this.keyword.toLowerCase()
      if (!listData) return
      return listData.filter(data => {
        let result = false
        for (const value of searchKeys) {
          if (data[value] === null) data[value] = ''
          // distinguish string and number, string to lowercase while number to string, and only Checkmarx uses number
          const columnValue = typeof data[value] === 'string'
            ? data[value].toLowerCase() : data[value].toString()
          result = result || columnValue.includes(keyword)
          if (result) break
        }
        return result
      })
    },
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      if (!this.filteredData) return
      return this.filteredData.slice(start, end)
    }
  },
  watch: {
    keyword() {
      this.listQuery.page = 1
    }
  },
  methods: {
    async loadData(date) {
      if (this.selectedProjectId === -1) return
      this.listLoading = true
      this.listData = await this.fetchData(date)
      this.listLoading = false
    },
    async fetchData() {
      return []
    },
    async onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>
