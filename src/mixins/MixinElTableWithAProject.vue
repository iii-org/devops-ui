<script>
/*
  Extended from MixinElTable, used for pages using el-table and is bound to a selected project.
 */
import MixinElTable from '@/mixins/MixinElTable'
import ProjectListSelector from '@/components/ProjectListSelector'
import { mapGetters } from 'vuex'

export default {
  name: 'MixinElTableWithAProject',
  components: { ProjectListSelector },
  mixins: [MixinElTable],
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    selectedRepositoryId() {
      return this.selectedProject.repository_ids[0]
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
