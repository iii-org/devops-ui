<script>
import Pagination from '@/components/Pagination'

const formTemplate = {
  name: '',
  role: '',
  start_date: '',
  end_date: '',
  authorization: false,
  status: false,
  desc: ''
}

export default {
  components: { Pagination },
  data() {
    return {
      projectList: [
        {
          project_name: '專科A'
        }
      ],
      projectValue: '專科A',
      listLoading: true,
      pagedData: [
        {
          order: 1,
          name: '王曉明',
          role: '專案經理',
          start_date: '2020-05-25T07:20:11Z',
          end_date: '2020-07-25T07:20:11Z',
          status: true
        },
        {
          order: 2,
          name: '陳聰明',
          role: '開發人員',
          start_date: '2020-05-25T07:20:11Z',
          end_date: '2020-07-25T07:20:11Z',
          status: true
        },
        {
          order: 3,
          name: '張雅婷',
          role: '開發人員',
          start_date: '2020-05-25T07:20:11Z',
          end_date: '2020-07-25T07:20:11Z',
          status: true
        },
        {
          order: 4,
          name: '王耀祖',
          role: '開發人員',
          start_date: '2020-05-25T07:20:11Z',
          end_date: '2020-07-25T07:20:11Z',
          status: false
        },
        {
          order: 5,
          name: '吳耀祖',
          role: '開發人員',
          start_date: '2020-05-25T07:20:11Z',
          end_date: '2020-07-25T07:20:11Z',
          status: true
        }
      ],
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 20,
        totalPage: 1
      },
      dialogStatus: 1,
      memberConfirmLoading: false,
      form: {
        name: '',
        role: '',
        start_date: '',
        end_date: '',
        authorization: false,
        status: false,
        desc: ''
      }
    }
  },
  computed: {
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
  mounted() {
    setTimeout(() => (this.listLoading = false), 1000)
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    handleAdding() {
      this.dialogVisible = true
      this.dialogStatus = 1
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.dialogStatus = 2

      this.form = Object.assign({}, this.form, row)
    },
    handleDelete() {},
    handleConfirm() {
      //   this.dialogVisible = false
      console.log(this.form)
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['thisForm'].resetFields()
        this.form = formTemplate
      })
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div>
      <el-select v-model="projectValue" placeholder="select a project">
        <el-option
          v-for="item in projectList"
          :key="item.project_name"
          :label="item.project_name"
          :value="item.project_name"
        >
        </el-option>
      </el-select>
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Member
        </el-button>
      </span>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column label="Name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Role" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.role }}
        </template>
      </el-table-column>
      <el-table-column label="Status" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.status ? '啟用' : '停用' }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" /> Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="pagedData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog :title="`${dialogStatusText} Member`" :visible.sync="dialogVisible" width="50%" @closed="onDialogClosed">
      <el-form ref="thisForm" :model="form" label-position="top">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="form.role" placeholder="Select a role" style="width:100%">
            <el-option label="Developer" value="developer"></el-option>
            <el-option label="Manager" value="manager"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Duration">
          <el-col :span="11">
            <el-form-item prop="start_date">
              <el-date-picker type="date" placeholder="Start Date" v-model="form.start_date" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2"> - </el-col>
          <el-col :span="11">
            <el-form-item prop="end_date">
              <el-date-picker type="date" placeholder="End Date" v-model="form.end_date" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="Authorization">
          <el-switch v-model="form.authorization"></el-switch>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
        <el-form-item label="Description" prop="desc">
          <el-input type="textarea" v-model="form.desc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="success" @click="handleConfirm" :loading="memberConfirmLoading">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
</style>
