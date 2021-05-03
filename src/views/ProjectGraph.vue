
<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
    </div>
    <el-divider />
    <el-card v-loading="listLoading" class="box-card">
      <!--      <div v-for="(item,idx) in testData" :key="idx">-->
      <!--        {{ item }}-->
      <!--      </div>-->
      <div class="cardBody">
        <div v-show="isNoData" style="text-align: center;">{{ $t('general.NoData') }}</div>
        <div v-show="!isNoData" id="graph-container" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createGitgraph } from '@gitgraph/js'
import { getGitBranchByRepo, getGitCommitByRepo, getGitGraphByRepo } from '@/api/git-graph'
import ProjectListSelector from '@/components/ProjectListSelector'
import { UTCtoLocalTime } from '@/filters'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'ProjectGraph', // ready to refactor
  components: {
    ProjectListSelector
  },
  mixins: [MixinElTableWithAProject],
  data: () => ({
    listLoading: true,
    isNoData: false,
    testData: []
  }),
  computed: {
    ...mapGetters(['branchesByProject', 'branchesTotalNumByProject', 'selectedProject'])
  },
  watch: {
    selectedProject() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      this.listLoading = true
      try {
        const svgs = document.querySelector('#graph-container').children
        if (svgs && svgs.length > 0) [...svgs].forEach(_svg => _svg.remove())
        const repository_id = this.selectedProject.repository_id
        const res = await getGitGraphByRepo(repository_id)
        this.isNoData = !res.data.length
        this.testData = await this.createGitgraph(res.data)
        // this.createGraph(res.data)
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
    async createGitgraph(data) {
      const repository_id = this.selectedProject.repository_id
      const refes = await getGitBranchByRepo(repository_id)
      // const commit = await getGitCommitByRepo(repository_id, { branch: 'master' })
      console.log(refes.data.branch_list)
      // console.log(commit.data)
      const graphContainer = document.getElementById('graph-container')
      const gitgraph = createGitgraph(graphContainer)
      const commits = {}
      const parentObj = {}
      const childrenObj = {}
      const parents = {}
      // const parents_branch = {}
      const graph_branch = {}
      const commit_order = []
      const master = gitgraph.branch('master')
      const branch = { master: master }
      let last_commit

      function Commit(commit) {
        this.parent = []
        this.children = []
        for (const key in commit) {
          this[key] = commit[key]
        }
        delete this.branch_name

        this.branches = [commit.branch_name]
        this.addBranch = function(branch_name) {
          this.branches.push(branch_name)
        }

        const id = commit.id
        commits[id] = this

        this.parent_ids.forEach((parent) => {
          // if (!(parent in parentObj)) {
          //   parentObj[parent] = []
          // }
          if (!(parent in childrenObj)) {
            childrenObj[parent] = []
          }
          // parentObj[parent].push(this)
          childrenObj[parent].push(commits[id])
        })
        if (childrenObj[id]) {
          this.children = childrenObj[id]
        } else {
          this.children = []
        }
        // this.linkParentCommit = function(idx, Commit) {
        //   this.parent[idx] = Commit
        // }

        // this.linkChildrenCommit = function(idx, Commit) {
        //   this.children[idx] = Commit
        // }

        return Promise.resolve(this)
      }

      for (const commit of data.reverse()) {
        const nowCommit = await new Commit(commit)
        // if (parentObj.hasOwnProperty(commit.id)) {
        //   parentObj[commit.id].forEach((childCommit, idx) => {
        //     childCommit.linkParentCommit(idx, nowCommit)
        //   })
        // }
        // if (childrenObj.hasOwnProperty(commit.id)) {
        //   childrenObj[commit.id].forEach((childCommit, idx) => {
        //     childCommit.linkParentCommit(idx, nowCommit)
        //   })
        // }
        commit_order.push(nowCommit)
      }

      let startPoint = commit_order[commit_order.length - 1]
      branch[startPoint.id] = master
      const commitMessage = {
        subject: startPoint.message,
        author: `${startPoint.author_name} <${UTCtoLocalTime(startPoint.committed_date)}>`,
        hash: startPoint.id
      }
      // console.log(commitMessage)
      branch[startPoint.id].commit(commitMessage)
      // console.log(startPoint.children.length)
      startPoint = startPoint.children
      // console.log(startPoint.length, startPoint)
      while (startPoint.length > 0) {
        const splitBranch = startPoint.length > 1
        startPoint.forEach((item, idx) => {
          const commitMessage = {
            subject: item.message,
            author: `${item.author_name} <${UTCtoLocalTime(item.committed_date)}>`,
            hash: item.id
          }
          if (item.parent_ids.length >= 2 && idx === 0) {
            branch[item.id] = branch[item.parent_ids[idx + 1]].merge(branch[item.parent_ids[idx]], item.message)
          } else if (splitBranch && idx < 1) {
            branch[item.id] = gitgraph.branch('hi').commit(commitMessage)
            // console.log(item.message, item.parent_ids[idx], branch)
          } else {
            branch[item.id] = branch[item.parent_ids[0]].commit(commitMessage)
          }
          startPoint = item.children
        })
      }

      return Promise.resolve(commit_order.map((item) => ({ id: item.id, date: item.committed_date, children: item.children })))
      // commit_order.reverse().forEach((commit) => {
      //   console.log(commit)
      // })
      // commit_order.forEach((id) => {
      //   const commit = commits[id]
      //   // 繼承分岔點
      //   // if (commit.parent_ids.length >= 2) {
      //   //   const masterMerge = Object.values(graph_branch).find((branch) => (branch.name === 'master'))
      //   //   const mergedBranch = Object.values(graph_branch).find((branch) => (branch.name === '1'))
      //   //   console.log(masterMerge, mergedBranch)
      //   //   masterMerge.graph.merge(mergedBranch.graph, commit.message)
      //   // }
      //   commit.parent_ids.forEach((parent) => {
      //     const subCommit = parents[parent].find((item) => (commit.id === item.id))
      //     const subCommitIndex = parents[parent].findIndex((item) => (commit.id === item.id))
      //     let branch
      //     // 檢查上個點是不是有分支
      //     if (subCommitIndex > 0) {
      //       branch = parents_branch[parent]
      //     } else if (last_commit && last_commit.last_id === parent) {
      //       branch = last_commit
      //     } else {
      //       branch = new Branch('master')
      //     }
      //     last_commit = branch.addCommit(commit)
      //     branch.graph.commit({
      //       subject: subCommit.message,
      //       author: `${subCommit.author_name} <${UTCtoLocalTime(subCommit.committed_date)}>`
      //       // hash: commit.id
      //     })
      //     console.log(parents)
      //   })
      //   // 當前點的分岔檢查
      //   if (id in parents && parents[id].length >= 2) {
      //     const mainBranch = Object.values(graph_branch).find((branch) => (branch.last_id === id))
      //     parents[id].forEach((parent, idx) => {
      //       console.log(mainBranch)
      //       if (mainBranch) {
      //         parents_branch[commit.id] = new Branch(idx.toString(), mainBranch)
      //       } else {
      //         parents_branch[commit.id] = new Branch(idx.toString())
      //       }
      //     })
      //   }
      // })
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

<style lang="scss">
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
