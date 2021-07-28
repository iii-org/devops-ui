<template>
  <div>
    <el-row slot="title" type="flex" align="middle">
      <el-col :xs="24" :md="16">
        <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous text-h6"
                   @click="onBack"
        >
          {{ $t('general.Back') }}
        </el-button>
        <span class="text-h6">{{ issueName }}</span>
      </el-col>
      <el-col :xs="24" :md="8" class="text-right">
        <el-button type="primary" :loading="btnConfirmLoading" @click="handleAddConfirm">
          {{ $t('general.Close') }}
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <h2>管理測試檔案</h2>
      </el-col>
    </el-row>
    <el-row class="el-card">
      <el-col class="el-card__header">
        <el-row>
          <el-col :span="24">
            <el-input
              v-model="searchValue"
              size="medium"
              prefix-icon="el-icon-search"
              :style="{ width: '300px' }"
              :placeholder="$t('general.SearchName')"
            />
          </el-col>
        </el-row>
      </el-col>
      <el-col class="el-card__body">
        <el-table
          ref="collectionTable"
          :element-loading-text="$t('Loading')"
          border
          fit
          highlight-current-row
          :data="pagedData"
          height="40vh"
          :cell-style="{ height: rowHeight + 'px' }"
          @cell-click="handleClick"
        >
          <el-table-column width="55" type="first">
            <template slot-scope="scope">
              <el-checkbox :value="isSelectedCollection(scope.row)" class="el-checkbox" @change="toggleCollection(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="測試軟體" width="100" prop="software_name" />
          <el-table-column label="檔案" prop="file_name" />
          <el-table-column label="測試名稱" prop="name" show-overflow-tooltip />
          <el-table-column label="設計模組" prop="test_plans" min-width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ getTestPlan(scope.row) }}
            </template>
          </el-table-column>
        </el-table>
        <pagination
          :total="filteredData.length"
          :page="listQuery.page"
          :limit="listQuery.limit"
          :page-sizes="[listQuery.limit]"
          :layout="'total, prev, pager, next'"
          @pagination="onPagination"
        />
      </el-col>
      <el-col v-if="selectedList.length > 0" class="el-card__footer">
        <el-col :xs="8" :md="2">
          <div class="selected_count">
            {{ $t('User.Selected') }}<span class="value">{{ selectedList.length }}</span>
          </div>
        </el-col>
        <el-col :xs="16" :md="22" class="scroll-x">
          <el-tag v-for="(item, idx) in selectedList" :key="idx" class="item" closable @close="onRemoveCollection(item)">
            <b>{{ idx + 1 }}</b>.{{ item.name }}
          </el-tag>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar, Table } from '@/newMixins'
import Fuse from 'fuse.js'
import { getTestFileList } from '@/views/Plugin/QA/api/qa'

export default {
  name: 'RelatedCollectionDialog',
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    issueName: {
      type: String,
      default: null
    },
    selectedCollections: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      dialogVisible: false,
      collectionList: [],
      selectedList: [],
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
      inputVisible: false,
      searchValue: '',
      form: {}
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    filteredData() {
      if (this.collectionList.length <= 0) return []
      if (this.searchValue.length <= 0) return this.collectionList
      const fuse = new Fuse(this.collectionList, {
        includeScore: true,
        keys: ['name', 'description', 'assigned_to.name']
      })
      const res = fuse.search('!' + this.searchValue)
      return res.map(items => items.item)
    }
  },
  watch: {
    selectedCollections: {
      deep: true,
      handler(value) {
        this.selectedList = value
      }
    },
    selectedList: {
      deep: true,
      handler(value) {
        this.$emit('update', value)
      }
    },
    selectedProjectId() {
      this.fetchData()
    },
    pagedData(value) {
      const getSelectedListName = this.selectedList.map((item) => (item.file_name))
      const getSelectedRow = value.filter((item) => (getSelectedListName.includes(item.file_name)))
      getSelectedRow.forEach(row => {
        this.$refs['collectionTable'].toggleRowSelection(row)
      })
    }
  },
  async mounted() {
    this.collectionList = await this.fetchData()
    this.selectedList = this.selectedCollections
  },
  methods: {
    fetchData() {
      return getTestFileList(this.selectedProjectId)
        .then(res => {
          return Promise.resolve(res.data)
        })
        .catch(e => {
          return Promise.reject(e)
        })
    },
    toggleSelectAllCollection(event) {
      if (event) {
        this.$refs['collectionTable'].data.forEach(item => {
          this.onAddCollection(item)
        })
      } else {
        this.$refs['collectionTable'].data.forEach(item => {
          this.onRemoveCollection(item)
        })
      }
    },
    toggleCollection(row) {
      if (this.isSelectedCollection(row)) {
        this.onRemoveCollection(row)
      } else {
        this.onAddCollection(row)
      }
    },
    onAddCollection(row) {
      this.selectedList.push({ ...row, edit: true })
    },
    onRemoveCollection(row) {
      this.selectedList.splice(this.selectedList.indexOf(row), 1)
    },
    onBack() {
      this.selectedList = this.selectedCollections
      this.handleAddConfirm()
    },
    isSelectedCollection(row) {
      return this.selectedList.map((item) => (item.file_name)).indexOf(row.file_name) >= 0
    },
    getTestPlan(row) {
      return row.test_plans.map((item) => (item.name)).join('、')
    },
    handleClick(row, column) {
      if (column.type !== 'first') {
        this.toggleCollection(row)
      }
    },
    handleAddConfirm() {
      this.$emit('close-dialog', 'relatedCollection')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
>>>.el-dialog__header{
  display: none;
}
>>>.el-dialog__body{
  padding-top:0;
}
> > > .el-card {
  &__footer {
    padding: 18px 20px;
    border-top: 1px solid #ebeef5;
    box-sizing: border-box;
    width: 100%;
    height: 75px;

    .selected_count {
      display: inline-block;
      line-height: 1;
      white-space: nowrap;
      background: #fff;
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
        background: $danger;
        color: #ffffff;
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

> > > .pagination-container {
  padding: 10px 0;
}

> > > .el-table .el-button {
  color: #ffffff !important;

  &:hover {
    color: #ffffff !important;
  }

  &--success {
    background: $success !important;
  }

  &--warning {
    background: $warning !important;
  }

  &--slow {
    background: $slow !important;
  }
}

> > > .el-tag {
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

> > > .el-form {
  display: inline;
  margin: 0 0 0 10px;

  .el-form-item {
    margin: 0;
  }
}
</style>
