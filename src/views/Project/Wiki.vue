<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container" style="overflow: hidden;">
    <div class="clearfix">
      <project-list-selector />
      <span class="newBtn">
        <el-button type="success" :disabled="selectedProjectId === -1" @click="handleAdding">
          <i class="el-icon-plus" />
          {{ $t('Wiki.AddWiki') }}
        </el-button>
      </span>
      <el-input
        v-model="searchData"
        prefix-icon="el-icon-search"
        :placeholder="$t('Wiki.SearchTitle')"
        style="width: 250px; float: right"
      />
    </div>

    <el-divider />
    <!-- <div class="filter-container">
      <el-button class="filter-item" type="primary" @click="dialogVisible = true">
        Edit
      </el-button>
    </div> -->
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      height="100%"
    >
      <el-table-column align="center" :label="$t('Wiki.Title')" prop="title" min-width="120" />
      <el-table-column align="center" :label="$t('Version.Version')" min-width="50" prop="version" />
      <el-table-column-time prop="created_on" :label="$t('general.CreateTime')" />
      <el-table-column-time prop="updated_on" :label="$t('general.LastUpdateTime')" />
      <el-table-column align="center" :label="$t('general.Actions')" width="300">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" plain @click="handleDetail(scope.$index, scope.row)">
            <i class="el-icon-document" />
            {{ $t('Wiki.Content') }}
          </el-button>
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            {{ $t('general.Edit') }}
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(scope.$index, scope.row)"
          >
            <el-button slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" /> {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
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
        <el-form v-if="drawerTitle === 'Add'" ref="form" :model="form" :rules="formRules" label-position="top">
          <el-form-item ref="wikiTitle" label="Title" prop="wikiTitle">
            <!-- <div class="form__title"> -->
            <el-input v-model="form.wikiTitle" placeholder="Please Input Title" />
            <!-- </div> -->
          </el-form-item>
        </el-form>
        <h3 v-else>{{ wikiData.title }}</h3>
        <div class="form__body">
          <br>
          <template>
            <editor
              v-if="dialogVisible"
              id="md_editor"
              ref="mdEditor"
              :initial-value="wikiContent"
              initial-edit-type="wysiwyg"
              height="500px"
            />
          </template>
        </div>
        <div class="form__footer">
          <el-button
            @click="
              dialogVisible = false
              dialogVisibleEdit = false
            "
          >
            {{ $t('general.Cancel') }}
          </el-button>
          <el-button v-if="drawerTitle === 'Edit'" type="primary" :loading="editBtnLoading" @click="handleUpdate">
            {{ $t('general.Confirm') }}
          </el-button>
          <el-button
            v-else-if="drawerTitle === 'Add'"
            type="primary"
            :loading="editBtnLoading"
            @click="handleConfirmAdd"
          >
            {{ $t('general.Confirm') }}
          </el-button>
        </div>
      </div>
    </el-drawer>
    <el-drawer
      class="wiki"
      :title="`${drawerTitle} Wiki`"
      :visible.sync="detailVisible"
      :direction="direction"
      :before-close="handleClose"
      :append-to-body="true"
      :with-header="false"
      size="80%"
    >
      <div class="container">
        <div class="form__title">
          <h3>{{ wikiData.title }}</h3>
          <div v-if="detailVisible" style="text-align: right;">
            {{ $t('Wiki.edited', { user: wikiData.author.name }) }}
          </div>
          <el-divider />
        </div>
        <div class="form__body">
          <VueShowdown :markdown="wikiContent" />
        </div>
        <div class="form__footer">
          <el-button @click="detailVisible = false"> {{ $t('general.Close') }}</el-button>
        </div>
      </div>
    </el-drawer>
  </el-row>
</template>

<script>
import { deleteWiki, getWikiDetail, getWikiList, putWikiDetail } from '@/api/wiki'
import MixinElTableWithAProject from '@/mixins/MixinElTableWithAProject'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/vue-editor'

export default {
  name: 'ProjectWiki',
  components: {
    ElTableColumnTime,
    editor: Editor
  },
  mixins: [MixinElTableWithAProject],
  data() {
    return {
      isLoading: false,
      editBtnLoading: false,
      direction: 'rtl',
      wikiData: {},
      wikiContent: '',
      detailVisible: false,
      dialogVisible: false,
      dialogVisibleEdit: false,
      drawerTitle: '',
      wikiTitle: '',
      searchKey: 'title',
      formRules: {
        wikiTitle: [
          { required: true, message: 'Please input name', trigger: 'change' },
          {
            pattern: /^((?![,.\/?;:|]).)*$/,
            message: 'Not allowing special characters (, . / ? ; : |)',
            trigger: 'blur'
          }
        ]
      },
      form: { wikiTitle: '' }
    }
  },
  methods: {
    async fetchData() {
      if (this.selectedProjectId === -1) {
        this.showNoProjectWarning()
        return []
      }
      return (await getWikiList(this.selectedProjectId)).data.wiki_pages
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
      this.listLoading = false
    },
    handleClose() {
      this.detailVisible = false
    },
    async handleUpdate() {
      this.editBtnLoading = true
      const text = this.$refs.mdEditor.invoke('getMarkdown')
      try {
        await putWikiDetail(this.selectedProjectId, this.wikiData.title, { wiki_text: text })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.dialogVisible = false
        await this.loadData()
      } catch (error) {
        console.error(error)
      }
      this.editBtnLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async handleEdit(idx, row) {
      this.listLoading = true
      this.drawerTitle = 'Edit'
      try {
        const res = await getWikiDetail(this.selectedProjectId, row.title)
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
      this.listLoading = true
      try {
        await deleteWiki(this.selectedProjectId, row.title)
        await this.loadData()
      } catch (error) {
        console.error(error)
      }

      this.listLoading = false
    },
    async handleDetail(idx, row) {
      try {
        this.listLoading = false
        this.drawerTitle = 'Detail'
        const res = await getWikiDetail(this.selectedProjectId, row.title)
        const { wiki_page } = res.data
        this.wikiData = wiki_page
        this.wikiContent = wiki_page.text
        this.detailVisible = true
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
      this.wikiContent = '# WIKI'
      this.form.wikiTitle = ''
    },
    async handleConfirmAdd() {
      this.$refs['form'].validate(async valid => {
        if (!valid) {
          return
        }
        this.editBtnLoading = true
        const text = this.$refs.mdEditor.invoke('getMarkdown')
        try {
          await putWikiDetail(this.selectedProjectId, this.form.wikiTitle, { wiki_text: text })
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Created'),
            type: 'success'
          })
        } catch (error) {
          console.error(error)
        } finally {
          this.dialogVisible = false
          this.editBtnLoading = false
          await this.loadData()
        }
      })
    }
  }
}
</script>

<style lang="scss">
.el-drawer__body {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 5px;
}

.clearfix {
  clear: both;

  .newBtn {
    float: right;
    padding-right: 6px;
  }
}

.wiki {
  a {
    text-decoration: underline;
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

  blockquote {
    display: block;
    border-left: 8px solid #d0e5f2;
    padding: 5px 10px;
    margin: 10px 0;
    line-height: 1.4;
    font-size: 100%;
    background-color: #f1f1f1;
  }

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

  > #w-e-text {
    white-space: pre-line;
  }
}
</style>
