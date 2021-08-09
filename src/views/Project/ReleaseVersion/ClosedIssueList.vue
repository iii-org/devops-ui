<template>
  <div class="app-container">
    <el-row type="flex" justify="space-between" align="middle">
      <el-col>
        <el-button type="text" size="medium" icon="el-icon-arrow-left" class="previous" @click="handleBackPage">
          {{ $t('general.Back') }}
        </el-button>
      </el-col>
      <el-col class="text-right">
        <el-button icon="el-icon-s-operation" type="text" disabled style="color: #409eff;">
          {{ listFilter }}
        </el-button>
        <el-divider direction="vertical" />
        <el-input
          v-if="searchVisible"
          id="input-search"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('Issue.SearchNameOrAssignee')"
          style="width: 250px;"
          clearable
          @blur="searchVisible=!searchVisible"
          @change="onChangeFilter"
        />
        <el-button v-else type="text" icon="el-icon-search" @click="searchVisible=!searchVisible">
          {{ $t('general.Search') + ((keyword) ? ': ' + keyword : '') }}
        </el-button>
      </el-col>
    </el-row>
    <el-divider />
    <el-row v-loading="listLoading"
            :element-loading-text="$t('Loading')"
    >
      <el-table
        ref="issueList"
        :data="listData"
        fit
        highlight-current-row
        row-key="id"
        height="60vh"
        :tree-props="{ children: 'child' }"
        :row-class-name="getRowClass"
        @cell-click="handleClick"
        @expand-change="getIssueFamilyData"
        @sort-change="handleSortChange"
      >
        <el-table-column type="expand" class-name="informationExpand">
          <template slot-scope="scope">
            <el-row v-if="scope.row.family"
                    v-loading="scope.row.hasOwnProperty('isLoadingFamily')&&scope.row.isLoadingFamily"
            >
              <div v-if="scope.row.hasOwnProperty('isLoadingFamily') && scope.row.isLoadingFamily" class="p-5" />
              <ul v-else>
                <li v-if="scope.row.hasOwnProperty('parent') && Object.keys(scope.row.parent).length > 0">
                  <b>{{ $t('Issue.ParentIssue') }}:</b>
                  <el-link
                    class="font-weight-regular text-lg cursor-pointer"
                    :underline="false"
                    @click="handleEdit(scope.row.parent.id)"
                  >
                    <status :name="scope.row.parent.status.name" size="mini" />
                    <tracker :name="scope.row.parent.tracker.name" />
                    #{{ scope.row.parent.id }} - {{ scope.row.parent.name }}
                    <span
                      v-if="scope.row.parent.hasOwnProperty('assigned_to') && Object.keys(scope.row.parent.assigned_to).length > 1"
                    >
                      ({{ $t('Issue.Assignee') }}: {{ scope.row.parent.assigned_to.name }}
                      - {{ scope.row.parent.assigned_to.login }})
                    </span>
                  </el-link>
                </li>
                <li v-if="scope.row.hasOwnProperty('children') && scope.row.children.length>0">
                  <strong>{{ $t('Issue.ChildrenIssue') }}:</strong>
                  <ol>
                    <template v-for="child in scope.row.children">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        <el-link
                          class="font-weight-regular my-1"
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }}
                            - {{ child.assigned_to.login }})
                          </span>
                        </el-link>
                      </li>
                    </template>
                  </ol>
                </li>
                <li v-if="scope.row.hasOwnProperty('relations')&&scope.row.relations.length>0">
                  <strong>{{ $t('Issue.RelatedIssue') }}:</strong>
                  <ol>
                    <template v-for="child in scope.row.relations">
                      <li v-if="Object.keys(child).length > 0" :key="child.id">
                        <el-link
                          class="font-weight-regular my-1"
                          :style="{ 'font-size': '14px', cursor: 'pointer' }"
                          :underline="false"
                          @click="handleEdit(child.id)"
                        >
                          <status :name="child.status.name" size="mini" />
                          <tracker :name="child.tracker.name" />
                          #{{ child.id }} - {{ child.name }}
                          <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                            ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})
                          </span>
                        </el-link>
                      </li>
                    </template>
                  </ol>
                </li>
              </ul>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column :label="$t('general.Type')" width="130" prop="tracker" sortable="custom">
          <template slot-scope="scope">
            <tracker v-if="scope.row.tracker.name" :name="scope.row.tracker.name" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('Issue.Id')" min-width="280" show-overflow-tooltip prop="id" sortable="custom">
          <template slot-scope="scope">
            <span class="text-success mr-2">#{{ scope.row.id }}</span>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Priority')" width="150" prop="priority" sortable="custom">
          <template slot-scope="scope">
            <priority v-if="scope.row.priority.name" :name="scope.row.priority.name" />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('general.Status')" width="150" prop="status" sortable="custom">
          <template slot-scope="scope">
            <status
              v-if="scope.row.status.name"
              :name="scope.row.status.name"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Issue.Assignee')" min-width="180" prop="assigned_to"
                         sortable="custom" show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.assigned_to.name }}</span>
            <span v-if="scope.row.assigned_to.login">({{ scope.row.assigned_to.login }})</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="pageInfo.total"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="handleCurrentChange"
      />
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Table, IssueList, IssueExpand } from '@/newMixins'
import { getProjectVersion } from '@/api/projects'

/**
 * @param row.relations  row maybe have parent or children issue
 * @param data.issue_list get paged data from api
 */

export default {
  name: 'ClosedIssueList',
  mixins: [Table, IssueList, IssueExpand],
  data() {
    return {
      searchVisible: false,
      displayClosed: true,

      assigned_to: [],
      fixed_version: [],

      form: {}
    }
  },
  computed: {
    ...mapGetters(['userRole', 'userId', 'fixedVersionShowClosed'])
  },
  watch: {
    fixed_version_closed(value) {
      this.loadVersionList(value)
    },
    fixed_version: {
      immediate: true,
      handler(value) {
        if (value && value.length > 0) {
          this.getFixedVersionClosed()
          this.onChangeFilter()
        }
      }
    }
  },
  async created() {
    this.fixed_version_closed = true
    await this.loadVersionList(false)
    console.log(this.fixed_version)
  },
  methods: {
    handleBackPage() {
      this.$router.push({ name: 'release-version' })
    },
    getFixedVersionClosed() {
      const fixed_version = this.fixed_version.filter(item => item.name === this.$route.params.issueTag)[0].id
      this.filterValue = {
        fixed_version,
        status: 6
      }
    },
    getParams() {
      const result = {
        offset: this.listQuery.offset,
        limit: this.listQuery.limit
      }
      if (this.sort) {
        result['sort'] = this.sort
      }
      Object.keys(this.filterValue).forEach((item) => {
        if (this.filterValue[item]) {
          result[item + '_id'] = this.filterValue[item]
        }
      })
      if (this.keyword) {
        result['search'] = this.keyword
      }
      return result
    },
    async loadData() {
      this.listLoading = true
      if (!this.getParams().fixed_version_id) {
        this.listData = []
      } else {
        this.listData = await this.fetchData()
      }
      this.listLoading = false
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    cleanFilter() {
      this.keyword = null
      this.onChangeFilter()
    },
    onChangeFilter() {
      this.loadData()
    }
  }
}
</script>
