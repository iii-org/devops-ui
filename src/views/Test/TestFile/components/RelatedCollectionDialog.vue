<template>
  <div>
    <div class="flex justify-between items-center">
      <h3>
        {{ $t('Test.TestFile.ManageTestFile') }}
      </h3>
      <span>
        <el-button
          size="medium"
          class="buttonPrimary"
          @click="handleConfirm"
        >
          {{ $t('general.Save') }}
        </el-button>
        <el-button
          class="buttonSecondaryReverse"
          @click="handleClose"
        >
          {{ $t('general.Close') }}
        </el-button>
      </span>
    </div>
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
          v-loading="isLoading"
          :element-loading-text="$t('Loading')"
          :data="pagedData"
          :cell-style="{ height: rowHeight + 'px' }"
          height="40vh"
          highlight-current-row
          fit
          @cell-click="handleClick"
        >
          <el-table-column
            width="55"
            type="first"
          >
            <template slot-scope="scope">
              <el-checkbox
                :value="isSelectedCollection(scope.row)"
                class="el-checkbox"
                @change="toggleCollection(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="測試軟體"
            width="100"
            prop="software_name"
          />
          <el-table-column
            label="檔案"
            prop="file_name"
          />
          <el-table-column
            label="測試名稱"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column
            label="設計模組"
            prop="test_plans"
            min-width="150"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ getTestPlan(scope.row) }}
            </template>
          </el-table-column>
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
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Pagination, SearchBar } from '@/mixins'
import Fuse from 'fuse.js'
import { getTestFileList } from '@/api/qa'

export default {
  name: 'RelatedCollectionDialog',
  mixins: [Pagination, SearchBar],
  props: {
    selectedCollections: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      collectionList: [],
      selectedList: [],
      search: [],
      isLoading: false,
      rowHeight: 20,
      listQuery: {
        page: 1,
        limit: 5
      },
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
      return res.map((items) => items.item)
    }
  },
  watch: {
    selectedCollections: {
      handler(value) {
        this.selectedList = JSON.parse(JSON.stringify(value))
      },
      deep: true,
      immediate: true
    },
    selectedProjectId() {
      this.fetchData()
    },
    pagedData(value) {
      const getSelectedListName = this.selectedList.map((item) => item.file_name)
      const getSelectedRow = value.filter((item) => getSelectedListName.includes(item.file_name))
      getSelectedRow.forEach((row) => {
        this.$refs['collectionTable'].toggleRowSelection(row)
      })
    }
  },
  async mounted() {
    this.isLoading = true
    this.collectionList = await this.fetchData()
    this.isLoading = false
  },
  methods: {
    fetchData() {
      return getTestFileList(this.selectedProjectId)
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          return Promise.reject(e)
        })
    },
    toggleCollection(row) {
      if (this.isSelectedCollection(row)) {
        this.onRemoveCollection(row)
      } else {
        this.onAddCollection(row)
      }
    },
    onAddCollection(row) {
      this.selectedList.push(row)
    },
    onRemoveCollection(row) {
      this.selectedList.splice(this.selectedList.indexOf(row), 1)
    },
    isSelectedCollection(row) {
      return this.selectedList.map((item) => item.file_name).indexOf(row.file_name) >= 0
    },
    getTestPlan(row) {
      return row.test_plans.map((item) => item.name).join('、')
    },
    handleClick(row, column) {
      if (column.type !== 'first') {
        this.toggleCollection(row)
      }
    },
    handleConfirm() {
      this.$emit('update:selected-collections', JSON.parse(JSON.stringify(this.selectedList)))
      this.$emit('update')
      this.handleClose()
    },
    handleClose() {
      this.$emit('close-dialog', 'relatedCollection')
    }
  }
}
</script>

<style lang="scss" scoped>
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

>>> .pagination-container {
  padding: 10px 0;
}
</style>
