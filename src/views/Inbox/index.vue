<template>
  <div class="app-container">
    <div
      :class="userId === 1 ? 'flex justify-between' : ''"
      :style="userId === 1 ? '' : 'text-align: right'"
    >
      <el-button
        v-if="userId === 1"
        class="buttonPrimary"
        @click="messageConsole"
      >
        {{ $t('Inbox.MessageConsole') }}
      </el-button>
      <SearchFilter
        ref="filter"
        :options="options"
        :keyword.sync="keyword"
        @changeFilter="changeFilter"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      :row-class-name="tableRowStyle"
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
        width="500px"
      >
        <template slot-scope="scope">
          {{ scope.row.title ? scope.row.title : 'No Title' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Inbox.Type')"
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
      />
      <el-table-column
        align="center"
        :label="$t('Inbox.Sender')"
        prop="creator.name"
      />
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
      {{ $t('Inbox.MessageNote') }}
    </el-row>
    <MessageDialog ref="messageDialog" :message="message" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SearchFilter from './components/SearchFilter.vue'
import { getMessageList, setReadMessage } from '@/api_v2/monitoring'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import { BasicData, Pagination } from '@/newMixins'
import MessageDialog from '@/components/Notification/components/MessageDialog.vue'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'Inbox',
  components: { SearchFilter, ElTableColumnTime, MessageDialog },
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
        label: this.$t('Inbox.Urgent'),
        color: '#e6a23c'
      }, {
        id: 101,
        label: this.$t('Inbox.NewVersion'),
        color: ''
      }, {
        id: 102,
        label: this.$t('Inbox.SystemAlert'),
        color: '#f56c6c'
      }, {
        id: 103,
        label: this.$t('Inbox.SystemWarning'),
        color: '#e6d53c'
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
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
  },
  methods: {
    async fetchData() {
      const res = await getMessageList(this.params)
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
    async changeFilter(filter) {
      this.params = { ...this.params, ...filter }
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
    messageType(level) {
      const alert = this.options.find(x => x.id === level.id)
      return alert ? alert.label : this.$t('Inbox.' + level.name)
    },
    tagColor(level) {
      const alert = this.options.find(x => x.id === level.id)
      if (alert) return alert.color
      else if (level.id >= 200 && level.id < 300) return '#67c23a'
      else if (level.id >= 300 && level.id < 400) return '#f56c6c'
      else return ''
    },
    tableRowStyle({ row }) {
      if (row.read === false) {
        return 'readRow'
      }
      return ''
    },
    showMessage(msg) {
      this.$refs.messageDialog.dialogVisible = true
      this.message = msg
      this.readMessage(msg)
    },
    async readMessage(msg) {
      if (msg.users_can_read === true && msg.read === false) {
        try {
          await setReadMessage(this.userId, { message_ids: [msg.id] }).then(() => {
            const findChangeIndex = this.messageList.findIndex(item => parseInt(msg.id) === parseInt(item.id))
            this.setReadMessage(findChangeIndex)
          })
        } catch (err) {
          console.error(err)
        }
        // const findChangeIndex = this.messageList.findIndex(msg => parseInt(msg_id) === parseInt(msg.id))
        // this.setReadMessage(findChangeIndex)
      }
    },
    setReadMessage(idx) {
      this.message.read = true
      this.$set(this.messageList, idx, this.message)
    },
    messageConsole() {
      this.$router.push({ name: 'MessageConsole' })
    }
  }
}
</script>

<style lang="scss">
.ps {
  /* color: #e66262;  */
  margin-top: 12px
}
.readRow {
  font-weight: bold !important;
}
</style>
