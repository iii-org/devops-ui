<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector>
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('Activities.SearchPlaceholder')"
          style="width: 300px"
        />
      </ProjectListSelector>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        fit
      >
        <el-table-column
          align="center"
          :label="$t('Activities.User')"
          prop="operator_name"
        />
        <el-table-column
          align="center"
          :label="$t('Activities.ActionType')"
          prop="action_type"
        />
        <el-table-column
          align="center"
          :label="$t('Activities.ActionParts')"
          prop="action_parts"
          min-width="200"
        />
        <el-table-column-time
          prop="act_at"
          :label="$t('Activities.ActAt')"
        />
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
      </el-table>
      <pagination
        :total="listQuery.total"
        :page.sync="listQuery.current"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </el-col>
  </el-row>
</template>

<script>
import { getProjectActivities } from '@/api/activities'
import { BasicData, Pagination, Table, ProjectSelector } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'ProjectActivities',
  components: { ElTableColumnTime },
  mixins: [BasicData, Pagination, Table, ProjectSelector],
  data() {
    return {
      params: params(),
      dialogVisible: false,
      activitiesList: [],
      keyword: ''
    }
  },
  computed: {
    // cover the origin pagedData
    pagedData() {
      return this.activitiesList
    }
  },
  watch: {
    keyword: {
      handler(val) {
        this.onSearch(val)
      }
    }
  },
  methods: {
    async fetchData() {
      const res = await getProjectActivities(this.selectedProjectId, this.params)
      this.setListData(res)
    },
    setListData(res) {
      this.activitiesList = res.data.activities_list
      this.listQuery = Object.assign({}, res.data.page)
    },
    /**
     * @param keyword
     * search keys are 'operator_name', 'action_type', 'action_parts'
     */
    async onSearch(keyword) {
      this.params.search = keyword
      if (keyword === '') delete this.params.search
      await this.loadData()
      this.initParams()
    },
    async onPagination(listQuery) {
      const { limit, page } = listQuery
      const offset = limit * (page - 1)
      this.params.offset = offset
      this.params.limit = limit
      if (this.keyword !== '') this.params.search = this.keyword
      await this.loadData()
      this.initParams()
    },
    initParams() {
      this.params = params()
    }
  }
}
</script>
