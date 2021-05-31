<script>
import MixinProjectListSelector from '@/mixins/MixinProjectListSelector'
import { mapGetters } from 'vuex'

export default {
  mixins: [MixinProjectListSelector],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['selectedProject', 'userId']),
    selectedProjectId() {
      return this.selectedProject.id
    }
  },
  watch: {
    selectedProjectId() {
      this.loadData()
      this.listQuery.page = 1
      this.keyword = ''
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
  }
}
</script>
