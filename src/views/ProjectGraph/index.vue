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
      this.selectedBranch = ary[0].repository_ids
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
        const res = await getGitGraphByRepo(this.selectedBranch)
        this.createGraph(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.listLoading = false
      }
    },
    createGraph(data) {
      // Get the graph container HTML element.
      const graphContainer = document.getElementById('graph-container')

      // Instantiate the graph.
      const gitgraph = createGitgraph(graphContainer)

      const branches = {}
      const commits = {}
      const commit_order = []

      function Commit(json) {
        this.children = []
        for (const key in json) {
          this[key] = json[key]
        }
        delete this.branch_name
        this.branches = [json.branch_name]
        this.addBranch = function(branch_name) {
          this.branches.push(branch_name)
        }
        this.mainBranch = function() {
          if (this.branches.includes('master')) {
            return 'master'
          }
          if (this.branches.includes('main')) {
            return 'main'
          }
          return this.branches[0]
        }
      }

      function Branch(name) {
        this.name = name
        this.head = null
        this.graph = undefined

        this.addCommit = function(commit) {
          if (this.head == null) {
            this.graph = gitgraph.branch(this.name)
          }
          if (commit.parent_ids.length <= 1) {
            // Regular commit
            if (this.head == null || this.head.id === commit.parent_ids[0]) {
              // Check if new branch begins
              const commit_opts = {
                author: commit.author_name,
                hash: commit.id,
                subject: commit.message
              }
              this.graph.commit(commit_opts)
              this.headsTo(commit)
            } else {
              for (let i = 1; i < 9; i++) {
                const newName = `${this.name}_${i}`
                if (!(newName in branches)) {
                  const newBranch = new Branch(newName)
                  branches[newName] = newBranch
                  newBranch.addCommit(commit)
                  break
                }
              }
            }
          } else if (commit.parent_ids.length === 2) {
            // Merge
            for (const k in branches) {
              if (k === this.name) continue
              const ob = branches[k]
              if (ob.head.id === commit.parent_ids[0] || ob.head.id === commit.parent_ids[1]) {
                const merge_opts = {
                  branch: ob.name,
                  commitOptions: {
                    author: commit.author_name,
                    hash: commit.id,
                    subject: commit.message
                  }
                }
                this.graph.merge(merge_opts)
                this.headsTo(commit)

                break
              }
            }
          }
        }

        this.headsTo = function(commit) {
          this.head = commit
          for (const i in commit.tags) {
            this.graph.tag(commit.tags[i])
          }
        }
      }
      // Merge same commits
      data.forEach(commit_json => {
        const id = commit_json.id
        if (id in commits) {
          commits[id].addBranch(commit_json.branch_name)
          return
        }
        commits[id] = new Commit(commit_json)
        commit_order.push(id)
      })
      // Trace commit log
      commit_order.forEach(id => {
        const commit = commits[id]
        const branch_name = commit.mainBranch()
        let branch
        if (branch_name in branches) {
          branch = branches[branch_name]
        } else {
          branch = new Branch(branch_name)
          branches[branch_name] = branch
        }
        branch.addCommit(commit)
      })
      // data.forEach(branch => {
      //   const _branch = gitgraph.branch(branch.branch)
      //   branch.commit_list.forEach(commit => {
      //     _branch.commit({
      //       subject: commit.message,
      //       author: commit.author_name + ' <' + commit.author_name + '>'
      //     })
      //   })
      // })
      //
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
          <el-option v-for="item in projectList" :key="item.name" :label="item.name" :value="item.repository_ids" />
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
