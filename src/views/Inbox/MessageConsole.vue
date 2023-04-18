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
        <el-button class="buttonSecondary" @click="createMessage">
          <em class="ri-mail-add-fill" />
          {{ $t('Inbox.CreateMessage') }}
        </el-button>
      </div>
      <SearchFilter
        ref="filter"
        :options="options"
        :is-message-console="true"
        :keyword.sync="keyword"
        @changeFilter="changeFilter"
      />
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      height="calc(100vh - 300px)"
      fit
    >
      <el-table-column align="center" :label="$t('Inbox.No')" prop="row_id" width="80px" />
      <el-table-column header-align="center" :label="$t('Inbox.Title')" width="450px">
        <template slot-scope="scope">
          {{ scope.row.title ? scope.row.title : 'No Title' }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Inbox.Type')">
        <template slot-scope="scope">
          <el-tag
            effect="dark"
            :style="{
              'background-color': tagColor(scope.row.alert_level),
              'border-color': tagColor(scope.row.alert_level)
            }"
          >
            {{ messageType(scope.row.alert_level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column-time prop="created_at" :label="$t('Inbox.Date')" />
      <el-table-column align="center" :label="$t('Inbox.Sender')" prop="creator.name" width="100px">
        <template slot-scope="scope">
          {{ `${scope.row.creator.name} (${scope.row.creator.login})` }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Inbox.GroupReceiverTitle')" prop="creator.name">
        <template slot-scope="scope">
          {{ receiverName(scope.row.types[0].type_id) }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.View')" prop="already_receive_number">
        <template slot-scope="scope">
          {{ scope.row.already_receive_number }} / {{ scope.row.total_receive_number }}
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Status')">
        <template slot-scope="scope">
          <el-tag :type="scope.row.close ? 'info' : 'success'">
            {{ scope.row.close ? $t('Version.closed') : $t('Version.open') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')" width="150px">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.alert_level.id < 100"
            placement="bottom"
            :content="$t('general.Edit')"
          >
            <em
              class="ri-file-edit-line finished operate-button"
              :disabled="scope.row.close"
              @click.stop="handleEdit(scope.row)"
            />
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('general.Delete')"
          >
            <el-popconfirm
              :confirm-button-text="$t('general.Delete')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              :title="$t('Notify.confirmDelete')"
              @confirm="handleDelete(scope.row)"
            >
              <em
                slot="reference"
                class="ri-delete-bin-2-line danger operate-button"
              />
            </el-popconfirm>
          </el-tooltip>
          <el-tooltip
            v-if="scope.row.alert_level.id < 100"
            placement="bottom"
            :content="$t('general.Close')"
          >
            <em
              class="el-icon-circle-close inProgress operate-button"
              :disabled="scope.row.close"
              @click.stop="handleClose(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty :description="$t('general.NoData')" />
      </template>
    </el-table>
    <Pagination
      ref="pagination"
      :total="listQuery.total"
      :page.sync="listQuery.current"
      :limit="listQuery.limit"
      :page-sizes="[10, 25, 50, 100]"
      :layout="'total, sizes, prev, pager, next'"
      @pagination="onPagination"
    />
    <el-row type="flex" class="ps" justify="end">
      {{ $t('Inbox.MessageNote') }}
    </el-row>
    <CreateMessage
      ref="createDialog"
      :alert-list="options"
      :is-edit="isEdit"
      :message-data="messageData"
      @edit="isEdit = false"
      @load-data="fetchData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getMessageListAdmin, deleteMessage, closeMessage } from '@/api_v2/monitoring'
import { BasicData, Pagination } from '@/mixins'
import { ElTableColumnTime } from '@/components'
import SearchFilter from './components/SearchFilter'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'Inbox',
  components: {
    ElTableColumnTime,
    SearchFilter,
    CreateMessage: () => import('./components/CreateMessage.vue')
  },
  mixins: [BasicData, Pagination],
  data() {
    return {
      keyword: '',
      listLoading: false,
      messageList: [],
      params: params(),
      listQuery: {},
      timeoutId: -1,
      message: {},
      isEdit: false,
      messageData: {}
    }
  },
  computed: {
    ...mapGetters(['userId']),
    pagedData() {
      return this.messageList
    },
    options() {
      return [
        {
          id: 1,
          label: this.$t('Inbox.Info'),
          color: '#67c23a'
        },
        {
          id: 2,
          label: this.$t('Inbox.Warning'),
          color: '#e6d53c'
        },
        {
          id: 3,
          label: this.$t('Inbox.Urgent'),
          color: '#e6a23c'
        },
        {
          id: 101,
          label: this.$t('Inbox.NewVersion'),
          color: ''
        },
        {
          id: 102,
          label: this.$t('Inbox.SystemAlert'),
          color: '#f56c6c'
        },
        {
          id: 103,
          label: this.$t('Inbox.SystemWarning'),
          color: '#e6d53c'
        }
      ]
    },
    groupReceiver() {
      return [
        {
          id: 1,
          label: this.$t('Inbox.GroupReceiver.All')
        },
        {
          id: 2,
          label: this.$t('Inbox.GroupReceiver.Project')
        },
        {
          id: 3,
          label: this.$t('Inbox.GroupReceiver.User')
        },
        {
          id: 4,
          label: this.$t('Inbox.GroupReceiver.Role')
        },
        {
          id: 5,
          label: this.$t('Inbox.GroupReceiver.ProjectOwner')
        }
      ]
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
      this.listLoading = true
      const res = await getMessageListAdmin(this.params)
      this.messageList = res.data.notification_message_list
      const start_id = res.data.page.limit * (res.data.page.current - 1) + 1
      this.messageList.forEach((item, i) => {
        item.row_id = start_id + i
      })
      this.listQuery = Object.assign({}, res.data.page)
      this.edit = false
      this.listLoading = false
    },
    async onSearch(keyword) {
      this.params.search = keyword
      if (keyword === '') delete this.params.search
      await this.loadData()
    },
    async changeFilter(filter) {
      if (filter) {
        this.params = { ...this.params, ...filter }
      } else {
        this.params = {
          limit: this.params.limit,
          offset: this.params.offset
        }
      }
      if (
        Object.prototype.hasOwnProperty.call(this.params, 'include_system_message') &&
        !this.params.include_system_message
      ) {
        delete this.params.include_system_message
      }
      await this.loadData()
    },
    async onPagination(listQuery) {
      const { limit, page } = listQuery
      const offset = limit * (page - 1)
      this.params.offset = offset
      this.params.limit = limit
      if (this.keyword !== '') this.params.search = this.keyword
      await this.loadData()
    },
    messageType(level) {
      return this.options.find((x) => x.id === level.id).label
    },
    tagColor(level) {
      return this.options.find((x) => x.id === level.id).color
    },
    receiverName(group_id) {
      return this.groupReceiver.find((x) => x.id === group_id).label
    },
    createMessage() {
      this.$refs.createDialog.showDialog = true
    },
    handleEdit(msg) {
      this.$refs.createDialog.showDialog = true
      this.messageData = msg
      this.isEdit = true
    },
    async handleDelete(row) {
      this.listLoading = true
      try {
        await deleteMessage(row.id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
        await this.fetchData()
      } catch (error) {
        console.error(error)
        this.listLoading = false
      }
    },
    async handleClose(row) {
      this.listLoading = true
      await closeMessage(row.id)
        .then(async () => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Inbox.NotifyClosed'),
            type: 'success'
          })
          this.fetchData()
        })
        .catch((err) => {
          console.error(err)
          this.isLoading = false
        })
    },
    handleBack() {
      this.$refs.filter.cleanFilter()
      this.$router.push({ name: 'Inbox' })
    }
  }
}
</script>

<style lang="scss">
.ps {
  /* color: #e66262;  */
  margin-top: 12px;
}
</style>
