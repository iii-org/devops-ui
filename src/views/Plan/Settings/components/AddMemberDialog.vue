<template>
  <el-dialog
    :title="$t(`Member.AddMember`)"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    destroy-on-close
    width="80%"
    top="3vh"
    @closed="onDialogClosed"
  >
    <el-row class="el-card">
      <el-col class="el-card__header">
        <el-row>
          <el-col :xs="24" :md="12">
            <el-input
              v-model="keyword"
              size="medium"
              prefix-icon="el-icon-search"
              :style="{ width: '300px' }"
              :placeholder="$t('general.SearchName')"
            />
          </el-col>
          <el-col :xs="24" :md="12" class="text-right">
            <el-button class="buttonSecondaryReverse" @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
            <el-button class="buttonPrimary" :loading="btnConfirmLoading" @click="handleAddConfirm">
              {{ $t('general.Confirm') }}
            </el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col class="el-card__body">
        <el-table
          v-if="dialogVisible"
          ref="userTable"
          :data="pagedData"
          :element-loading-text="$t('Loading')"
          height="100%"
          highlight-current-row
          fit
          @cell-click="handleClick"
        >
          <el-table-column width="55" type="first">
            <template slot-scope="scope">
              <el-checkbox :value="isSelectedMember(scope.row)" class="el-checkbox" @change="toggleMember(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('general.Name')" prop="name" />
          <el-table-column :label="$t('User.Department')" prop="department" />
          <el-table-column :label="$t('User.Title')" prop="title" />
          <el-table-column :label="$t('User.Account')" prop="login" />
        </el-table>
        <Pagination
          :total="filteredData.length"
          :page="listQuery.page"
          :limit="listQuery.limit"
          :page-sizes="[listQuery.limit]"
          :layout="'total, prev, pager, next'"
          @pagination="onPagination"
        />
      </el-col>
      <el-col v-if="selectedUser.length > 0" class="el-card__footer">
        <el-col :xs="8" :md="2">
          <div class="selected_count">
            {{ $t('User.Selected') }}<span class="value">{{ selectedUser.length }}</span>
          </div>
        </el-col>
        <el-col :xs="16" :md="22" class="scroll-x">
          <el-tag v-for="(item, idx) in selectedUser" :key="idx" class="item" closable @close="onRemoveMember(item)">
            <strong>{{ idx + 1 }}</strong>
            .{{ item.name }}
          </el-tag>
        </el-col>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { addProjectMember, getNotInProject } from '@/api/projects'
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'
import Fuse from 'fuse.js'

export default {
  name: 'AddMemberDialog',
  mixins: [BasicData, Pagination, SearchBar, Table],
  data() {
    return {
      dialogVisible: false,
      assignableUserList: [],
      selectedUser: [],
      search: [],
      isLoading: false,
      btnConfirmLoading: false,
      selectorQuery: '',
      focusRoleName: '',
      rowHeight: 20,
      listQuery: {
        page: 1,
        limit: 5
      },
      inputVisible: false
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    filteredData() {
      if (this.assignableUserList.length <= 0) return []
      if (this.keyword.length <= 0) return this.assignableUserList
      const fuse = new Fuse(this.assignableUserList, {
        // includeScore: true,
        threshold: 0.5,
        keys: ['name', 'login', 'department', 'title']
      })
      const res = fuse.search('!' + this.keyword)
      return res.map(items => items.item)
    }
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    },
    pagedData() {
      this.selectedUser.forEach(row => {
        this.$refs['userTable'].toggleRowSelection(row)
      })
    },
    async dialogVisible(val) {
      if (!val) {
        this.keyword = ''
      }
      await this.fetchData()
    }
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      return getNotInProject(this.selectedProjectId)
        .then(res => {
          this.assignableUserList = res.data.user_list.map(user => ({
            id: user.id,
            name: user.name,
            department: user.department,
            title: user.title,
            login: user.login,
            role_name: user.role_name
          }))
        })
        .catch(e => {
          return Promise.reject(e)
        })
    },
    toggleSelectAllMember(event) {
      if (event) {
        this.$refs['userTable'].data.forEach(item => {
          this.onAddMember(item)
        })
      } else {
        this.$refs['userTable'].data.forEach(item => {
          this.onRemoveMember(item)
        })
      }
    },
    toggleMember(row) {
      if (this.isSelectedMember(row)) {
        this.onRemoveMember(row)
      } else {
        this.onAddMember(row)
      }
    },
    onAddMember(row) {
      this.selectedUser.push(row)
    },
    onRemoveMember(row) {
      this.selectedUser.splice(this.selectedUser.indexOf(row), 1)
    },
    isSelectedMember(row) {
      return this.selectedUser.indexOf(row) >= 0
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.selectedUser = []
      })
    },
    handleClick(row, column) {
      if (column.type !== 'first') {
        this.toggleMember(row)
      }
    },
    handleAddConfirm() {
      if (this.selectedUser.length > 0) {
        this.btnConfirmLoading = true
        this.selectedUser.forEach(user => {
          addProjectMember(this.selectedProjectId, { user_id: user.id })
            .then(() => {
              this.$message({
                title: this.$t('general.Success'),
                message: this.$t('Notify.Added'),
                type: 'success'
              })
              this.fetchData()
              this.$emit('update')
            })
            .catch(err => console.error(err))
            .then(() => {
              this.btnConfirmLoading = false
              this.dialogVisible = false
            })
        })
        this.selectedUser = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-card {
  &__footer {
    padding: 18px 20px;
    border-top: 1px solid #ebeef5;
    box-sizing: border-box;
    width: 100%;
    height: 75px;

    .selected_count {
      @apply bg-white;
      display: inline-block;
      line-height: 1;
      white-space: nowrap;
      border: 1px solid #dcdfe6;
      color: #606266;
      -webkit-appearance: none;
      text-align: center;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      outline: 0;
      margin: 0;
      -webkit-transition: 0.1s;
      transition: 0.1s;
      font-weight: 500;
      padding: 12px 10px;
      font-size: 14px;
      border-radius: 4px;

      .value {
        @apply bg-danger text-white;
        padding: 2px 5px;
        margin-left: 5px;
        border-radius: 50%;
      }
    }

    .scroll-x {
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
    }

    .item {
      font-size: 16px;
      margin: 0 10px;
    }
  }
}

>>> .pagination-container {
  padding: 10px 0;
}

>>> .el-table .el-button {
  @apply text-white #{!important};

  &:hover {
    @apply text-white #{!important};
  }

  &--success {
    @apply bg-success #{!important};
  }

  &--warning {
    @apply bg-warning #{!important};
  }

  &--slow {
    @apply bg-slow #{!important};
  }
}

>>> .el-tag {
  &.el-tag {
    margin-left: 10px;
  }
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

>>> .el-form {
  display: inline;
  margin: 0 0 0 10px;

  .el-form-item {
    margin: 0;
  }
}

</style>
