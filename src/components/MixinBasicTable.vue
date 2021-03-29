<script>
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'

export default {
  components: { Pagination },
  data: () => ({
    listData: [],
    listLoading: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    searchKeys: ['name'],
    keyword: ''
  }),
  computed: {
    ...mapGetters(['selectedProject', 'userId']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    filteredData() {
      const { listData, searchKeys } = this
      const keyword = this.keyword.toLowerCase()
      return listData.filter(data => {
        let result = false
        for (let i = 0; i < searchKeys.length; i++) {
          const columnValue = data[searchKeys[i]].toLowerCase()
          result = result || columnValue.includes(keyword)
          if (result) break
        }
        return result
      })
    },
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return this.filteredData.slice(start, end)
    }
  },
  watch: {
    selectedProjectId() {
      this.loadData()
      this.listQuery.page = 1
      this.keyword = ''
    },
    keyword() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
    },
    fetchData() {
      return []
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    }
  }
}
</script>
