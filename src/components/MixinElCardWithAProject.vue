<script>
import ProjectListSelector from '@/components/ProjectListSelector'
import { mapGetters } from 'vuex'

export default {
  name: 'MixinElCardWithAProject',
  components: { ProjectListSelector },
  data() {
    return {
      listData: [],
      listLoading: true,
      searchKey: 'name',
      searchData: ''
    }
  },

  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    filteredData() {
      return this.listData.filter(data => {
        return this.searchData === '' || data[this.searchKey].toLowerCase().includes(this.searchData.toLowerCase())
      })
    }
  },
  watch: {
    selectedProject() {
      this.loadData()
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.fetchData()
      this.listLoading = false
    },
    async fetchData() {
      return []
    }
  }
}
</script>
