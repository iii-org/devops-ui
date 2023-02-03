<template>
  <div class="app-container">
    <div class="clearfix">
      <el-input
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('Activities.SearchPlaceholder')"
        style="width: 300px; float: right"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      fit
    >
      <el-table-column align="center" :label="$t('Activities.User')" min-width="100" prop="operator_name" />
      <el-table-column align="center" :label="$t('Activities.ActionType')" min-width="150" prop="action_type" />
      <el-table-column align="center" :label="$t('Activities.ActionParts')" min-width="250" prop="action_parts" />
      <el-table-column-time prop="act_at" :label="$t('Activities.ActAt')" />
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      :total="listQuery.total"
      :page.sync="listQuery.current"
      :limit="listQuery.limit"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { getAllActivities } from '@/api/activities'
import { BasicData, Pagination } from '@/mixins'
import { ElTableColumnTime } from '@/components'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'SystemActivities',
  components: { ElTableColumnTime },
  mixins: [BasicData, Pagination],
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
      const res = await getAllActivities(this.params)
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
    async onPagination (listQuery) {
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
