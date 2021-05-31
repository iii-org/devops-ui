<script>
/*
  Mixin for pages using el-table and pagination. Things to implement:
  data.searchKey: Indicates what key the search box filters. Default is "name".
  async methods.fetchData: The function to fetch list data. You must return the data array.
 */
import MixinProjectListSelector from '@/mixins/MixinProjectListSelector'

export default {
  mixins: [MixinProjectListSelector],
  data() {
    return {
      rowHeight: 53 // If you can, detect the real thead cell height
    }
  },
  created() {
    this.loadData()
  },
  mounted() {
    this.adjustTable()
    window.onresize = () => {
      this.adjustTable()
    }
  },
  methods: {
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
