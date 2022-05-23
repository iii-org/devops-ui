<template>
  <div class="app-container">
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
        prop="from_project_name"
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
              <span class="text-title">
                {{ scope.row.template_repository_url }}
              </span>
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
                :href="scope.row.template_repository_url"
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
              type="primary"
              :disabled="scope.row.disabled || scope.row.is_lock"
              style="font-size: 16px"
            >
              {{ scope.row.template_repository_name }}
            </el-link>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Activities.OriginalProject')"
        prop="from_project_name"
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
              :id="`copy-${scope.row.from_project_name}`"
              class="text-center"
            >
              <span class="text-title">
                {{ scope.row.from_project_repo_url }}
              </span>
            </p>
            <div class="flex justify-center">
              <el-button
                class="mr-2"
                icon="el-icon-copy-document"
                circle
                size="mini"
                @click="copyUrl(`copy-${scope.row.from_project_name}`)"
              />
              <a
                :href="scope.row.from_project_repo_url"
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
            <template slot="reference">
              {{ scope.row.from_project_name }}
              <el-link
                size="small"
                :underline="false"
                :disabled="scope.row.disabled || scope.row.is_lock"
              >
                <em class="ri-external-link-line" />
              </el-link>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Activities.QuoteTimes')"
        prop="times_cited"
        width="100"
      />
      <el-table-column-time
        :label="$t('Activities.OriginalProjectUpdatedTime')"
        prop="the_last_update_time"
        width="150"
      />
      <el-table-column-time
        :label="$t('Activities.SyncTime')"
        prop="updated_at"
      />
      <el-table-column
        align="center"
        :label="$t('general.Creator')"
        prop="creator_name"
        width="150"
      />
      <el-table-column
        align="center"
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
      :total="filteredData.length"
      :page.sync="listQuery.current"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
    <TemplateDialog
      ref="templateDialog"
      :dialog-visible.sync="dialogVisible"
      :existed-template-ids="existedTemplateIds"
      :title="title"
      @update="loadData"
    />
  </div>
</template>

<script>
import { getTemplateFromProject, deleteTemplateFromProject } from '@/api_v2/template'
import { BasicData, Pagination, Table, SearchBar } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import TemplateDialog from './components/TemplateDialog'

export default {
  name: 'TemplateManage',
  components: { ElTableColumnTime, TemplateDialog },
  mixins: [BasicData, Table, Pagination, SearchBar],
  data() {
    return {
      dialogVisible: false,
      title: '',
      searchKeys: ['from_project_name']
    }
  },
  computed: {
    existedTemplateIds() {
      return this.listData.map((item) => item.from_project_id)
    }
  },
  methods: {
    async fetchData() {
<<<<<<< HEAD
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
=======
      return (await getTemplateFromProject()).data
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    copyUrl(id) {
      const message = this.$t('Notify.Copied')
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.showSuccessMessage(message)
>>>>>>> selftemplate
    },
    handleCreate() {
      this.dialogVisible = true
      this.title = this.$t('Activities.CreateTemplate')
    },
    handleEdit(row) {
      this.dialogVisible = true
      this.title = this.$t('Activities.EditTemplate')
<<<<<<< HEAD
    },
    handleDelete(row) { }
=======
      this.$refs.templateDialog.row = row
    },
    async handleDelete(row) {
      try {
        await deleteTemplateFromProject(row.id)
        const message = this.$t('Notify.Deleted')
        this.showSuccessMessage(message)
      } catch (error) {
        console.error(error)
      } finally {
        this.loadData()
      }
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    }
>>>>>>> selftemplate
  }
}
</script>
