<script>
/*
  Extended from MixinElTable, used for pages using el-table and is bound to a selected project.
 */
import MixinBasicTable from '@/components/MixinBasicTable'
import ProjectListSelector from '@/components/ProjectListSelector'
import { mapGetters } from 'vuex'

export default {
  name: 'MixinElTableWithAProject',
  components: { ProjectListSelector },
  mixins: [MixinBasicTable],
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    }
  },
  watch: {
    selectedProject() {
      this.loadData()
      this.listQuery.page = 1
      this.searchData = ''
    }
  }
}
</script>

