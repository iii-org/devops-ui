<template>
  <div class="app-container">
    <div class="flex justify-between">
      <div>
        <el-button
          type="text"
          size="medium"
          icon="el-icon-arrow-left"
          class="text-title linkTextColor"
          @click="handleBack"
        >
          {{ $t('general.Back') }}
        </el-button>
        <el-button 
          class="buttonSecondary"
          @click="createMessage"
        >
          Create Message
        </el-button>
      </div>
      <SearchFilter
        ref="filter"
        :options="options"
        :is-message-console="true"
        :keyword.sync="keyword"
        @changeFilter="fetchData"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 300px)"
      fit
      @row-click="showMessage"
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
      <el-table-column
        align="center"
        label="Receiver"
        prop="creator.name"
        width="200px"
      />
      <el-table-column
        align="center"
        label="Action"
        width="210px"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="buttonPrimaryReverse"
            icon="el-icon-edit"
            @click.stop="handleEdit(scope.row)"
          >
            {{ $t('general.Edit') }}
          </el-button>
          <el-button
            size="mini"
            type="danger"
            class="text-error"
            icon="el-icon-delete"
            @click.stop="handleDelete(scope.row)"
          >
            {{ $t('general.Delete') }}
          </el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <pagination
      ref="pagination"
      :total="listQuery.total"
      :page.sync="listQuery.current"
      :limit="listQuery.limit"
      :page-sizes="[10, 25, 50, 100]"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
    <el-row 
      type="flex"
      class="ps"
      justify="end"
    >
      * The system only keeps 7 days messages. Pelase save the message in local if it's important.
    </el-row>
    <CreateMessage ref="createDialog" :alert-list="options" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SearchFilter from './components/SearchFilter.vue'
import CreateMessage from './components/CreateMessage.vue'
import { getMessageListAdmin } from '@/api/monitoring'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { BasicData, Pagination } from '@/newMixins'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'Inbox',
  components: { SearchFilter, ElTableColumnTime, CreateMessage },
  mixins: [BasicData, Pagination],
  data() {
    return {
      keyword: '',
      listLoading: false,
      messageList: [],
      params: params(),
      listQuery: {},
      timeoutId: -1,
      message: {}
    }
  },
  computed: {
    ...mapGetters(['userId']),
    pagedData() {
      return this.messageList
    },
    options() {
      return [{
        id: 1,
        label: this.$t('Inbox.Info'),
        color: '#67c23a'
      }, {
        id: 2,
        label: this.$t('Inbox.Warning'),
        color: '#e6d53c'
      }, {
        id: 3,
        label: this.$t('Inbox.Error'),
        color: '#e6a23c'
      }, {
        id: 4,
        label: this.$t('Inbox.Critical'),
        color: '#f56c6c'
      }]
    } 
  },
  watch: {
    keyword: {
      handler(val) {
        clearTimeout(this.timeoutId)
        this.timeoutId = window.setTimeout(() => this.onSearch(val), 1000)
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
  },
  methods: {
    async fetchData() {
      const res = await getMessageListAdmin(this.params)
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
    async onFilter(filter) {
      console.log(filter)
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
    messageType(level) {
      return this.options.find(x => x.id === level.id).label
    },
    tagColor(level) {
      return this.options.find(x => x.id === level.id).color
    },
    showMessage(msg) {
      this.$refs.messageDialog.dialogVisible = true
      this.message = msg
    },
    setReadMessage(idx) {
      this.message.read = true
      this.$set(this.messageList, idx, this.message)
    },
    createMessage() {
      this.$refs.createDialog.showDialog = true
    },
    handleBack() {
      this.$router.push({ name: 'inbox' })
    }
  }
}
</script>

<style lang="scss">
.ps {
  /* color: #e66262;  */
  margin-top: 12px 
}
</style>
