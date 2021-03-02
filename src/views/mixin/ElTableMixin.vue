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
    const tableHeight = parentHeight - siblingsHeight - 40 // parent paddings 40 px
    const eleTable = this.$el.getElementsByClassName('el-table')[0]
    const rowHeight = parseInt(variables['tableRowHeight'])
    this.listQuery.limit = tableHeight / rowHeight - 1
    eleTable.style.maxHeight = `calc(100% - ${siblingsHeight}px - ${tableHeight % rowHeight}px + 13px)`
  }
}
</script>
