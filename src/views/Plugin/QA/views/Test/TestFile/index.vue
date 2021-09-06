<template>
  <div class="app-container">
    <project-list-selector>
      <el-button
        id="btn-add-issue"
        slot="button"
        type="success"
        icon="el-icon-plus"
        :disabled="selectedProjectId === -1"
        @click="handleUploadDialog"
      >
        {{ $t('Test.TestFile.UploadTestSet') }}
      </el-button>
      <el-button icon="el-icon-s-operation" @click="filterVisible = !filterVisible" />
      <el-input
        id="input-search"
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        style="width: 250px; float: right"
      />
    </project-list-selector>
    <el-divider />
    <el-row v-if="filterVisible" type="flex" :gutter="10">
      <el-col :span="16">
        <el-form inline label-position="left">
          <el-form-item v-for="item in software" :key="item.id">
            <el-checkbox v-model="item.visible" :label="item.name" />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-table
      ref="testFile"
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
      highlight-current-row
      row-key="file_name"
      :tree-props="{ children: 'child' }"
      height="60vh"
      :row-class-name="getRowClass"
      @expand-change="toggleExpandedRows"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item :label="$t('Issue.Test Plan')">
              <ul>
                <li v-for="plan in scope.row.test_plans" :key="plan.id">
                  <el-link @click="onRelationIssueDialog(plan.id)">
                    <status :name="plan.status.name" size="mini" />
                    <template v-if="plan.tracker">
                      <tracker :name="plan.tracker.name" />
                    </template>
                    <template v-else>{{ $t('Issue.Issue') }}</template>
                    #{{ plan.id }} - {{ plan.name }}
                    <span v-if="plan.assigned_to && Object.keys(plan.assigned_to).length > 0">
                      ({{ $t('Issue.Assignee') }}:{{ plan.assigned_to.name }} - {{ plan.assigned_to.login }})
                    </span>
                  </el-link>
                  <el-popconfirm
                    :confirm-button-text="$t('general.Remove')"
                    :cancel-button-text="$t('general.Cancel')"
                    icon="el-icon-info"
                    icon-color="red"
                    :title="$t('Issue.RemoveIssueRelation')"
                    @confirm="removeTestPlanRelation(plan.project.id, plan.test_files, scope.row.file_name)"
                  >
                    <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                      {{ $t('Issue.Unlink') }}
                    </el-button>
                  </el-popconfirm>
                </li>
              </ul>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Test.TestFile.TestSoftware')" width="150" prop="software_name" />
      <el-table-column :label="$t('File.File')" prop="file_name" show-overflow-tooltip />
      <el-table-column :label="$t('Test.TestFile.TestName')" prop="name" show-overflow-tooltip />
      <el-table-column
        :label="`${$t('ProgressPipelines.Branch')} / ${$t('ProgressPipelines.Commit')}`"
        align="center"
        width="160"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.the_last_test_result && Object.keys(scope.row.the_last_test_result).length > 0">
            <div>
              {{ scope.row.the_last_test_result.branch }}
            </div>
            <el-link
              type="primary"
              target="_blank"
              style="font-size: 16px"
              :href="scope.row.the_last_test_result.commit_url"
            >
              <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />
              {{ scope.row.the_last_test_result.commit_id }}
            </el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="`${$t('ProgressPipelines.TestItems')}`" align="center" width="120">
        <template slot-scope="scope">
          <el-link type="primary" @click="toResultList(scope.row)">
            <template v-if="scope.row.the_last_test_result && Object.keys(scope.row.the_last_test_result).length > 0">
              <div v-if="scope.row.software_name === 'Postman'" class="mt-2">
                {{
                  `${scope.row.the_last_test_result.success}/${scope.row.the_last_test_result.success +
                    scope.row.the_last_test_result.failure}`
                }}
              </div>
              <div
                v-else-if="scope.row.software_name === 'SideeX' && scope.row.the_last_test_result.result"
                class="mt-2"
              >
                {{
                  `${scope.row.the_last_test_result.result.casesPassed}/${
                    scope.row.the_last_test_result.result.casesTotal
                  }`
                }}
              </div>
            </template>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" width="350">
        <template slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="handleRelatedPlan(scope.row)">
            {{ $t('general.Edit') }}
          </el-button>
          <el-button size="small" type="success" icon="el-icon-circle-plus" @click="handleCreatePlan(scope.row)">
            新增計畫
          </el-button>
          <el-popconfirm
            :confirm-button-text="$t('general.Delete')"
            :cancel-button-text="$t('general.Cancel')"
            icon="el-icon-info"
            icon-color="red"
            :title="$t('Issue.DeleteFile')"
            @confirm="deleteTestFile(scope.row.software_name, scope.row.file_name)"
          >
            <el-button slot="reference" type="danger" size="mini" icon="el-icon-delete">
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <el-dialog
      :visible.sync="relatedPlanDialogVisible"
      :close-on-click-modal="false"
      width="80%"
      :show-close="false"
      append-to-body
      destroy-on-close
    >
      <div slot="title" class="hidden" />
      <RelatedPlanDialog
        ref="relatedPlan"
        :collection="selectedCollection"
        @close-dialog="toggleDialogVisible"
        @save="saveCollectionRelation"
      />
    </el-dialog>
    <el-dialog
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      :visible.sync="uploadDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="80%"
      top="8vh"
      :show-close="false"
      append-to-body
      destroy-on-close
    >
      <CollectionFileUploader ref="collectionFileUpload" @update="loadData" />
      <template slot="footer">
        <el-button @click="closeUploadCollection">{{ $t('general.Close') }} </el-button>
        <el-button type="primary" @click="uploadCollection">{{ $t('File.Upload') }} </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ProjectSelector, BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import { mapActions, mapGetters } from 'vuex'
import Fuse from 'fuse.js'
import {
  deleteTestFile,
  deleteTestPlanWithTestFile,
  getTestFileList,
  postTestFile,
  postTestPlanWithTestFile
} from '@/views/Plugin/QA/api/qa'
import RelatedPlanDialog from '../TestFile/components/RelatedPlanDialog'
import Status from '@/components/Issue/Status'
import Tracker from '@/components/Issue/Tracker'
import CollectionFileUploader from '../TestFile/components/CollectionFileUploader'

export default {
  name: 'TestFile',
  components: {
    CollectionFileUploader,
    Tracker,
    Status,
    RelatedPlanDialog
  },
  mixins: [ProjectSelector, BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      filterVisible: false,
      quickAddTopicDialogVisible: false,
      addTopicDialogVisible: false,
      searchKey: 'name',
      parentId: 0,
      parentName: '',
      fixed_version: [],
      software: [],
      softwareSelectAll: true,
      listFilterSoftwareData: [],
      form: {},
      selectedCollection: {},
      relationIssue: {
        visible: false,
        id: null
      },
      relatedPlanDialogVisible: false,
      uploadDialogVisible: false,
      expandedRow: []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userRole', 'userName', 'test_filename']),
    filteredData() {
      return this.listFilterSoftwareData.filter(data => {
        return this.keyword === '' || data[this.searchKey].toLowerCase().includes(this.keyword.toLowerCase())
      })
    },
    softwareValue() {
      return this.software.filter(item => item.visible === true)
    },
    hasUploadFile() {
      if (!this.$refs['collectionFileUpload']) return false
      return this.$refs['collectionFileUpload'].uploadFileList.length > 0
    }
  },
  watch: {
    listData: {
      deep: true,
      handler() {
        this.updateData()
      }
    },
    softwareValue: {
      deep: true,
      handler() {
        this.updateData()
      }
    }
  },
  mounted() {
    this.adjustTable()
    if (this.test_filename) {
      this['qa/removeFileName']()
    }
  },
  methods: {
    ...mapActions(['projects/getProjectList', 'qa/setFileName']),
    async fetchData() {
      let data = await getTestFileList(this.selectedProjectId)
      data = data.data
      this.software = [{ id: 1, name: 'Postman' }, { id: 2, name: 'SideeX' }]
      this.software.forEach((item, idx) => {
        this.$set(this.software[idx], 'visible', true)
      })
      if (this.userRole === 'Engineer') {
        this.keyword = this.userName
      }
      return data
    },
    handleRelatedPlan(collection) {
      this.toggleDialogVisible('relatedPlan')
      this.selectedCollection = collection
    },
    async deleteTestFile(software_name, file_name) {
      this.listLoading = true
      try {
        await deleteTestFile(this.selectedProjectId, software_name, file_name)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.loadData()
      } catch (err) {
        console.err(err)
      }
      this.listLoading = false
    },
    toggleDialogVisible(value) {
      this[value + 'DialogVisible'] = !this[value + 'DialogVisible']
    },
    handleCreatePlan(collection) {
      this['qa/setFileName'](collection)
      this.$router.push({ name: 'create-test-plan' })
    },
    resetFilterVersionSoftwareData() {
      this.listFilterSoftwareData = this.listData
    },
    onToggleSelect() {
      const select = this.software.filter(item => item.visible === true)
      const checker = select.length > 0
      this.software.forEach((item, idx) => {
        this.$set(this.software[idx], 'visible', !checker)
      })
    },
    updateData() {
      this.resetFilterVersionSoftwareData()
      const softwareOpt = {
        keys: ['software_name'],
        useExtendedSearch: true
      }

      if (this.softwareValue.length > 0) {
        this.searchIssueList(this.softwareValue, softwareOpt)
      } else {
        this.listFilterSoftwareData = []
      }
    },
    searchIssueList(value, opt) {
      const fuse = new Fuse(this.listData, opt)
      let search = `="${value}"`
      if (Array.isArray(value) && value.length >= 1) {
        search = { $or: value.map(item => ({ $path: [opt['keys'][0]], $val: `="${item.name}"` })) }
      }
      const res = fuse.search(search)
      this.listFilterSoftwareData = res.map(items => items.item)
    },
    handleEdit(id) {
      this.$router.push({ name: 'issue-detail', params: { issueId: id }})
    },
    emitAddTopicDialogVisible(visible) {
      this.addTopicDialogVisible = visible
      if (!visible) {
        this.$refs['quickAddIssue'].form.name = ''
      }
    },
    async saveCollectionRelation({ collection, test_plans }) {
      const apiRequest = []
      test_plans.append.forEach(item => {
        const data = {
          issue_id: item,
          file_name: collection.file_name,
          software_name: collection.software_name
        }
        apiRequest.push(postTestPlanWithTestFile(this.selectedProjectId, data))
      })
      test_plans.remove.forEach(relation_id => {
        apiRequest.push(deleteTestPlanWithTestFile(this.selectedProjectId, relation_id))
      })
      if (apiRequest.length > 0) {
        return await Promise.all(apiRequest)
          .then(() => {
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Updated'),
              type: 'success'
            })
            this.loadData()
            this.addTopicDialogVisible = false
          })
      }
    },
    uploadCollection() {
      this.$refs['collectionFileUpload'].$refs['uploadForm'].validate(async valid => {
        if (valid) {
          const fileList = await this.$refs['collectionFileUpload'].handleUpload()
          await this.uploadFiles(fileList)
          this.uploadDialogVisible = false
        }
      })
    },
    closeUploadCollection() {
      this.$refs['collectionFileUpload'].resetUpload()
      this.uploadDialogVisible = false
    },
    isParentIssue(row) {
      return row.parent_id === null && row.children.length === 0
    },
    handleUploadDialog() {
      this.uploadDialogVisible = !this.uploadDialogVisible
    },
    getFilterCount(name) {
      return this.listData.filter(item => item.software.name === name).length
    },
    advancedAddIssue(form) {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.form = form
    },
    onRelationIssueDialog(id) {
      this.$router.push({ name: 'test-plan-detail', params: { issueId: id }})
    },
    async removeTestPlanRelation(project_id, file_relation, file_name) {
      this.listLoading = true
      try {
        const id = file_relation.find(item => item.file_name === file_name).id
        await deleteTestPlanWithTestFile(project_id, id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    toResultList(row) {
      this.$router.push({ name: row.software_name.toLowerCase() })
    },
    hasTestPlans(row) {
      return row.hasOwnProperty('test_plans') && row.test_plans.length > 0
    },
    getRowClass({ row }) {
      const result = []
      if (!this.hasTestPlans(row)) {
        result.push('row-expand-cover')
        const getTableRef = this.$refs['testFile']
        if (getTableRef) {
          const getExpanded = this.expandedRow
          if (Array.isArray(getExpanded) && getExpanded.length > 0) {
            const getRow = getExpanded.find(item => item.file_name === row.file_name)
            if (getRow) {
              this.toggleExpandedRows(getRow, getExpanded)
              getTableRef.toggleRowExpansion(getRow, getExpanded)
            }
          }
        }
      }
      result.push('cursor-pointer')
      return result.join(' ')
    },
    toggleExpandedRows(row, expandedRows) {
      this.expandedRow = expandedRows
    },
    async uploadFiles({ fileList, software_name }) {
      this.listLoading = true
      const _this = this
      // use one by one edit issue to upload file
      try {
        const uploadApi = fileList.map(function(item) {
          const sendForm = new FormData()
          sendForm.delete('test_file')
          sendForm.append('test_file', item.raw, item.raw.name)
          return postTestFile(_this.selectedProjectId, software_name, sendForm)
        })
        await Promise.all(uploadApi)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.loadData()
      } catch (err) {
        console.error(err)
        this.$message({
          title: this.$t('general.Error'),
          message: err.message,
          type: 'error'
        })
      }
      this.listLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__header {
  display: none;
}

>>> .row-expand-cover .el-table__expand-column .cell {
  display: none;
}

>>> .el-table__expanded-cell {
  font-size: 0.875em;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
