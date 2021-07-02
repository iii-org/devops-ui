<template>
  <el-row v-loading="listLoading" :element-loading-text="$t('Loading')" class="app-container">
    <div class="flex">
      <project-list-selector />
    </div>
    <el-divider />
    <el-card class="box-card">
      <div class="cardBody">
        <div v-show="isNoData" style="text-align: center;">{{ $t('general.NoData') }}</div>
        <div v-show="!isNoData" id="graph-container" />
      </div>
    </el-card>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { createGitgraph } from '@gitgraph/js'
import { getGitGraphByRepo } from '@/api/git-graph'
import ProjectListSelector from '@/components/ProjectListSelector'
import { UTCtoLocalTime } from '@/filters'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'

export default {
  name: 'ProgressGitGraph', // ready to refactor
  components: {
    ProjectListSelector
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      listLoading: true,
      isNoData: false
    }
  },
  computed: {
    ...mapGetters(['branchesByProject', 'branchesTotalNumByProject', 'selectedProject'])
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      this.listLoading = true
      try {
        const svgs = document.querySelector('#graph-container')
          ? document.querySelector('#graph-container').children
          : []
        if (svgs && svgs.length > 0) [...svgs].forEach(_svg => _svg.remove())
        const res = await getGitGraphByRepo(this.selectedRepositoryId)
        this.isNoData = !res.data.length
        this.createGraph(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.listLoading = false
      }
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
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
                subject: commit.message,
                author: `${commit.author_name} <${UTCtoLocalTime(commit.committed_date)}>`,
                hash: commit.id
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
    }
  }
}
</script>

<style lang="scss" scoped>
.cardBody {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: auto;
}
#graph-container {
  flex: 1;
}
</style>
