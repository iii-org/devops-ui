<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container">
    <el-row>
      <el-col :md="24" :lg="14">
        <project-list-selector />
        <el-select
          v-if="kanbanFilterDimension !== 'fixed_version'"
          :value="kanbanVersionValue"
          :placeholder="$t('Version.SelectVersion')"
          :disabled="selectedProjectId === -1"
          class="mr-4"
          filterable
          @change="updateVersionValue"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalVersion')" :value="'-1'" />
          <el-option v-for="item in fixed_version" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select
          v-if="kanbanFilterDimension !== 'assigned_to'"
          :value="kanbanMemberValue"
          :placeholder="$t('Member.SelectMember')"
          :disabled="selectedProjectId === -1"
          filterable
          @change="updateMemberValue"
        >
          <el-option :key="-1" :label="$t('Dashboard.TotalMember')" :value="'-1'" />
          <!--          <el-option :key="-2" :label="$t('Dashboard.Unassigned')" value="" />-->
          <el-option
            v-for="item in assigned_to"
            :key="item.id"
            :label="`${item.name}(${item.login})`"
            :value="item.id"
          />
        </el-select>
      </el-col>
      <el-col :md="24" :lg="10" class="text-right">
        <el-form inline>
          <el-form-item :label="$t('Issue.FilterDimensions.label')">
            <el-select :value="kanbanFilterDimension" class="mr-4" filterable @change="setKanbanFilterDimension">
              <el-option
                v-for="(item, idx) in filterDimensionOptions"
                :key="idx"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-select-all
            ref="filterValue"
            :value="kanbanFilterValue"
            filterable
            multiple
            collapse-tags
            :options="filterValueOptions"
            value-key="id"
            @change="setKanbanFilterValue"
          />
        </el-form>
      </el-col>
    </el-row>
    <el-divider />
    <el-col class="board">
      <Kanban
        v-for="(classObj, idx) in filterValueOnBoard"
        :key="idx"
        :status="status"
        :board-object="classObj"
        :list="classifyIssueList[classObj.id]"
        :dimension="kanbanFilterDimension"
        :relative-list="relativeIssueList"
        :group="group"
        class="kanban"
        :header-text="getTranslateHeader(classObj.name)"
        :c-name="classObj.name"
        :class="{ [classObj.name.toLowerCase()]: true }"
        :focus-version="String(kanbanVersionValue)"
        @update="updateIssueStatus"
        @update-board="updateIssueBoard"
        @update-drag="quickUpdateIssue"
      />
      <right-panel ref="rightPanel" :click-not-close="true">
        <el-row v-for="(item, idx) in filterDimensionOptions" :key="idx" class="panel">
          <el-card>
            <template slot="header">{{ item.label }}</template>
            <template v-for="(subItem, index) in getFilterValueList(item.value)">
              <div
                v-if="subItem.status !== 'closed'"
                :id="index"
                :key="index"
                draggable="true"
                class="item"
                @dragstart="dragStart($event, { [item.value]: subItem })"
                @dragend="dragEnd"
              >
                <el-tag effect="dark" :type="getTagType(subItem.name)">
                  {{ $te(`Issue.${subItem.name}`) ? $t(`Issue.${subItem.name}`) : subItem.name }}
                </el-tag>
                <el-alert class="help_text" :closable="false">
                  拖曳到議題，可以將 {{ item.label }} 改變成
                  {{ $te(`Issue.${subItem.name}`) ? $t(`Issue.${subItem.name}`) : subItem.name }}
                </el-alert>
              </div>
            </template>
          </el-card>
        </el-row>
      </right-panel>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Fuse from 'fuse.js'
import { Kanban } from './components'
import ProjectListSelector from '@/components/ProjectListSelector'
import { getIssueStatus, getIssueTracker, updateIssue } from '@/api/issue'
import { getProjectIssueListByTree, getProjectVersion } from '@/api/projects'
import ElSelectAll from '@/components/ElSelectAll'
import RightPanel from './components/RightPanel'
import i18n from '@/lang'

export default {
  name: 'IssueBoards',
  components: {
    RightPanel,
    ElSelectAll,
    Kanban,
    ProjectListSelector
  },
  data() {
    return {
      isLoading: true,
      filterDimension: 'status',
      filterValue: [],
      projectIssueList: [],
      classifyIssueList: {},
      group: 'mission',
      fixed_version: [],
      status: [],
      tracker: [],
      assigned_to: [],
      relativeIssueList: []
    }
  },
  computed: {
    ...mapGetters([
      'selectedProjectId',
      'kanbanVersionValue',
      'kanbanMemberValue',
      'kanbanFilterDimension',
      'kanbanFilterValue'
    ]),
    filterDimensionOptions() {
      return [
        { label: i18n.t('Issue.FilterDimensions.status'), value: 'status' },
        { label: i18n.t('Issue.FilterDimensions.tracker'), value: 'tracker' },
        { label: i18n.t('Issue.FilterDimensions.assigned_to'), value: 'assigned_to' },
        { label: i18n.t('Issue.FilterDimensions.fixed_version'), value: 'fixed_version' }
      ]
    },
    filterValueOptions() {
      return this[this.kanbanFilterDimension].map((item, idx) => ({
        id: idx,
        label: item.name,
        value: item
      }))
    },
    filterValueOnBoard() {
      if (this.kanbanFilterValue.length <= 0) {
        return this[this.kanbanFilterDimension].map(item => item)
      }
      return this.kanbanFilterValue
    }
  },
  watch: {
    selectedProjectId() {
      this.fetchData()
    },
    kanbanVersionValue() {
      this.resetClassifyIssue()
      this.classifyIssue()
      this.updateData()
    },
    kanbanMemberValue(value) {
      console.log('member', value)
      this.resetClassifyIssue()
      this.classifyIssue()
      this.updateData()
    },
    kanbanFilterDimension: {
      async handler() {
        this.$refs['filterValue'].selected = []
        await this.resetClassifyIssue()
        await this.classifyIssue()
        await this.updateData()
      }
    },
    kanbanFilterValue: {
      immediate: true,
      deep: true,
      async handler() {
        await this.resetClassifyIssue()
        await this.classifyIssue()
        await this.updateData()
      }
    }
  },
  async created() {
    const issueStatusRes = await getIssueStatus()
    this.status = issueStatusRes.data
    const issueTrackerRes = await getIssueTracker()
    this.tracker = issueTrackerRes.data
    await this.fetchData()
  },
  methods: {
    ...mapActions('projects', [
      'getProjectUserList',
      'setKanbanMemberValue',
      'setKanbanVersionValue',
      'setKanbanFilterDimension',
      'setKanbanFilterValue'
    ]),
    async fetchData() {
      this.isLoading = true
      await this.resetClassifyIssue()
      const projectIssueListRes = await getProjectIssueListByTree(this.selectedProjectId)

      const versionsRes = await getProjectVersion(this.selectedProjectId)
      this.fixed_version = [{ name: '版本未定', id: '' }, ...versionsRes.data.versions]

      const userRes = await this.getProjectUserList(this.selectedProjectId)
      this.assigned_to = [{ name: this.$t('Dashboard.Unassigned'), id: '' }, ...userRes.data.user_list]
      this.isLoading = false
      this.projectIssueList = this.createRelativeList(projectIssueListRes.data) // 取得project全部issue by status
      await this.classifyIssue()
      await this.updateData()
    },
    checkInFilterValue(value) {
      if (this.kanbanFilterValue.length <= 0) return true
      return this.kanbanFilterValue.filter(item => item.id === value)
    },
    classifyIssue() {
      let issueList = this.projectIssueList
      if (this.kanbanFilterDimension !== 'status') {
        issueList = this.projectIssueList.filter(issue => issue.status.id !== 6)
      }
      issueList.forEach(issue => {
        let dimensionName = issue[this.kanbanFilterDimension].id
        if (!dimensionName) {
          dimensionName = ''
        }
        if (this.checkInFilterValue(dimensionName)) {
          if (!this.classifyIssueList.hasOwnProperty(dimensionName)) {
            this.classifyIssueList[dimensionName] = []
          }
          this.classifyIssueList[dimensionName].push(issue)
        }
      })
    },
    resetClassifyIssue() {
      this.classifyIssueList = {}
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    searchKanbanCard(value, opt) {
      Object.keys(this.classifyIssueList).forEach(item => {
        if (value === '') {
          this.classifyIssueList[item] = this.classifyIssueList[item].filter(subItem => {
            const findKey = opt['keys'][0].split('.')
            const findName = findKey.reduce((total, current) => total[current], subItem)
            return findName === undefined || findKey[0] === ''
          })
        } else {
          const fuse = new Fuse(this.classifyIssueList[item], opt)
          const res = fuse.search(`="${value}"`)
          this.classifyIssueList[item] = res.map(items => items.item)
        }
      })
    },
    async updateIssueBoard() {
      await this.fetchData()
      await this.updateData()
    },
    async updateIssueStatus(evt) {
      if (evt.event.hasOwnProperty('added')) {
        this.isLoading = true
        // const getUpdateDimension = this[this.kanbanFilterDimension].find((item) => ((evt.list === '') ? item.id === evt.list : item.name === evt.list))
        await updateIssue(evt.event.added.element.id, { [this.kanbanFilterDimension + '_id']: evt.boardObject.id })
        this.projectIssueList.forEach(item => {
          if (item.id === evt.event.added.element.id) {
            item[this.kanbanFilterDimension] = evt.boardObject
          }
        })
        await this.updateData()
        this.isLoading = false
      }
    },
    async quickUpdateIssue(event) {
      const { id, value } = event
      this.isLoading = true
      const filterDimension = Object.keys(value)[0]
      await updateIssue(id, { [filterDimension + '_id']: value[filterDimension].id })
      this.projectIssueList.forEach(item => {
        if (item.id === id) {
          item[filterDimension] = value[filterDimension]
        }
      })
      await this.updateData()
      this.isLoading = false
    },
    updateMemberValue(value) {
      this.setKanbanMemberValue(value)
      this.updateData()
    },
    updateVersionValue(value) {
      this.setKanbanVersionValue(value)
      this.updateData()
    },
    updateData() {
      this.resetClassifyIssue()
      this.classifyIssue()
      const versionOpt = {
        keys: ['fixed_version.id'],
        useExtendedSearch: true
      }
      const userOpt = {
        keys: ['assigned_to.id'],
        useExtendedSearch: true
      }
      if (this.kanbanVersionValue !== '-1' && this.kanbanFilterDimension !== 'fixed_version') {
        this.searchKanbanCard(this.kanbanVersionValue, versionOpt)
      }
      if (this.kanbanMemberValue !== '-1' && this.kanbanFilterDimension !== 'assigned_to') {
        this.searchKanbanCard(this.kanbanMemberValue, userOpt)
      }
    },
    createRelativeList(list) {
      const result = []

      function flatList(parent) {
        for (let i = 0; i < parent.length; i++) {
          result.push(parent[i])
          const children = parent[i].children
          if (parent[i].children.length) flatList(children)
        }
      }

      flatList(list)
      return result
    },
    dragStart(e, item) {
      e.effectAllowed = 'copy'
      e.target.classList.add('draggingObject')
      e.dataTransfer.setData('json', JSON.stringify(item))
      // console.log('dragStart')
      // console.log(e)
    },
    dragEnd(e) {
      e.target.classList.remove('draggingObject')
    },
    getFilterValueList(value) {
      return this[value]
    },
    getTagType(name) {
      switch (name) {
        case 'Active':
          return ''
        case 'Assigned':
          return 'danger'
        case 'Closed':
          return 'info'
        case 'Solved':
          return 'secondary'
        case 'InProgress':
          return 'warning'
        case 'Finished':
          return 'success'
        case 'Feature':
          return 'feature'
        case 'Bug':
          return 'bug'
        case 'Document':
          return 'document'
        case 'Research':
          return 'research'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.board {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  align-items: start;

  .kanban {
    >>> .parent {
      font-size: 0.75em;
      margin: 0;

      .el-tag {
        font-size: 0.5em;
      }

      .Active {
        background: $active;
      }

      .Assigned {
        background: $assigned;
      }

      .Solved {
        background: $solved;
      }

      >>> .inprogress {
        background: $inProgress;
      }

      .Finished {
        background: $finished;
      }

      .Closed {
        background: $closed;
      }
    }

    >>> &.active {
      .board-column-header {
        .header-bar {
          background: $active;
        }
      }
    }

    >>> &.assigned {
      .board-column-header {
        .header-bar {
          background: $assigned;
        }
      }
    }

    >>> &.solved {
      .board-column-header {
        .header-bar {
          background: $solved;
        }
      }
    }

    >>> &.inprogress {
      .board-column-header {
        .header-bar {
          background: $inProgress;
        }
      }
    }

    >>> &.finished {
      .board-column-header {
        .header-bar {
          background: $finished;
        }
      }
    }

    >>> &.closed {
      .board-column-header {
        .header-bar {
          background: $closed;
        }
      }
    }

    >>> &.feature {
      .board-column-header {
        .header-bar {
          background: $feature;
        }
      }
    }

    >>> &.bug {
      .board-column-header {
        .header-bar {
          background: $bug;
        }
      }
    }

    >>> &.document {
      .board-column-header {
        .header-bar {
          background: $document;
        }
      }
    }

    >>> &.research {
      .board-column-header {
        .header-bar {
          background: $research;
        }
      }
    }
  }
}

>>> .rightPanel-items {
  overflow-y: auto;
  height: 100%;

  .panel {
    padding: 30px 20px;

    .item {
      width: fit-content;
      cursor: move;

      .el-tag {
        font-size: 1.05em;
        margin: 3px;
      }

      .help_text {
        display: none;
      }
    }
  }
}

// For drag sources
.dragging {
  opacity: 0.25;
}

.draggingObject {
  width: 100%;

  .help_text {
    display: block !important;
    opacity: 1 !important;
  }
}

// For drop target
.hover {
  background-color: rgba(0, 191, 165, 0.04);
}

$tag-options: (
  secondary: $secondary,
  document: $document,
  research: $research,
  bug: $bug,
  feature: $feature
);

@each $key, $value in $tag-options {
  .el-tag--#{$key} {
    background-color: $value;
    border-color: $value;
  }
}
</style>
