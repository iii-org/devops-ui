<template>
  <section>
    <div class="board" :class="{'is-panel':rightPanelVisible}">
      <Kanban
        v-for="classObj in groupByValueOnBoard"
        :key="classObj.id"
        :board-object="classObj"
        :list="classifyIssueList[classObj.id]"
        :relative-list="relativeIssueList"
        :status="status"
        :group="group"
        :dimension="groupBy.dimension"
        :add-issue="saveIssue"
        @update="updateIssueStatus"
        @update-board="updateIssueBoard"
        @update-drag="quickUpdateIssue"
        @contextmenu="handleContextMenu"
      />
    </div>
    <RightPanel ref="rightPanel" :click-not-close="true" @visible="handleRightPanelVisible">
      <template v-for="item in filterOptions">
        <el-row :key="item.id" class="panel">
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
                <component
                  :is="item.value"
                  v-if="isRightPanelItemHasComponents(item.value)" :name="subItem.name"
                  class="el-tag"
                />
                <el-tag v-else-if="item.value==='tags'" effect="plain">
                  {{ getTranslateHeader(subItem.name) }}
                </el-tag>
                <el-tag v-else effect="dark">
                  {{ getTranslateHeader(subItem.name) }}
                </el-tag>
                <el-alert class="help_text" :closable="false">
                  <i18n path="Issue.DragTip">
                    <b slot="key">{{ item.label }}</b>
                    <b slot="value">{{ getTranslateHeader(subItem.name) }}</b>
                  </i18n>
                </el-alert>
              </div>
            </template>
          </el-card>
        </el-row>
      </template>
    </RightPanel>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="loadData"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { addIssue, updateIssue } from '@/api/issue'
import { Kanban, RightPanel } from '@/views/Project/IssueBoards/components'
import ContextMenu from '@/components/Issue/ContextMenu'
import Status from '@/components/Issue/Status'
import Tracker from '@/components/Issue/Tracker'
import Priority from '@/components/Issue/Priority'

const contextMenu = {
  row: {
    fixed_version: { id: 'null' },
    assigned_to: { id: 'null' }
  },
  visible: false,
  left: 0,
  top: 0
}

export default {
  name: 'Boards',
  components: { Kanban, RightPanel, ContextMenu, Status, Tracker, Priority },
  props: {
    groupBy: {
      type: Object,
      default: () => ({
        dimention: 'status',
        value: []
      })
    },
    displayClosed: {
      type: Boolean,
      default: false
    },
    filterOptions: {
      type: Array,
      default: () => []
    },
    contextOptions: {
      type: Object,
      default: () => {}
    },
    relativeIssueList: {
      type: Array,
      default: () => []
    },
    classifyIssueList: {
      type: Object,
      default: () => {}
    },
    projectIssueList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      rightPanelVisible: false,
      group: 'mission',
      contextMenu: contextMenu
    }
  },
  computed: {
    ...mapGetters([
      'tracker',
      'status',
      'priority'
    ]),
    groupByValueOnBoard() {
      const dimension = this[this.groupBy.dimension] || this.contextOptions[this.groupBy.dimension]
      if (this.groupBy.value.length <= 0) {
        let value = this.groupBy.dimension === 'status' ? this.filterClosedStatus(dimension) : dimension
        value = this.groupBy.dimension === 'assigned_to' ? this.filterMe(value) : value
        return value.map(item => item)
      }
      return this.groupBy.dimension === 'assigned_to' ? this.filterMe(this.groupBy.value) : this.groupBy.value
    }
  },
  methods: {
    loadData() {
      this.$emit('loadData')
    },
    handleRightPanelVisible(value) {
      this.rightPanelVisible = value
    },
    filterMe(userList) {
      return userList.filter(item => item.login !== '-Me-')
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter(item => item.is_closed === false)
    },
    async updateIssueBoard() {
      await this.loadData()
    },
    async saveIssue(data) {
      return await addIssue(data)
        .then(res => {
          // noinspection JSCheckFunctionSignatures
          this.showSuccessMessage()
          this.loadData()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.name = ''
          return res
        })
        .catch(error => {
          return error
        })
    },
    showSuccessMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Added'),
        type: 'success'
      })
    },
    async updateIssueStatus(evt) {
      if (evt.event.hasOwnProperty('added')) {
        this.$parent.isLoading = true
        // const getUpdateDimension = this[this.groupBy.dimension].find((item) => ((evt.list === '') ? item.id === evt.list : item.name === evt.list))
        try {
          const updatedData = { [`${this.groupBy.dimension}_id`]: evt.boardObject.id }
          const issueId = evt.event.added.element.id
          const res = await updateIssue(issueId, updatedData)
          await this.updateRelationIssue(this.projectIssueList, res.data)
          this.setProjectIssueList(evt)
        } catch (e) {
          // error
        }
        this.$parent.isLoading = false
        await this.getRelativeList()
      }
    },
    setProjectIssueList(evt) {
      const idx = this.projectIssueList.findIndex(item => item.id === evt.event.added.element.id)
      const issue = this.projectIssueList.find(item => item.id === evt.event.added.element.id)
      issue[this.groupBy.dimension] = evt.boardObject
      this.$emit('updateIssueList', idx, issue)
    },
    updateRelationIssue(list, updatedIssue) {
      list.forEach((issue) => {
        if (issue.hasOwnProperty('parent') && issue.parent.id === updatedIssue.id) {
          this.$set(issue, 'parent', updatedIssue)
        }
        this.handleUpdatedIssue('children')
        this.handleUpdatedIssue('relations')
      })
    },
    handleUpdatedIssue(issue, key, updatedIssue) {
      if (issue.hasOwnProperty(key)) this.setUpdatedIssue(key, updatedIssue)
    },
    setUpdatedIssue(key, updatedIssue) {
      const idx = issue[key].findIndex(item => item.id === updatedIssue.id)
      const issue = issue[key].find(item => item.id === updatedIssue.id)
      this.$set(issue[key], idx, updatedIssue)
    },
    async quickUpdateIssue(event) {
      const { id, value } = event
      this.$parent.isLoading = true
      const filterDimension = Object.keys(value)[0]
      try {
        let data = { [filterDimension + '_id']: value[filterDimension].id }
        if (Array.isArray(value[filterDimension])) {
          data = { [filterDimension]: value[filterDimension].map(item => item.id).join(',') }
        }
        const res = await updateIssue(id, data)
        await this.updateRelationIssue(this.projectIssueList, res.data)
        const idx = this.projectIssueList.findIndex(item => item.id === id)
        const issue = this.projectIssueList.find(item => item.id === id)
        issue[filterDimension] = value[filterDimension]
        this.$emit('updateIssueList', idx, issue)
      } catch (e) {
        // error
      }
      this.$parent.isLoading = false
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    dragStart(e, item) {
      e.effectAllowed = 'copy'
      e.target.classList.add('draggingObject')
      e.dataTransfer.setData('json', JSON.stringify(item))
    },
    dragEnd(e) {
      e.target.classList.remove('draggingObject')
    },
    getFilterValueList(value) {
      return this[value] || this.contextOptions[value]
    },
    isRightPanelItemHasComponents(name) {
      return ['status', 'tracker'].includes(name)
    },
    handleContextMenu({ row, column, event }) {
      event.preventDefault()
      const eventX = event.pageX
      const eventY = event.pageY
      this.$refs.contextmenu.$refs.contextmenu.show()
      this.$nextTick(() => {
        const contextmenuPosition = {
          top: eventY,
          left: eventX
        }
        const contextmenuWidth = this.$refs.contextmenu.$refs.contextmenu.$el.clientWidth
        const contextmenuHeight = this.$refs.contextmenu.$refs.contextmenu.$el.clientHeight
        if (contextmenuWidth <= 50 && contextmenuWidth <= 50) {
          this.handleContextMenu({ row, column, event })
        }
        if (contextmenuHeight + eventY >= window.innerHeight) {
          contextmenuPosition.top -= contextmenuHeight
        }
        if (contextmenuWidth + eventX >= window.innerWidth) {
          contextmenuPosition.left -= contextmenuWidth
        }
        this.contextMenu.top = contextmenuPosition.top
        this.contextMenu.left = contextmenuPosition.left
        this.contextMenu.row = row
        this.contextMenu.visible = true
        this.$refs.contextmenu.$refs.contextmenu.style = {
          top: this.contextMenu.top + 'px',
          left: this.contextMenu.left + 'px'
        }
        document.addEventListener('click', this.hideContextMenu)
      })
    },
    hideContextMenu() {
      this.contextMenu.visible = false
      document.removeEventListener('click', this.hideContextMenu)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.board {
  display: flex;
  justify-content: start;
  flex-wrap: nowrap;
  height: calc(100vh - 70px - 40px - 40px - 25px - 10px);
  overflow-x: auto;

  &.is-panel {
    width: calc(100% - 260px);
  }
}

> > > .rightPanel-items {
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