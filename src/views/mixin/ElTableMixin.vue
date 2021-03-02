<script>
import variables from '@/styles/variables.scss'

export default {
  mounted() {
    console.log('mixin called.')
    const parentHeight = this.$el.clientHeight
    let siblingsHeight = 0
    for (const child of this.$el.children) {
      if (child.className.match(/\bel-table\b/)) continue
      siblingsHeight += child.clientHeight
      const styles = window.getComputedStyle(child)
      siblingsHeight += parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])
    }
    const eleTable = this.$el.getElementsByClassName('el-table')[0]
    const tableHeight = parentHeight - siblingsHeight - 40 // parent paddings 40 px
    const defaultRowHeight = parseInt(variables['tableRowHeight'])
    const rowHeight = this.rowStyle ? this.rowStyle.height : defaultRowHeight
    this.listQuery.limit = Math.floor((tableHeight - defaultRowHeight) / rowHeight)
    console.log(this.listQuery.limit)
    eleTable.style.maxHeight = `calc(100% - ${siblingsHeight}px - ${(tableHeight - defaultRowHeight) % rowHeight}px + 20px)`
  }
}
</script>
