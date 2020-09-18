<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import WangEditor from '@/components/Wangeditor'
import { getWikiList, getWikiDetail, putWikiDetail, deleteWiki } from '@/api/wiki'
import { formatTime } from '../../utils/index.js'
import { Message } from 'element-ui'

export default {
  components: {
    WangEditor,
    ProjectListSelector,
    Pagination
  },
  data() {
    return {
      isLoading: false,
      listLoading: true,
      editBtnLoading: false,
      direction: 'rtl',
      wikiList: [],
      wikiData: {},
      wikiContent: 'Hello DevOps',
      newWikiContent: '',
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit - 1
      return this.wikiList.slice(start, end)
    }
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    }
  },
  async created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      const res = await getWikiList(this.projectSelectedId)
      this.wikiList = res.data.wiki_pages
      this.listLoading = false
    },
    emitGetEditorData(value) {
      this.newWikiContent = value
    },
    handleClose() {
      this.dialogVisible = false
    },
    async handleUpdate() {
      this.editBtnLoading = true
      const text = this.$refs.editor.onUpdate()
      try {
        await putWikiDetail(this.projectSelectedId, this.wikiData.title, { wiki_text: text })
        Message({
          message: 'Wiki update successfully',
          type: 'success',
          duration: 1 * 3000
        })
        this.dialogVisible = false
      } catch (error) {
        console.error(error)
      }
      this.editBtnLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    myFormatTime(time) {
      return formatTime(new Date(time))
    },
    async handleEdit(idx, row) {
      this.listLoading = true
      try {
        const res = await getWikiDetail(this.projectSelectedId, row.title)
        const { wiki_page } = res.data
        this.wikiData = wiki_page
        this.wikiContent = wiki_page.text
        this.dialogVisible = true
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    async handleDelete(idx, row) {
      console.log(row)
      this.listLoading = true
      try {
        await deleteWiki(this.projectSelectedId, row.title)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }

      this.listLoading = false
    }
  }
}
</script>
<template>
  <div v-loading="isLoading" class="app-container">
    <div>
      <project-list-selector />
    </div>
    <el-divider />
    <!-- <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="dialogVisible = true">
        Edit
      </el-button>
    </div> -->
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column prop="title" label="Title" />
      <el-table-column prop="version" label="Version" />
      <el-table-column label="Created">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.created_on) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Updated">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.updated_on) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            Edit
          </el-button>
          <el-popconfirm
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
            icon="el-icon-info"
            iconColor="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button size="mini" type="danger" slot="reference"> <i class="el-icon-delete" /> Delete</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="wikiList.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[20]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-drawer
      :title="'Edit Wiki'"
      :visible.sync="dialogVisible"
      :direction="direction"
      :before-close="handleClose"
      :append-to-body="true"
      :with-header="false"
      size="60%"
    >
      <div class="container">
        <WangEditor @get-editor-data="emitGetEditorData" :content="wikiContent" ref="editor" />
        <div class="file-drawer__footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="editBtnLoading" @click="handleUpdate">Confirm</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<style lang="scss">
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: 20px;
  justify-content: center;
  #editor-container {
    flex: 1;
  }
  .file-commit-message {
    flex-basis: 160px;
  }
  .file-drawer__footer {
    flex-basis: 60px;
    padding-top: 20px;
  }
  >>> #w-e-text {
    white-space: pre-line;
  }
}
</style>
