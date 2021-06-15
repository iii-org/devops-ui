export default {
  data() {
    return {
      rowHeight: 53 // If you can, detect the real thread cell height
    }
  },
  async mounted() {
    await this.initTableData()
    window.onresize = () => {
      this.initTableData()
    }
  },
  methods: {
    async initTableData() {
      if (this.remote) {
        await this.loadData()
      }
      await this.adjustTable()
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
        const tableHeight = parentHeight - siblingsHeight
        if (forceRowNum) {
          this.listQuery.limit = forceRowNum
        } else {
          this.listQuery.limit = Math.floor(tableHeight / this.rowHeight)
        }
      })
    }
  }
}
