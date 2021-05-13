<script>
import Pagination from '@/components/Pagination'
// import { mapGetters } from 'vuex'

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
      keyword: '',
      timeoutId: -1
    }
  },
  computed: {
    // ...mapGetters(['selectedProject', 'userId']),
    // selectedProjectId() {
    //   return this.selectedProject.id
    // },
    pagedData() {
      return this.listData
    }
  },
  watch: {
    // selectedProjectId() {
    //   this.loadData()
    //   this.keyword = ''
    // },
    keyword(val) {
      clearTimeout(this.timeoutId)
      this.timeoutId = window.setTimeout(() => this.loadData(1, 10, val), 1000)
    }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
  },
  methods: {
    async loadData(page, per_page, search) {
      this.listLoading = true
      this.listData = await this.fetchData(page, per_page, search)
      this.listLoading = false
    },
    fetchData() {
      return []
    },
    onPagination(page, per_page, search) {
      const keyword = this.keyword ? this.keyword : search
      this.loadData(page.page, per_page, keyword)
    }
  }
}
</script>
