<template>
  <div class="app-container">
    <el-row type="flex" justify="end">
      <SearchFilter
        ref="filter"
        :options="options"
        :keyword.sync="keyword"
        @changeFilter="fetchData"
      />
    </el-row>
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
        :label="$t('Inbox.No')"
        prop="row_id"
        width="80px"
      />
      <el-table-column
        header-align="center"
        :label="$t('Inbox.Title')"
        prop="message"
      />
      <el-table-column
        align="center"
        :label="$t('Inbox.Type')"
        width="150px"
      >
        <template slot-scope="scope">
          <el-tag
            effect="dark"
            :style="{'background-color': tagColor(scope.row.alert_level),
                     'border-color': tagColor(scope.row.alert_level)
            }"
          >
            {{ messageType(scope.row.alert_level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column-time
        prop="created_at"
        :label="$t('Inbox.Date')"
        width="300px"
      />
      <el-table-column
        align="center"
        :label="$t('Inbox.Sender')"
        prop="creator.name"
        width="200px"
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
    <el-row 
      type="flex"
      class="ps"
      justify="end"
    >
      * The system only keeps 7 days messages. Pelase save the message in local if it's important.
    </el-row>
  </div>
</template>

<script>
import SearchFilter from './components/SearchFilter.vue'
import { getMessageList } from '@/api/monitoring'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { BasicData, Pagination } from '@/newMixins'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'Inbox',
  components: { SearchFilter, ElTableColumnTime },
  mixins: [BasicData, Pagination],
  data() {
    return {
      keyword: '',
      listLoading: false,
      messageList: [],
      params: params(),
      listQuery: {}
    }
  },
  computed: {
    pagedData() {
      return this.messageList
    },
    options() {
      return [{
        value: 1,
        label: this.$t('Inbox.Info'),
        color: '#67c23a'
      }, {
        value: 2,
        label: this.$t('Inbox.Warning'),
        color: '#e6d53c'
      }, {
        value: 3,
        label: this.$t('Inbox.Error'),
        color: '#e6a23c'
      }, {
        value: 4,
        label: this.$t('Inbox.Critical'),
        color: '#f56c6c'
      }]
    } 
  },
  watch: {
    keyword: {
      handler(val) {
        this.onSearch(val)
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getMessageList(this.params)
      console.log(res)
      this.messageList = res.data.notification_message_list
      const start_id = res.data.page.limit * (res.data.page.current - 1) + 1
      this.messageList.forEach((item, i) => {
        item.row_id = start_id + i
      })
      this.listQuery = Object.assign({}, res.data.page)
    },
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
    },
    messageType(id) {
      return this.options.find(x => x.value === id.id).label
    },
    tagColor(id) {
      return this.options.find(x => x.value === id.id).color
    }
  }
}
</script>

<style scoped>
.ps {
  /* color: #e66262;  */
  margin-top: 12px 
}
</style>
