<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ElTableMixin from '@/components/MixinElTable'

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      searchData: '',
      dialogVisible: false,
      mergeDialogVisible: false,
      deleteDialogVisible: false,
      newBranchName: '',
      newBranchFrom: 'master',
      commitMsg: '',
      selectedBranch: '',
      deleteBrancheName: '',
      tagDialogVisible: false,
      tagVersion: '',
      tagReleaseNote: '',
      newBranchBtnLoading: false,
      deleteBranchBtnLoading: false,
      mergeBranchBtnLoading: false,
      newTagBtnLoading: false,
      listTotal: 0, // 總筆數,
      mergeBranches: []
    }
  },
  computed: {
    ...mapGetters(['branchesByProject', 'branchesTotalNumByProject']),
    rId() {
      return this.$route.params.pId
    },
    bId() {
      return this.$route.params.bId
    },
    projectName() {
      return this.$route.params.projectName
    },
    mixins: [ElTableMixin],
    pagedData() {
      const listData = this.branchesByProject.filter(data => {
        if (
          this.searchData === '' ||
          data.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
          data.last_commit_message.toLowerCase().includes(this.searchData.toLowerCase()) ||
          data.short_id.toLowerCase().includes(this.searchData.toLowerCase())
        ) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return listData.slice(start, end)
    }
  },
  async created() {
    if (!this.$route.params.bId) return
    await this['branches/getBranchesByProject'](this.$route.params.bId)
    this.listLoading = false
  },
  methods: {
    ...mapActions([
      'branches/getBranchesByProject',
      'branches/newBranch',
      'branches/deleteBranch',
      'branches/mergeBranch',
      'tags/newTag'
    ]),
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    handlePull() {},
    handleCommitClick(index, row) {
      this.$router.push({
        name: 'commitList',
        params: {
          rId: this.$route.params.bId,
          bId: row.id,
          projectName: this.projectName,
          branchName: row.name
        }
      })
    },
    handleMerge(index, row) {
      this.mergeBranches = [...this.branchesByProject]
      const listData = this.mergeBranches.filter(data => {
        if (data.name !== row.name) {
          return data
        }
      })
      this.mergeBranches = listData
      this.mergeDialogVisible = true
      this.newBranchFrom = this.mergeBranches[0].name
      this.selectedBranch = row.name
    },
    handleDelete(index, row) {
      this.deleteDialogVisible = true
      this.selectedBranch = row.name
    },
    async handleNewBranch() {
      if (this.newBranchName === '') return
      this.newBranchBtnLoading = true
      const res = await this['branches/newBranch']({
        rId: this.bId,
        data: { branch: this.newBranchName, ref: this.newBranchFrom }
      })
      this.newBranchBtnLoading = false
      if (res.message === 'success') {
        this.dialogVisible = false
        this.$notify({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Created'),
          type: 'success'
        })
      }
    },
    async handleDeleteModal() {
      if (!this.$route.params.bId) return
      if (this.selectedBranch !== this.deleteBrancheName) {
        return this.$notify({
          title: this.$t('general.Error'),
          message: this.$t('Notify.WrongBranchName'),
          type: 'error'
        })
      }
      this.deleteBranchBtnLoading = true
      await this['branches/deleteBranch']({ rId: this.$route.params.bId, bName: this.deleteBrancheName })
      this.deleteBranchBtnLoading = false
      this.deleteDialogVisible = false
    },
    async handleMergeBranch() {
      this.mergeBranchBtnLoading = true
      await this['branches/mergeBranch']({
        rId: this.bId,
        data: {
          schemas: {
            source_branch: this.selectedBranch,
            target_branch: this.newBranchFrom,
            title: 'merged_by_api'
            // merge_commit_message: this.commitMsg
          }
        }
      })
      this.mergeBranchBtnLoading = false
      this.mergeDialogVisible = false
    },
    async handleNewTag() {
      if (!this.bId) return
      if (this.tagVersion === '') {
        return this.$notify({
          title: this.$t('general.Error'),
          message: this.$t('Notify.WrongTagVersionName'),
          type: 'error'
        })
      }
      this.newTagBtnLoading = true
      const res = await this['tags/newTag']({
        rId: this.bId,
        data: {
          tag_name: this.tagVersion,
          ref: this.newBranchFrom,
          message: this.tagReleaseNote,
          release_description: this.tagReleaseNote
        }
      })
      this.newTagBtnLoading = false
      if (res.message === 'success') {
        this.newTagBtnLoading = false
        this.tagDialogVisible = false
        this.$notify({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Created'),
          type: 'success'
        })
      }
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <h3>Projects : {{ projectName }}</h3>
      <span class="newBtn">
        <el-button type="primary" @click=";(dialogVisible = true), (newBranchName = '')">
          <i class="el-icon-plus" />
          New Branch
        </el-button>
      </span>
      <span class="newBtn">
        <el-button
          type="success"
          @click=";(tagDialogVisible = true), (newBranchFrom = ''), (tagVersion = ''), (tagReleaseNote = '')"
        >
          <i class="el-icon-price-tag" />
          New Tag
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        placeholder="Filter by Name/Message/ID"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"
      /></el-input>
    </div>
    <el-divider />

    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      height="100%"
    >
      <el-table-column label="Branch Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <!-- <router-link
            :to="{
              name: 'fileList',
              params: {
                bId: bId,
                projectName: projectName,
                branchName: scope.row.name
              }
            }"
            style="color: #409EFF"
          >
            <span>{{ scope.row.name }}</span>
            <i class="el-icon-document" />
          </router-link> -->
          <span>{{ scope.row.name }}</span>
          <i class="el-icon-document" />
        </template>
      </el-table-column>
      <el-table-column label="Last Commit Message" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.last_commit_message }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Commit Time" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ new Date(scope.row.last_commit_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="Commit ID" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.short_id }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="350">
        <!-- <template slot="header">
          <el-input :v-model="search2" size="mini" placeholder="Type to search" />
        </template> -->
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="primary" @click="handlePull(scope.$index, scope.row)">Pull</el-button> -->
          <el-button size="mini" type="primary" @click="handleCommitClick(scope.$index, scope.row)">
            <i class="el-icon-finished" />
            Commits&nbsp;
          </el-button>
          <el-button size="mini" type="warning" @click="handleMerge(scope.$index, scope.row)">Merge</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog title="New Branch" :visible.sync="dialogVisible" width="50%" :close-on-click-modal="false">
      <h4>Branch Name</h4>
      <el-input v-model="newBranchName" size="small" placeholder="" />
      <h4>From</h4>
      <el-select v-model="newBranchFrom" size="small" placeholder="Select" style="width: 100%">
        <el-option v-for="item in branchesByProject" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <!-- <h4>Commit Message :</h4>
      <el-input v-model="commitMsg" type="textarea" :rows="3" /> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="newBranchBtnLoading" @click="handleNewBranch">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="'Merge'" :visible.sync="mergeDialogVisible" width="50%">
      <h3>From: {{ selectedBranch }}</h3>
      <el-divider />
      <h4>Merge into</h4>
      <el-select v-model="newBranchFrom" size="small" placeholder="Select" style="width: 100%">
        <el-option v-for="item in mergeBranches" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <!-- <h4>Commit Message :</h4>
      <el-input v-model="commitMsg" type="textarea" :rows="3" /> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="mergeDialogVisible = false">Cancel</el-button>
        <el-button type="warning" :loading="mergeBranchBtnLoading" @click="handleMergeBranch">Merge</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Delete Branch" :visible.sync="deleteDialogVisible" width="50%">
      <h3><i class="el-icon-warning" style="color:#F56C6C" /> Please Input Full Branch Name to comfirm the deletion</h3>
      <el-input v-model="deleteBrancheName" placeholder="" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">Cancel</el-button>
        <el-button type="danger" :loading="deleteBranchBtnLoading" @click="handleDeleteModal">Delete</el-button>
      </span>
    </el-dialog>

    <el-dialog title="New Tag" :visible.sync="tagDialogVisible" width="50%" :close-on-click-modal="false">
      <h4>Tag Version</h4>
      <el-input v-model="tagVersion" size="small" placeholder="" />
      <h4>@ Branch</h4>
      <el-select v-model="newBranchFrom" size="small" placeholder="Select" style="width: 100%">
        <el-option v-for="item in branchesByProject" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <br />
      <br />
      <h4>Release Note :</h4>
      <el-input v-model="tagReleaseNote" type="textarea" :rows="3" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="tagDialogVisible = false">Cancel</el-button>
        <el-button type="success" :loading="newTagBtnLoading" @click="handleNewTag">Confirm</el-button>
      </span>
    </el-dialog>
    <router-view />
  </div>
</template>

<style lang="css" scoped>
.newBtn{
  float:right;
  padding-right: 6px;
}
</style>
