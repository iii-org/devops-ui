<script>
/*
  Extended from MixinElTable, used for pages using el-table and is bound to a selected project.
 */
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'MixinElTableWithAProject',
  mixins: [MixinElTable],
  watch: {
    projectSelectedId() {
      this.loadData()
      this.listQuery.page = 1
      this.searchData = ''
    }
  }
}
</script>

