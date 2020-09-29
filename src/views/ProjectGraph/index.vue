<script>
import { mapGetters, mapActions } from 'vuex'
import { createGitgraph } from '@gitgraph/js'
import { getGitGraphByRepo } from '../../api/git-graph'

export default {
  data() {
    return {
      selectedBranch: '',
      listLoading: true
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
    },
    async selectedBranch() {
      this.fetchData()
    }
  },
  async created() {
    await this['projects/getProjectList']()
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    async fetchData() {
      this.listLoading = true
      try {
        const res = await getGitGraphByRepo(this.selectedRepoId)
        this.createGraph(res.data.branch_commit_list)
      } catch (err) {
        console.error(err)
      } finally {
        this.listLoading = false
      }
    },
    createGraph(data) {
      console.log(data)
      // Get the graph container HTML element.
      const graphContainer = document.getElementById('graph-container')

      // Instantiate the graph.
      const gitgraph = createGitgraph(graphContainer)

      data.forEach(branch => {
        const _branch = gitgraph.branch(branch.branch)
        branch.commit_list.forEach(commit => {
          _branch.commit({
            subject: commit.message,
            author: commit.author_name + ' <' + commit.author_name + '>'
          })
        })
      })

      // Simulate git commands with Gitgraph API.
      // const master = gitgraph.branch('master')
      // master.commit('Initial commit')

      // const develop = gitgraph.branch('develop')
      // develop.commit('Add TypeScript')

      // const aFeature = gitgraph.branch('a-feature')
      // aFeature
      //   .commit('Make it work')
      //   .commit('Make it right')
      //   .commit('Make it fast')

      // develop.merge(aFeature)
      // develop.commit('Prepare v1')

      // master.merge(develop).tag('v1.0.0')
    }
  }
}
</script>

<template>
  <div class="app-container" v-loading="listLoading">
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
