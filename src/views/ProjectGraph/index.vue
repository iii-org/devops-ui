<script>
import { mapGetters, mapActions } from 'vuex'
import { createGitgraph } from '@gitgraph/js'

export default {
  data() {
    return {
      selectedBranch: ''
    }
  },
  computed: {
    ...mapGetters(['branchesByProject', 'branchesTotalNumByProject'])
  },
  watch: {
    branchesByProject(ary) {
      if (this.selectedBranch !== '') return
      this.selectedBranch = ary[0].branch_name
    }
  },
  async created() {
    await this['branches/getBranchesByProject'](this.$route.params.pId)
    this.listLoading = false
  },
  mounted() {
    this.createGraph()
  },
  methods: {
    ...mapActions(['branches/getBranchesByProject']),
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    handlePull() {},
    handleMerge(index, row) {
      this.mergeDialogVisible = true
      this.selectedBranch = row.branch_name
    },
    handleDelete() {
      this.deleteDialogVisible = true
    },
    createGraph() {
      // Get the graph container HTML element.
      const graphContainer = document.getElementById('graph-container')

      // Instantiate the graph.
      const gitgraph = createGitgraph(graphContainer)

      // Simulate git commands with Gitgraph API.
      const master = gitgraph.branch('master')
      master.commit('Initial commit')

      const develop = gitgraph.branch('develop')
      develop.commit('Add TypeScript')

      const aFeature = gitgraph.branch('a-feature')
      aFeature
        .commit('Make it work')
        .commit('Make it right')
        .commit('Make it fast')

      develop.merge(aFeature)
      develop.commit('Prepare v1')

      master.merge(develop).tag('v1.0.0')
    }
  }
}
</script>

<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Git Graph</span>
      </div>
      <div class="cardBody">
        <el-select v-model="selectedBranch" size="small" placeholder="Select" style="width: 100%">
          <el-option
            v-for="item in branchesByProject"
            :key="item.branch_name"
            :label="item.branch_name"
            :value="item.branch_name"
          />
        </el-select>
        <el-divider />
        <div id="graph-container" />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss">
.cardBody {
  display: flex;
  flex-direction: column;
  height: 100%;
}
#graph-container {
  flex: 1;
}
</style>
