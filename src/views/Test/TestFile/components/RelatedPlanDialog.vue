<template>
  <div>
    <el-row
      slot="title"
      type="flex"
      align="middle"
    >
      <el-col
        :xs="24"
        :md="16"
      >
        <span class="text-h6">{{ collection.file_name }}</span> -
        <IssueTitle
          ref="IssueTitle"
          v-model="form.name"
        />
      </el-col>
      <el-col
        :xs="24"
        :md="8"
        class="text-right"
      >
        <el-button
          class="buttonPrimary"
          :loading="btnConfirmLoading"
          @click="handleAddConfirm"
        >
          {{ $t('general.Save') }}
        </el-button>
        <el-button
          class="buttonSecondaryReverse"
          :loading="btnConfirmLoading"
          @click="onClose"
        >
          {{ $t('general.Close') }}
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <h2>關聯測試計畫</h2>
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
          ref="issueTable"
          :element-loading-text="$t('Loading')"
          fit
          highlight-current-row
          :data="pagedData"
          height="40vh"
          :cell-style="{ height: rowHeight + 'px' }"
          @cell-click="handleClick"
        >
          <el-table-column
            width="55"
            type="first"
          >
            <template slot-scope="scope">
              <el-checkbox
                :value="isSelectedIssue(scope.row)"
                class="el-checkbox"
                @change="toggleIssue(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('Issue.name')"
            prop="name"
          />
          <el-table-column
            :label="$t('Issue.Description')"
            prop="description"
            show-overflow-tooltip
          />
          <el-table-column
            :label="$t('Issue.Assignee')"
            prop="assigned_to"
          >
            <template slot-scope="scope">
              <el-tooltip
                :content="scope.row.assigned_to.login"
                placement="right-start"
                :disabled="!scope.row.assigned_to.login"
              >
                <span class="detail">
                  {{ scope.row.assigned_to.name }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="測試檔案"
            prop="test_files"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                v-for="file in scope.row.test_files"
                :key="file.id"
              >
                <el-tag>{{ file.software_name }}</el-tag> - {{ file.file_name }}
              </span>
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
      <el-col
        v-if="selectedList.length > 0"
        class="el-card__footer"
      >
        <el-col
          :xs="8"
          :md="2"
        >
          <div class="selected_count">
            {{ $t('User.Selected') }}<span class="value">{{ selectedList.length }}</span>
          </div>
        </el-col>
        <el-col
          :xs="16"
          :md="22"
          class="scroll-x"
        >
          <el-tag
            v-for="(item, idx) in selectedList"
            :key="idx"
            class="item"
            closable
            @close="onRemoveIssue(item)"
          >
            <strong>{{ idx + 1 }}</strong>.{{ item.name }}
          </el-tag>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BasicData, Pagination, SearchBar, Table } from '@/mixins'
import Fuse from 'fuse.js'
import IssueTitle from './widget/IssueTitle'
import { getTestPlanList } from '@/api/qa'

export default {
  name: 'RelatedPlanDialog',
  components: { IssueTitle },
  mixins: [BasicData, Pagination, SearchBar, Table],
  props: {
    collection: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedList: [],
      selectedIssue: { append: [], remove: [], merge: [] },
      trackerValue: 'Test Plan',
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
    ...mapGetters(['selectedProject', 'tracker']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    filteredData() {
      if (this.listData.length <= 0) return []
      if (this.searchValue.length <= 0) return this.listData
      const fuse = new Fuse(this.listData, {
        includeScore: true,
        keys: ['name', 'description', 'assigned_to.name']
      })
      const res = fuse.search('!' + this.searchValue)
      return res.map((items) => items.item)
    }
  },
  watch: {
    collection(value) {
      this.selectedList = [].concat(value.test_plans)
    },
    selectedProjectId() {
      this.fetchData()
    },
    pagedData(value) {
      const getSelectedListName = this.selectedList.map((item) => item.id)
      const getSelectedRow = value.filter((item) => getSelectedListName.includes(item.file_name))
      getSelectedRow.forEach((row) => {
        this.$refs['issueTable'].toggleRowSelection(row)
      })
    }
  },
  async mounted() {
    this.listData = await this.fetchData()
    this.selectedList = [].concat(this.collection.test_plans)
  },
  methods: {
    async fetchData() {
      return getTestPlanList(this.selectedProjectId)
        .then((res) => {
          return Promise.resolve(res.data)
        })
        .catch((e) => {
          return Promise.reject(e)
        })
    },
    testPlanDifferent() {
      let oldSetting = []
      if (this.collection.test_plans && this.collection.test_plans) {
        oldSetting = this.collection.test_plans.map((item) => item.id)
      }
      const newSetting = this.selectedList.map((item) => item.id)
      const result = [...oldSetting, ...newSetting]
      const merge = [...new Set(result)]
      const append = [...merge.filter((item) => !oldSetting.includes(item))]
      const remove = [
        ...merge
          .filter((item) => !newSetting.includes(item))
          .map((item) => {
            return this.collection.test_plans
              .find((issue) => issue.id === item)
              .test_files.find((file) => file.file_name === this.collection.file_name).id
          })
      ]
      return this.$set(this, 'selectedIssue', { append: append, remove: remove, merge: merge })
    },
    toggleSelectAllIssue(event) {
      if (event) {
        this.$refs['issueTable'].data.forEach((item) => {
          this.onAddIssue(item)
        })
      } else {
        this.$refs['issueTable'].data.forEach((item) => {
          this.onRemoveIssue(item)
        })
      }
    },
    toggleIssue(row) {
      if (this.isSelectedIssue(row)) {
        this.onRemoveIssue(row)
      } else {
        this.onAddIssue(row)
      }
    },
    onClose() {
      this.$emit('close-dialog', 'relatedPlan')
    },
    onAddIssue(row) {
      this.selectedList.push(row)
    },
    onRemoveIssue(row) {
      const find = this.selectedList.find((item) => item.id === row.id)
      this.selectedList.splice(this.selectedList.indexOf(find), 1)
    },
    isSelectedIssue(row) {
      const find = this.selectedList.find((item) => item.id === row.id)
      return this.selectedList.indexOf(find) >= 0
    },
    handleClick(row, column) {
      if (column.type !== 'first') {
        this.toggleIssue(row)
      }
    },
    async handleAddConfirm() {
      await this.testPlanDifferent()
      await this.$emit('save', { collection: this.collection, test_plans: this.selectedIssue })
      await this.$emit('close-dialog', 'relatedPlan')
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-dialog__header {
  display: none;
}

>>> .el-dialog__body {
  padding-top: 0;
}

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
