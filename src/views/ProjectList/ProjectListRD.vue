<script>
import { mapActions, mapGetters } from 'vuex'
import MixinElTable from '@/components/MixinElTable'
import ElTableColumnTime from '@/components/ElTableColumnTime'

const formTemplate = {
  name: '',
  code: '',
  amount: 0,
  ppm: 0,
  status: false,
  desc: ''
}

export default {
  name: 'ProjectList',
  components: { ElTableColumnTime },
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
  mixins: [MixinElTable],
  data() {
    return {
      dialogVisible: false,
      dialogStatus: 1,
      form: formTemplate,
      confirmLoading: false,
      rowHeight: 70
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal']),
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    }
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
    async fetchData() {
      await this['projects/getProjectList']()
      return this.projectList
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2
      this.form = Object.assign({}, this.form, row)
    },
    handleDelete() {},
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'No Test'
      return success + ' / ' + total
    },
    returnLatestTag(row) {
      const { tags } = row
      if (!tags || tags.length === 0) return 'No Tag'
      return tags[0].name
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['thisForm'].resetFields()
        this.form = formTemplate
      })
    },
    handleConfirm() {
      //   this.dialogVisible = false
      // console.log(this.form)
    },
    copyUrl(id) {
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Copied'),
        type: 'success'
      })
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="clearfix">
      <!-- <span class="newBtn">
        <el-button type="success" @click="handleAdding">
            <i class="el-icon-plus" />
            Add Project
        </el-button>
      </span> -->
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('Project.SearchIdentifier')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
      :cell-style="{ height: rowHeight + 'px' }"
    >
      <el-table-column
        align="center"
        :label="$t('Project.NameIdentifier')"
        :show-overflow-tooltip="true"
        min-width="200"
      >
        <template slot-scope="scope">
          <span style="color: #67c23a">{{ scope.row.display }}</span>
          <br>
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.WorkloadValue')" width="120">
        <template slot-scope="scope">
          {{ scope.row.issues }}
        </template>
      </el-table-column>
      <el-table-column-time prop="next_d_time" :label="$t('Project.UpcomingDeadline')" />
      <el-table-column align="center" :label="$t('Project.Branches')" width="120">
        <template slot-scope="scope">
          <router-link
            v-if="scope.row.branch"
            :to="{
              name: 'branches',
              params: { pId: scope.row.project_id, projectName: scope.row.name, bId: scope.row.repository_ids }
            }"
            style="color: #409eff"
          >
            <span>{{ scope.row.branch }}</span>
          </router-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.LastTest')" width="190">
        <template slot-scope="scope">
          <span v-if="scope.row.last_test_time === ''">No Test</span>
          <el-tooltip v-else placement="bottom" :content="scope.row.last_test_time | UTCtoLocalTime">
            <span>{{ scope.row.last_test_time | relativeTime }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Project.LastTestResult')" width="170">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large" effect="dark">
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else-if="returnTagType(scope.row) === 'danger'" class="el-icon-error" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="GitLab" width="110">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.git_url"
            placement="top"
            width="400"
            trigger="hover"
            :open-delay="300"
            :close-delay="50"
          >
            <p :id="`copy-${scope.$index}`" class="text-center">
              <span class="text-subtitle-1 font-weight-bold">{{ scope.row.git_url }}</span>
            </p>
            <div class="d-flex justify-center">
              <el-button
                class="mr-2"
                icon="el-icon-copy-document"
                circle
                size="mini"
                @click="copyUrl(`copy-${scope.$index}`)"
              />
              <a :href="scope.row.git_url" target="_blank">
                <el-button circle size="mini">
                  <svg-icon icon-class="foreign" />
                </el-button>
              </a>
            </div>
            <el-link slot="reference" :underline="false" style="font-size: 22px">
              <svg-icon icon-class="gitlab" />
            </el-link>
          </el-popover>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Redmine" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.redmine_url"
            target="_blank"
            style="font-size: 22px"
            :underline="false"
            :href="scope.row.redmine_url"
          >
            <svg-icon icon-class="redmine" />
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Harbor" width="110">
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.harbor_url"
            target="_blank"
            style="font-size: 22px"
            :underline="false"
            :href="scope.row.harbor_url"
          >
            <svg-icon icon-class="harbor" />
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="Last Tag">
        <template slot-scope="scope">
          <router-link
            :to="{
              name: 'fileList',
              params: {
                bId: scope.row.id,
                projectName: scope.row.name,
                branchName: scope.row.branch
              }
            }"
            style="color: #409EFF"
          >
            {{ returnLatestTag(scope.row) }}
          </router-link>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="Actions" align="center" width="250px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" /> Delete
          </el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <router-view />
    <el-dialog
      :title="`${dialogStatusText} Project`"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="thisForm" :model="form" label-position="top">
        <el-form-item label="Project Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Project Code" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="Project Owner" prop="owner">
          <el-input v-model="form.owner" />
        </el-form-item>
        <el-col :span="11">
          <el-form-item label="Project Amount" prop="amount">
            <el-input v-model="form.amount" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="2">&nbsp;</el-col>
        <el-col :span="11">
          <el-form-item label="Human Resource/Month" prop="ppm">
            <el-input v-model="form.ppm" type="number" />
          </el-form-item>
        </el-col>
        <el-form-item label="Description" prop="desc">
          <el-input v-model="form.desc" type="textarea" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.clearfix {
  clear: both;

  .newBtn {
    float: right;
    padding-right: 6px;
  }
}
</style>
