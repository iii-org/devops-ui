<script>
/*
  Mixin for pages using el-table and pagination. Things to implement:
  data.searchKey: Indicates what key the search box filters. Default is "name".
  async methods.fetchData: The function to fetch list data. You must return the data array.
 */
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  data() {
    return {
      listData: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      rowHeight: 53, // If you can, detect the real thead cell height
      searchKeys: ['name'],
      keyword: ''
    }
  },
  computed: {
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
    keyword() {
      this.listQuery.page = 1
    }
  },
  created() {
    this.loadData()
  },
  mounted() {
    this.adjustTable()
    const self = this
    window.onresize = () => {
      self.adjustTable()
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
    },
    async onPagination(listQuery) {
      this.listQuery = listQuery
    },
    adjustTable(forceRowNum) {
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
    }
  }
}
</script>
