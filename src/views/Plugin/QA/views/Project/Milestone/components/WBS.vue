<template>
  <div id="wrapper" ref="wrapper">
    <el-table v-loading="listLoading" :data="listData" :element-loading-text="$t('Loading')" :height="tableHeight"
              class="table-css"
              row-key="id"
              lazy
              :load="getIssueFamilyData"
              :tree-props="{children: 'children', hasChildren: 'has_children'}"
              @cell-click="handleCellClick"
    >
      >
      <WBSInputColumn
        min-width="28%"
        :label="$t('Issue.name')"
        prop="name"
        required
        fixed
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        min-width="9%"
        :label="$t('Issue.tracker')"
        prop="tracker"
        :components="Tracker"
        :options="tracker"
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        min-width="9%"
        :label="$t('Issue.fixed_version')"
        prop="fixed_version"
        :options="fixed_version"
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSDateColumn
        min-width="9%"
        :label="$t('Issue.StartDate')"
        prop="start_date"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSDateColumn
        min-width="9%"
        :label="$t('Issue.EndDate')"
        prop="due_date"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        min-width="9%"
        :label="$t('Issue.priority')"
        prop="priority"
        :components="Priority"
        :options="priority"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSSelectColumn
        min-width="9%"
        :label="$t('Issue.assigned_to')"
        prop="assigned_to"
        :options="assigned_to"
        :has-child-edit="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSInputColumn
        min-width="9%"
        :label="$t('Issue.DoneRatio')"
        prop="done_ratio"
        :number="true"
        @edit="handleUpdateIssue"
        @create="handleCreateIssue"
        @reset-edit="handleResetEdit"
        @reset-create="handleResetCreate"
      />
      <WBSInputColumn
        min-width="9%"
        :label="$t('Issue.points')"
        :has-child-edit="true"
        prop="points"
      />
      <tr v-if="!hasInlineCreate" slot="append">
        <td class="add-issue-inline">
          <el-link type="text" icon="el-icon-plus" @click="appendIssue()">{{ $t('Issue.AddIssue') }}</el-link>
        </td>
      </tr>
    </el-table>
  </div>
</template>

<script>
import { BasicData } from '@/newMixins'
import { getProjectAssignable, getProjectIssueList, getProjectVersion } from '@/api/projects'
import { mapGetters } from 'vuex'
import { Tracker, Priority } from '@/components/Issue'
import WBSInputColumn from '@/views/Plugin/QA/views/Project/Milestone/components/WBSInputColumn'
import WBSSelectColumn from '@/views/Plugin/QA/views/Project/Milestone/components/WBSSelectColumn'
import WBSDateColumn from '@/views/Plugin/QA/views/Project/Milestone/components/WBSDateColumn'
import { addIssue, getIssueFamily, updateIssue } from '@/api/issue'
import { cloneDeep } from 'lodash'

export default {
  name: 'WBS',
  components: { WBSSelectColumn, WBSInputColumn, WBSDateColumn },
  mixins: [BasicData],
  filter: {
    relativeTime(dateTime) {
      return dateTime
        ? this.$dayjs(dateTime)
          .utc()
          .local()
          .fromNow()
        : '-'
    }
  },
  data() {
    return {
      Priority,
      Tracker,
      fixed_version: [],
      assigned_to: [],
      addIssueVisible: false,
      tableHeight: 0
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'priority', 'tracker', 'userId']),
    hasInlineCreate() {
      const create = this.listData.filter(item => item.create)
      return create.length > 0
    }
  },
  mounted() {
    this.loadVersionList(true)
    this.loadAssignedToList()
    this.tableHeight = this.$refs['wrapper'].clientHeight
  },
  methods: {
    async fetchData() {
      const tracker = this.tracker.find(item => item.name === 'Epic')
      const res = await getProjectIssueList(this.selectedProjectId, { tracker_id: tracker.id, parent_id: 'null' })
      return Promise.resolve(res.data)
    },
    appendIssue(row_index) {
      if (!row_index) row_index = this.listData.length
      const findEpic = this.tracker.find(item => item.name === 'Epic')
      const issueForm = {
        parent_id: null,
        project_id: this.selectedProjectId,
        assigned_to: { id: '', name: '' },
        name: '',
        fixed_version: { id: '', name: '' },
        tracker: { id: (findEpic) ? findEpic.id : '', name: '' },
        status: { id: 1, name: '' },
        priority: { id: 3, name: '' },
        estimated_hours: 0,
        done_ratio: 0,
        start_date: '',
        due_date: '',
        create: true
      }
      this.listData.splice(row_index, 0, issueForm)
    },
    handleCellClick(row, column) {
      this.$set(row, 'originColumn', cloneDeep(row[column.property]))
      this.$set(row, 'editColumn', column.property)
    },
    handleResetEdit({ value, row }) {
      this.$set(row, value, row.originColumn)
      this.$set(row, 'editColumn', false)
      this.$set(row, 'originColumn', null)
    },
    handleResetCreate({ row, index }) {
      this.listData.splice(index, 1)
      this.$set(row, 'create', false)
    },
    async loadAssignedToList() {
      const res = await getProjectAssignable(this.selectedProjectId)
      this.assigned_to = [
        {
          name: this.$t('Issue.me'),
          login: '-Me-',
          id: this.userId,
          class: 'bg-yellow-100'
        }, ...res.data.user_list
      ]
    },
    async loadVersionList(status) {
      let params = { status: 'open,locked' }
      if (status) {
        params = { status: 'open,locked,closed' }
      }
      const versionList = await getProjectVersion(this.selectedProjectId, params)
      this.fixed_version = [{ name: this.$t('Issue.VersionUndecided'), id: 'null' }, ...versionList.data.versions]
    },
    async handleUpdateIssue({ value, row, index, treeNode }) {
      console.log(index, treeNode)
      let checkUpdate = false
      if (typeof row.originColumn === 'object' && row.originColumn instanceof Date) {
        checkUpdate = value[`${row.editColumn}_id`] !== row.originColumn.id
      } else {
        checkUpdate = value[row.editColumn] !== row.originColumn
      }
      if (row.name.length <= 0) {
        return
      }
      if (checkUpdate) {
        this.$emit('update-loading', true)
        try {
          const res = await updateIssue(row.id, value)
          this.$set(row, 'editColumn', false)
          this.$set(row, 'originColumn', null)
          if (row.parent_object) {
            console.log(row.parent_object)
            const findIssueIndex = row.parent_object.children.findIndex(item => item.id === row.id)
            this.$set(row.parent_object.children, findIssueIndex, res.data)
          } else {
            this.$set(this.listData, index, res.data)
          }
          this.$emit('update-status', {
            time: res.datetime
          })
          this.$notify({
            title: this.$t('general.Success').toString(),
            type: 'success',
            message: this.$t('Notify.Updated').toString()
          })
        } catch (e) {
          this.$emit('update-status', {
            error: e
          })
          this.$notify({ title: this.$t('general.Error').toString(), type: 'error', message: e })
        }
        this.$emit('update-loading', false)
      } else {
        console.log('same')
        this.handleResetEdit({ value, row })
        this.$notify({ title: this.$t('general.Cancel').toString(), type: 'warning', message: this.$t('Notify.Same').toString() })
      }
    },
    async handleCreateIssue({ row }) {
      if (row.name.length <= 0) {
        return
      }
      const data = {}
      Object.keys(row).forEach(item => {
        if (row[item] && typeof row[item] === 'object') {
          console.log(row[item], item)
          data[`${item}_id`] = (row[item]['id']) ? row[item]['id'] : row[item]
        } else {
          data[item] = row[item]
        }
      })
      this.$emit('update-loading', true)
      try {
        let res = await addIssue(data)
        this.$set(row, 'create', false)
        this.$set(row, 'editColumn', false)
        res = res.data
        Object.keys(res).forEach(item => {
          this.$set(row, item, res[item])
        })
        this.$emit('update-status', {
          time: res.datetime
        })
        this.$notify({
          title: this.$t('general.Success').toString(),
          type: 'success',
          message: this.$t('Notify.Added').toString()
        })
      } catch (e) {
        this.$emit('update-status', {
          error: e
        })
        this.$notify({ title: this.$t('general.Error').toString(), type: 'error', message: e })
      }
      this.$emit('update-loading', false)
    },
    async getIssueFamilyData(row, treeNode, resolve) {
      try {
        const family = await getIssueFamily(row.id)
        const data = family.data
        // if (data.hasOwnProperty('parent')) {
        //   await this.$set(row, 'parent', data.parent)
        // }
        if (data.hasOwnProperty('children')) {
          // await this.$set(row, 'children', data.children)
          resolve(data.children.map(item => ({ parent_object: { ...row, children: data.children }, ...item })))
        }
        // if (data.hasOwnProperty('relations')) {
        //   await this.$set(row, 'relations', data.relations)
        // }
      } catch (e) {
        //   null
        return Promise.resolve()
      }
      return Promise.resolve()
    }
  }
}
</script>

<style lang="scss" scoped>
.add-issue-inline {
  @apply pl-5;
}

#wrapper {
  height: calc(100vh - 50px - 20px - 50px - 50px - 50px - 40px);
}

.table-css {
  height: 100% !important;

  > > > table {
    td {
      padding: 5px;
    }
  }
}
</style>
