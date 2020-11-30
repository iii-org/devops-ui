<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import { formatTime } from '../../utils/index.js'

const formTemplate = {
  name: '',
  code: '',
  amount: 0,
  ppm: 0,
  status: false,
  desc: ''
}

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
      dialogVisible: false,
      dialogStatus: 1,
      listLoading: true,
      listQuery: {
        page: 1, // 目前第幾頁
        limit: 10 // 一頁幾筆
      },
      listTotal: 0, // 總筆數
      form: formTemplate,
      confirmLoading: false,
      searchData: ''
    }
  },
  computed: {
    ...mapGetters(['projectList', 'projectListTotal']),
    pagedData() {
      const listData = this.projectList.filter(data => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    },
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
  async created() {
    await this['projects/getProjectList']()
    this.listLoading = false
  },
  methods: {
    ...mapActions(['projects/getProjectList']),
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
    onPagination(listQuery) {
      this.listQuery = listQuery
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
      console.log(this.form)
    },
    myFormatTime(time) {
      if (time == null) {
        return '-'
      } else {
        return formatTime(new Date(time))
      }
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
        placeholder="Please input project identifier"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"
      /></el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row :data="pagedData">
      <el-table-column align="center" :label="$t("Name / Identifier")" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <router-link
            :to="{
              name: 'cicdPipelines',
              params: { pId: scope.row.repository_ids }
            }"
            style="color: #409eff"
          >
            <span style="color: #67c23a">{{ scope.row.display }}</span>
            <br />
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Workload" width="120px">
        <template slot-scope="scope">
          {{ scope.row.issues }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Upcomming Deadline">
        <template slot-scope="scope">
          {{ myFormatTime(scope.row.next_d_time) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Branches" width="120px">
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
      <el-table-column align="center" label="Last Test" width="150px">
        <template slot-scope="scope">
          <span v-if="scope.row.last_test_time === ''">No Test</span>
          <span v-else>{{ myFormatTime(scope.row.last_test_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Last Test Result" width="150px">
        <template slot-scope="scope">
          <el-tag :type="returnTagType(scope.row)" size="large">
            <i v-if="returnTagType(scope.row) === 'success'" class="el-icon-success" />
            <i v-else-if="returnTagType(scope.row) === 'danger'" class="el-icon-error" />
            <i v-else class="el-icon-error" />
            <span>{{ testResults(scope.row) }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="GitLab" width="100px">
        <template slot-scope="scope">
          <el-link v-if="scope.row.git_url" type="primary" :href="scope.row.git_url" target="_blank">GitLab</el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Redmin" width="100px">
        <template slot-scope="scope">
          <el-link v-if="scope.row.redmine_url" type="primary" :href="scope.row.redmine_url" target="_blank"
            >Redmin</el-link
          >
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
      :total="listTotal"
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
