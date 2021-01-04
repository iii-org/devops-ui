<script>
import { mapGetters } from 'vuex'
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getPipelinesPhase } from '@/api/cicd'

const formTemplate = {
  phase: '',
  tool: '',
  status: false,
  desc: ''
}

export default {
  name: 'ProjectDevOps',
  components: {
    ProjectListSelector,
    Pagination
  },
  data: () => ({
    toolList: [
      {
        tool_name: 'Redmine'
      },
      {
        tool_name: 'JIRA'
      },
      {
        tool_name: 'OpenProject'
      },
      {
        tool_name: 'Maninis'
      }
    ],
    listLoading: true,
    phaseList: [],
    dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',
    dialogStatus: 1,
    memberConfirmLoading: false,
    form: formTemplate
  }),
  computed: {
    ...mapGetters(['projectSelectedId', 'projectSelectedObject']),
    pagedData() {
      const listData = this.phaseList.filter(data => {
        if (this.searchData === '' || data.software.toLowerCase().includes(this.searchData.toLowerCase())) {
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
  watch: {
    projectSelectedId() {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    form(value) {
      console.log(value)
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchData()
    // this.drag()
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async fetchData() {
      this.listLoading = true
      this.phaseList = []
      const repository_id = this.projectSelectedObject.repository_id
      if (repository_id) {
        try {
          const res = await getPipelinesPhase(repository_id, 'master')
          this.phaseList = res.data || []
        } catch (e) {
          console.log(e.message)
        }
      }
      this.listLoading = false
    },
    drag() {
      const el1 = document.querySelectorAll('.el-table__body-wrapper')[0].querySelectorAll('table > tbody')[0]
      Sortable.create(el1, {
        ghostClass: 'sortable-ghost',
        animation: 150,
        group: {
          pull: false,
          put: false
        },
        onEnd: e => {
          // // 这里主要进行数据的处理，拖拽实际并不会改变绑定数据的顺序，这里需要自己做数据的顺序更改
          // let arr = this.Data // 获取表数据
          // arr.splice(e.newIndex, 0, arr.splice(e.oldIndex, 1)[0]) // 数据处理
          // this.$nextTick(function() {
          //   this.Data = arr
          // })
        }
      })
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
    <div class="clearfix">
      <project-list-selector />
      <!-- <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Flow
        </el-button>
      </span> -->
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('DevOps.SearchTool')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit>
      <el-table-column align="center" :label="$t('DevOps.Id')" min-width="30">
        <template slot-scope="scope">
          <!-- <i class="el-icon-sort"></i>  -->
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('DevOps.Phase')" min-width="40">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.phase === 'deploy'" type="danger" size="big">{{ scope.row.phase }}</el-tag>
          <el-tag v-else-if="scope.row.phase === 'Test'" type="warning" size="big">{{ scope.row.phase }}</el-tag>
          <el-tag v-else type="success" size="big">{{ scope.row.phase }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('DevOps.Tools')" min-width="180">
        <template slot-scope="scope">
          {{ scope.row.software }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="Status">
        <template slot-scope="scope">
          {{ scope.row.status ? '啟用' : '停用' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Actions">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" />
            Delete
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
    <el-dialog :title="`${dialogStatusText} Flow`" :visible.sync="dialogVisible" width="50%" @closed="onDialogClosed">
      <el-form ref="thisForm" :model="form" label-position="top">
        <el-form-item label="Phase" prop="phase">
          <el-select v-model="form.phase" placeholder="select a phase" style="width: 100%">
            <el-option
              v-for="item in phaseList"
              :key="item.phase_name"
              :label="item.phase_name"
              :value="item.phase_name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Tools" prop="tools">
          <el-select v-model="form.tool" placeholder="select a tool" style="width: 100%">
            <el-option v-for="item in toolList" :key="item.tool_name" :label="item.tool_name" :value="item.tool_name" />
          </el-select>
        </el-form-item>

        <el-form-item label="Status" prop="status">
          <el-switch v-model="form.status" />
        </el-form-item>

        <el-form-item label="Description" prop="desc">
          <el-input v-model="form.desc" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button :loading="memberConfirmLoading" type="primary" @click="handleConfirm">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
.sortable-ghost {
  opacity: 0.4;
  background-color: #f4e2c9;
}
table > tbody {
  cursor: move;
}
</style>
