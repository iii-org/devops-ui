<template>
  <div div class="app-container">
    <div class="flex justify-between">
      <el-checkbox
        v-model="selectAll"
        :label="$t('general.SelectAll')"
        style="padding-top: 1rem;"
        @change="handleSelectAll"
      />
      <SearchFilter
        ref="filter"
        @changeFilter="changeFilter"
      >
        <el-popconfirm
          :title="batchCloseHint"
          :confirm-button-text="$t('general.Confirm')"
          :cancel-button-text="$t('general.Cancel')"
          @confirm="batchClose"
        >
          <el-button
            slot="reference"
            class="valign-middle"
            size="small"
            :disabled="noRowSelected"
          >
            {{ $t('Release.batchClose') }}
          </el-button>
        </el-popconfirm>
        <el-button
          class="valign-middle"
          size="small"
          :disabled="noRowSelected"
          @click="batchMoveDialogVisible = true"
        >
          {{ $t('Release.batchMove') }}
        </el-button>
      </SearchFilter>
    </div>
    <el-card
      v-loading="treeLoading"
      :body-style="{ padding: '0.5rem', height: '300px', 'overflow-y': 'auto' }"
    >
      <el-tree
        ref="tree"
        :props="{ disabled:'is_closed' }"
        :data="allIssuesTree"
        node-key="id"
        :filter-node-method="filterNode"
        show-checkbox
        check-strictly
        @check="checkTreeNode"
      >
        <el-descriptions
          slot-scope="{data}"
          :colon="false"
          :column="4"
        >
          <el-descriptions-item
            content-class-name="truncate"
            :content-style="checkStatus(data)"
          >
            <span @click.stop="handleEdit(data)">
              #{{ data.id }} - {{ data.name }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item content-class-name="truncate">
            <span class="pr-3">{{ data.fixed_version.name }}</span>
            <Tracker
              v-if="data.tracker.name"
              class="pr-3"
              :name="$t(`Issue.${data.tracker.name}`)"
              :type="data.tracker.name"
            />
            <Status
              v-if="data.status.name"
              :name="$t(`Issue.${data.status.name}`)"
              :type="data.status.name"
              :size="'mini'"
            />
          </el-descriptions-item>
          <el-descriptions-item
            :label="$t('Issue.Assignee')"
            content-class-name="truncate"
          >
            : {{ data.assigned_to.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <el-button
              class="primary mr-1 p-0"
              type="text"
              @click.stop="handleEdit(data)"
            >
              <em class="el-icon-edit" />
              {{ $t('Issue.EditIssue') }}
            </el-button>
            <el-button
              v-if="!data.has_children && !data.is_closed"
              class="primary mr-1 p-0"
              type="text"
              @click.stop="handleClosedIssueDialogVisible(data)"
            >
              <em class="el-icon-close" />
              {{ $t('general.Close') }}
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
      </el-tree>
    </el-card>
    <el-dialog
      :visible.sync="batchMoveDialogVisible"
      :title="$t('Release.batchMoveDialogTitle')"
    >
      <el-form v-loading="dialogLoading">
        <el-form-item :label="$t('Release.futureVersion')">
          <el-select
            v-model="batchMoveToVersion"
            :placeholder="$t('Release.selectMoveToVersion')"
            filterable
          >
            <el-option
              v-for="item in projectVersionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          {{ $t('Release.batchMoveDialogHint', [selectedIssueIds.length]) }}
        </el-form-item>
        <el-button
          class="buttonPrimary"
          :disabled="!batchMoveToVersion"
          @click="batchMove"
        >
          {{ $t('general.Confirm') }}
        </el-button>
        <el-button
          type="info"
          @click="batchMoveDialogVisible = false"
        >
          {{ $t('general.Cancel') }}
        </el-button>
      </el-form>
    </el-dialog>
    <el-dialog
      :visible.sync="closedIssueDialogVisible"
      :title="$t('Issue.AskDeleteIssue')"
      destroy-on-close
    >
      <IssueNotesEditor
        ref="IssueNotesEditor"
        v-loading="dialogLoading"
        page="IssuesTree"
      />
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="danger"
          :disabled="dialogLoading"
          @click="handleCloseIssue()"
        >
          {{ $t('Issue.CloseIssue') }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="issueDetailDialogVisible"
      width="90%"
      top="3vh"
      append-to-body
      destroy-on-close
    >
      <ProjectIssueDetail
        v-if="issueDetailDialogVisible"
        ref="children"
        :props-issue-id="editedIssueId"
        :is-in-dialog="true"
        @update="handleRelationUpdate"
        @delete="handleRelationUpdate"
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateIssue } from '@/api/issue'
import { getAllChildrenIssue, closeAllIssueByIssueIds } from '@/api_v2/issue'
import SearchFilter from './SearchFilter'
import Status from '@/components/Issue/Status'
import Tracker from '@/components/Issue/Tracker'

export default {
  name: 'IssuesTree',
  components: {
    IssueNotesEditor: () => import('@/views/Project/IssueDetail/components/IssueNotesEditor'),
    ProjectIssueDetail: () => import('@/views/Project/IssueDetail'),
    SearchFilter,
    Status,
    Tracker
  },
  props: {
    selectedVersions: {
      type: Array,
      required: true
    },
    projectVersionOptions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      treeLoading: false,
      issues: [],
      dialogLoading: false,
      batchMoveDialogVisible: false,
      closedIssueDialogVisible: false,
      issueDetailDialogVisible: false,
      batchMoveToVersion: null,
      closedRow: {},
      editedIssueId: '',
      allIssuesTree: [],
      selectedIssueIds: [],
      selectAll: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    batchCloseHint() {
      return this.$t('Release.confirmBatchClose', [this.selectedIssueIds.length])
    },
    noRowSelected() {
      return this.selectedIssueIds.length === 0
    }
  },
  watch: {
    selectedProjectId(val) {
      if (val) this.batchMoveToVersion = null
    }
  },
  mounted() {
    this.getTree()
  },
  methods: {
    async getTree() {
      this.allIssuesTree = []
      this.treeLoading = true
      const params = { fixed_version_ids: this.selectedVersions.toString() }
      await getAllChildrenIssue(this.selectedProjectId, params)
        .then((res) => {
          this.allIssuesTree.push(...res.data)
        })
        .catch(() => {})
        .finally(() => {
          this.treeLoading = false
          this.$refs.filter.onChangeFilter()
          // If all issues are closed, change to create release screen
          if (this.allIssuesTree.length === 0) this.$emit('onInit')
        })
    },
    checkTreeNode(data) {
      const node = this.$refs.tree.getNode(data)
      if (node.checked && node.childNodes.length > 0) {
        this.checkChildrenNode(node)
      } else if (!node.checked && node.parent) {
        this.checkParentNode(node)
      }
      this.selectedIssueIds = this.$refs.tree.getCheckedKeys()
    },
    checkParentNode(node) {
      if (!node.parent) return
      node.parent.checked = node.checked
      this.checkParentNode(node.parent)
    },
    checkChildrenNode(node) {
      node.childNodes.forEach((item) => {
        if (item.data.is_closed) return
        item.checked = node.checked
        if (item.childNodes.length === 0) return
        this.checkChildrenNode(item)
      })
    },
    changeFilter(val) {
      this.$refs.tree.filter(val)
    },
    filterNode(value, data) {
      const isClosed = value.isClosed
      const isSearch = value.keyword !== ''
      const search = data.id.toString().indexOf(value.keyword) !== -1 ||
          data.name.indexOf(value.keyword) !== -1
      if (isClosed && !isSearch) return true
      if (isClosed && isSearch) return search
      if (!isClosed && isSearch) return !data.is_closed && search
      else return !data.is_closed
    },
    handleSelectAll() {
      const root = this.$refs.tree.getNode(this.allIssuesTree[0].id).parent
      root.childNodes.forEach((item) => {
        if (item.data.is_closed) return
        item.checked = this.selectAll
        this.checkChildrenNode(item)
      })
      this.selectedIssueIds = this.$refs.tree.getCheckedKeys()
    },
    handleEdit(row) {
      this.issueDetailDialogVisible = true
      this.editedIssueId = row.id
    },
    handleRelationUpdate() {
      this.getTree()
    },
    handleClosedIssueDialogVisible(row) {
      this.closedRow = row
      this.closedIssueDialogVisible = true
    },
    async handleCloseIssue() {
      const notes = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')
      const formData = this.getFormData({ notes: notes, status_id: 6 })
      this.closeIssue(formData)
    },
    closeIssue(formData) {
      this.dialogLoading = true
      const issueId = this.closedRow.id
      updateIssue(issueId, formData)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        })
        .catch((err) => {
          console.error(err)
        }).finally(() => {
          this.dialogLoading = false
          this.closedIssueDialogVisible = false
          this.getTree()
        })
    },
    async batchClose() {
      this.treeLoading = true
      await closeAllIssueByIssueIds({ issue_ids: this.selectedIssueIds })
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        })
        .catch((err) => {
          console.error(err)
        }).finally(() => {
          this.treeLoading = false
          this.getTree()
        })
    },
    async batchMove() {
      this.dialogLoading = true
      for (const issueId of this.selectedIssueIds) {
        const formData = this.getFormData({ fixed_version_id: this.batchMoveToVersion })
        await updateIssue(issueId, formData)
      }
      this.dialogLoading = false
      this.batchMoveDialogVisible = false
      this.getTree()
    },
    checkStatus(val) {
      if (val.is_closed) return { color: 'gray', opacity: '0.5' }
      if (!this.selectedVersions.includes(val.fixed_version.id)) return { color: 'gray' }
      return {}
    },
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form-item {
  padding: 10px 10px;
  font-weight: bold;
}

>>> .el-tree-node__content {
  align-items: center;
  height: 35px;
}

>>> .el-tree-node:focus > .el-tree-node__content {
  background-color: transparent !important;
}

>>> .el-tree-node:hover > .el-tree-node__content {
  background-color: transparent !important;
}

>>> .el-descriptions-item__label {
  margin-right: 3px;
}

>>> .el-descriptions-row {
  td {
    font-size: 16px;
  }
  td:nth-child(1) {
    width: 35%;
    padding: 0;
  }
  td:nth-child(2) {
    width: 25%;
    padding: 0;
  }
  td:nth-child(3) {
    width: 20%;
    padding: 0;
  }
  td:nth-child(4) {
    width: 20%;
    padding: 0;
  }
}
</style>
