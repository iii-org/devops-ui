<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import WangEditor from '@/components/Wangeditor'
import { getWikiList } from '@/api/wiki'
import { formatTime } from '../../utils/index.js'

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
      wikiList: [],
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
    handleUpdate() {
      this.dialogVisible = false
      this.wikiContent = this.newWikiContent
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    myFormatTime(time) {
      return formatTime(new Date(time))
    },
    handleEdit(idx, row) {},
    handleDelete() {}
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
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" /> Delete
          </el-button>
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
    <el-dialog title="Edit Wiki" :visible="dialogVisible" width="70%" @close="handleClose">
      <WangEditor @get-editor-data="emitGetEditorData" :wiki-content="wikiContent"> </WangEditor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style lang="scss">
.wiki-container {
  margin-top: 10px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #c0c0c0;
}
</style>
