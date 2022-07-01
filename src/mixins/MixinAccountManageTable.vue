<script>
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
      keyword: '',
      timeoutId: -1,
      rowHeight: 53
    }
  },
  computed: {
    pagedData() {
      return this.listData
    }
  },
  watch: {
    keyword(val) {
      clearTimeout(this.timeoutId)
      this.timeoutId = window.setTimeout(() => this.loadData(1, this.listQuery.per_page, val), 1000)
    }
  },
  mounted() {
    this.resizeTable()
    window.onresize = () => {
      this.resizeTable()
    }
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
    onPagination(page, search) {
      const keyword = this.keyword ? this.keyword : search
      this.resizeTable(page.page, keyword)
    },
    adjustTable(forceRowNum) {
      clearTimeout(this.timeoutId)
      this.timeoutId = window.setTimeout(() => {
        this.$nextTick(function() {
          let siblingsHeight = 0
          const $table = this.$el.getElementsByClassName('el-table')[0]
          if (!$table) {
            return // Component not ready yet, will be called after
          }
          const parentNode = $table.parentNode
          const parentHeight = parentNode.clientHeight
          for (const child of parentNode.children) {
            if (child.className.match(/\bel-table\b/)) continue
            siblingsHeight += child.clientHeight
            const styles = window.getComputedStyle(child)
            siblingsHeight += parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])
          }
          const eleTable = this.$el.getElementsByClassName('el-table')[0]
          const tableHeight = parentHeight - siblingsHeight - 40 // parent paddings 40 px
          const defaultRowHeight = 53 // FIXME: Detect real cell height
          if (forceRowNum) {
            this.listQuery.limit = forceRowNum
            eleTable.style.maxHeight = null
          } else {
            this.listQuery.limit = Math.floor((tableHeight - defaultRowHeight) / this.rowHeight)
            eleTable.style.maxHeight = `calc(100% - ${siblingsHeight}px - ${(tableHeight - defaultRowHeight) %
              this.rowHeight}px + 20px)`
          }
        })
      })
    },
    resizeTable(page, keyword) {
      this.adjustTable()
      this.timeoutId = window.setTimeout(() => this.loadData(page, this.listQuery.limit, keyword), 100)
    }
  }
}
</script>
