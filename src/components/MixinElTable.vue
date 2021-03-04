<script>
export default {
  mounted() {
    const parentHeight = this.$el.clientHeight
    let siblingsHeight = 0
    const parentNode = this.$el.getElementsByClassName('el-table')[0].parentNode
    for (const child of parentNode.children) {
      if (child.className.match(/\bel-table\b/)) continue
      siblingsHeight += child.clientHeight
      const styles = window.getComputedStyle(child)
      siblingsHeight += parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])
    }
    const eleTable = this.$el.getElementsByClassName('el-table')[0]
    const tableHeight = parentHeight - siblingsHeight - 40 // parent paddings 40 px
    const defaultRowHeight = 53 // FIXME: Detect real cell height
    const rowHeight = this.rowHeight ? this.rowHeight : defaultRowHeight
    this.listQuery.limit = Math.floor((tableHeight - defaultRowHeight) / rowHeight)
    eleTable.style.maxHeight = `calc(100% - ${siblingsHeight}px - ${(tableHeight - defaultRowHeight) % rowHeight}px + 20px)`
    // console.log(tableHeight, rowHeight, this.listQuery.limit, eleTable.style.maxHeight)
  }
}
</script>
