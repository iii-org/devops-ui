<template>
  <el-row class="app-container">
    <el-col>
      <div class="flex justify-between">
        <el-button
          class="buttonPrimary"
          icon="el-icon-plus"
          @click="handleCreate"
        >
          {{ $t('Activities.AddTemplate') }}
        </el-button>
      </div>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        fit
      >
        <el-table-column
          type="index"
          align="center"
          :label="$t('general.Index')"
          width="100"
        />
        <el-table-column
          align="center"
          :label="$t('Activities.TemplateName')"
        >
          <template slot-scope="scope">
            <el-popover
              placement="top"
              width="400"
              trigger="hover"
              :open-delay="300"
              :close-delay="50"
            >
              <p
                :id="`copy-${scope.$index}`"
                class="text-center"
              >
                <span class="text-title">{{ scope.row.git_url }}</span>
              </p>
              <div class="flex justify-center">
                <el-button
                  class="mr-2"
                  icon="el-icon-copy-document"
                  circle
                  size="mini"
                  @click="copyUrl(`copy-${scope.$index}`)"
                />
                <a
                  :href="scope.row.git_url"
                  target="_blank"
                >
                  <el-button
                    circle
                    size="mini"
                  >
                    <em class="ri-external-link-line" />
                  </el-button>
                </a>
              </div>
              <el-link
                slot="reference"
                :underline="false"
                :disabled="scope.row.disabled || scope.row.is_lock"
                style="font-size: 22px"
              >
                {{ scope.row.operator_name }}
              </el-link>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('Activities.OriginalProject')"
          prop="action_type"
        />
        <el-table-column
          align="center"
          :label="$t('Activities.QuoteTimes')"
          prop="action_parts"
        />
        <el-table-column-time
          prop="act_at"
          :label="$t('Activities.OriginalProjectUpdatedTime')"
        />
        <el-table-column-time
          prop="act_at"
          :label="$t('Activities.SyncTime')"
        />
        <el-table-column
          align="center"
          prop="action_parts"
          :label="$t('general.Creator')"
        />
        <el-table-column
          align="center"
          prop="action_parts"
          :label="$t('general.Actions')"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              class="buttonPrimaryReverse"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >
              {{ $t('general.Edit') }}
            </el-button>
            <el-popconfirm
              :confirm-button-text="$t('general.Delete')"
              :cancel-button-text="$t('general.Cancel')"
              icon="el-icon-info"
              icon-color="red"
              :title="$t('Notify.confirmDelete')"
              @confirm="handleDelete(scope.row)"
            >
              <el-button
                slot="reference"
                size="mini"
                type="danger"
              >
                <em class="el-icon-delete" />
                {{ $t('general.Delete') }}
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
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
    <TemplateDialog
      :dialog-visible.sync="dialogVisible"
      :title="title"
    />
  </el-row>
</template>

<script>
import { getProjectActivities } from '@/api/activities'
import { BasicData, Pagination, Table } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import TemplateDialog from './components/TemplateDialog'

const params = () => ({
  limit: 10,
  offset: 0
})

export default {
  name: 'TemplateManage',
  components: { ElTableColumnTime, TemplateDialog },
  mixins: [BasicData, Pagination, Table],
  data() {
    return {
      params: params(),
      dialogVisible: false,
      title: '',
      activitiesList: []
    }
  },
  computed: {
    // cover the origin pagedData
    pagedData() {
      return this.activitiesList
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
    handleCreate() {
      this.dialogVisible = true
      this.title = this.$t('Activities.CreateTemplate')
    },
    handleEdit(row) {
      this.dialogVisible = true
      this.title = this.$t('Activities.EditTemplate')
    },
    handleDelete(row) { }
  }
}
</script>
