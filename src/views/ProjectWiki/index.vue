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
      dialogVisibleEdit: false,
      drawerTitle: '',
      wikiTitle: '',
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
      this.drawerTitle = 'Edit'
      try {
        const res = await getWikiDetail(this.projectSelectedId, row.title)
        const { wiki_page } = res.data
        this.wikiData = wiki_page
        this.wikiTitle = wiki_page.title
        this.wikiContent = wiki_page.text
        this.dialogVisible = true
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
    },
    async handleDetail(idx, row) {
      try {
        this.listLoading = false
        this.drawerTitle = 'Detail'
        const res = await getWikiDetail(this.projectSelectedId, row.title)
        const { wiki_page } = res.data
        this.wikiData = wiki_page
        this.wikiContent = wiki_page.text
        this.dialogVisible = true
        this.dialogVisibleEdit = false
      } catch (error) {
        console.error(error)
      } finally {
        this.listLoading = false
      }
    },
    async handleAdding() {
      this.dialogVisible = true
      this.drawerTitle = 'Add'
      this.wikiContent = ''
      this.wikiTitle = ''
    },
    async handleConfirmAdd() {
      this.editBtnLoading = true
      const text = this.$refs.editor.onUpdate()
      try {
        await putWikiDetail(this.projectSelectedId, this.wikiTitle, { wiki_text: text })
        Message({
          message: 'Wiki create successfully',
          type: 'success',
          duration: 1 * 3000
        })
        this.fetchData()
      } catch (error) {
        console.error(error)
      } finally {
        this.dialogVisible = false
        this.editBtnLoading = false
      }
    }
  }
}
</script>
<template>
  <div v-loading="isLoading" class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" @click="handleAdding">
          <i class="el-icon-plus" />
          Add Ｗiki
        </el-button>
      </span>
    </div>
    <el-divider />
    <!-- <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="dialogVisible = true">
        Edit
      </el-button>
    </div> -->
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column prop="title" label="Title" />
      <el-table-column prop="version" label="Version" width="160" />
      <el-table-column label="Created" width="240">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.created_on) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Updated" width="240">
        <template slot-scope="scope">
          <span>{{ myFormatTime(scope.row.updated_on) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="300" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="handleDetail(scope.$index, scope.row)">
            <i class="el-icon-document" />
            Detail
          </el-button>
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
      :title="`${drawerTitle} Wiki`"
      :visible.sync="dialogVisible"
      :direction="direction"
      :before-close="handleClose"
      :append-to-body="true"
      :with-header="false"
      size="80%"
    >
      <div class="container">
        <div class="form__title">
          <el-input v-if="drawerTitle === 'Add'" v-model="wikiTitle" placeholder="Please Input Title" />
          <h3 v-else>{{ wikiData.title }}</h3>
        </div>
        <div class="form__body">
          <br />
          <template v-if="drawerTitle !== 'Detail'">
            <WangEditor @get-editor-data="emitGetEditorData" :content="wikiContent" ref="editor" />
          </template>
          <template v-else>
            <pre>
            <div v-html="wikiContent" />
            </pre>
          </template>
        </div>
        <div class="form__footer">
          <el-button
            @click="
              dialogVisible = false
              dialogVisibleEdit = false
            "
          >
            Cancel
          </el-button>
          <el-button v-if="drawerTitle === 'Edit'" type="primary" :loading="editBtnLoading" @click="handleUpdate">
            Confirm
          </el-button>
          <el-button
            v-else-if="drawerTitle === 'Add'"
            type="primary"
            :loading="editBtnLoading"
            @click="handleConfirmAdd"
          >
            Confirm
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<style lang="scss">
.clearfix {
  clear: both;
  .newBtn {
    float: right;
    padding-right: 6px;
  }
}
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: 20px;
  .form__title {
    flex-basis: 60px;
  }
  .form__body {
    flex: 1;
  }
  .form__footer {
    flex-basis: 60px;
    padding-top: 20px;
    text-align: right;
  }

  /* table 样式 */
  table {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
  }
  table td,
  table th {
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc;
    padding: 3px 5px;
  }
  table th {
    border-bottom: 2px solid #ccc;
    text-align: center;
  }

  /* blockquote 样式 */
  blockquote {
    display: block;
    border-left: 8px solid #d0e5f2;
    padding: 5px 10px;
    margin: 10px 0;
    line-height: 1.4;
    font-size: 100%;
    background-color: #f1f1f1;
  }

  /* code 样式 */
  code {
    display: inline-block;
    *display: inline;
    *zoom: 1;
    background-color: #f1f1f1;
    border-radius: 3px;
    padding: 3px 5px;
    margin: 0 3px;
  }
  pre code {
    display: block;
  }

  /* ul ol 样式 */
  ul,
  ol {
    margin: 10px 0 10px 20px;
  }
  #editor-container {
    flex: 1;
  }
  .file-commit-message {
    flex-basis: 160px;
  }
  >>> #w-e-text {
    white-space: pre-line;
  }
}
</style>
