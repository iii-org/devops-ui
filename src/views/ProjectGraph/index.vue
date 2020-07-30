<script>
import { mapGetters, mapActions } from 'vuex'
import { createGitgraph } from '@gitgraph/js'
import { getGitGraphByRepo } from '../../api/git-graph'

export default {
  data() {
    return {
      selectedBranch: ''
    }
  },
  computed: {
    ...mapGetters(['branchesByProject', 'branchesTotalNumByProject', 'projectList'])
  },
  watch: {
    projectList(ary) {
      if (this.selectedBranch !== '') return
      this.selectedBranch = ary[0].name
      this.selectedRepoId = ary[0].project_id
      console.log(this.selectedBranch)
    },
    async selectedBranch() {
      await getGitGraphByRepo(this.selectedRepoId)
    }
  },
  async created() {
    await this['projects/getProjectList']()
    this.listLoading = false
  },
  mounted() {
    this.createGraph()
  },
  methods: {
    ...mapActions(['branches/getBranchesByProject', 'projects/getProjectList']),
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
          <el-option v-for="item in projectList" :key="item.name" :label="item.name" :value="item.name" />
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
