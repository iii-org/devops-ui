<script>
import Sortable from 'sortablejs'
const formTemplate = {
  phase: '',
  tool: '',
  status: false,
  desc: ''
}

export default {
  components: {},
  data() {
    return {
      projectList: [
        {
          project_name: '專科A'
        }
      ],
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
      phaseList: [
        {
          phase_name: 'Plan'
        },
        {
          phase_name: 'Code'
        },
        {
          phase_name: 'Code Review'
        },
        {
          phase_name: 'Build'
        },
        {
          phase_name: 'Test'
        },
        {
          phase_name: 'Release'
        },
        {
          phase_name: 'Deploy'
        },
        {
          phase_name: 'Monitor'
        },
        {
          phase_name: 'Extra'
        }
      ],
      projectValue: '專科A',
      listLoading: true,
      pagedData: [
        {
          order: 1,
          phase: 'Plan',
          tool: 'Redmine',
          status: true
        },
        {
          order: 2,
          phase: 'Code',
          tool: 'GitLab',
          status: true
        },
        {
          order: 3,
          phase: 'sample text',
          tool: 'GitLab',
          status: false
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
      form: formTemplate
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
  watch: {
    form(value) {
      console.log(value)
    }
  },
  mounted() {
    setTimeout(() => (this.listLoading = false), 1000)
    this.drag()
  },
  methods: {
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
          Add Flow
        </el-button>
      </span>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column align="center" label="No" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">
          <i class="el-icon-sort"></i> {{ scope.row.order }}
        </template>
      </el-table-column>
      <el-table-column label="Phase" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.phase }}
        </template>
      </el-table-column>
      <el-table-column label="Tools" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.tool }}
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
            <i class="el-icon-delete" />
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="`${dialogStatusText} Flow`" :visible.sync="dialogVisible" width="50%" @closed="onDialogClosed">
      <el-form ref="thisForm" :model="form" label-position="top">
        <el-form-item label="Phase" prop="phase">
          <el-select v-model="form.phase" placeholder="select a phase" style="width:100%;">
            <el-option
              v-for="item in phaseList"
              :key="item.phase_name"
              :label="item.phase_name"
              :value="item.phase_name"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Tools" prop="tools">
          <el-select v-model="form.tool" placeholder="select a tool" style="width:100%;">
            <el-option v-for="item in toolList" :key="item.tool_name" :label="item.tool_name" :value="item.tool_name">
            </el-option>
          </el-select>
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
        <el-button type="primary" @click="handleConfirm" :loading="memberConfirmLoading">Confirm</el-button>
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
.sortable-ghost {
  opacity: 0.4;
  background-color: #f4e2c9;
}
table > tbody {
  cursor: move;
}
</style>
