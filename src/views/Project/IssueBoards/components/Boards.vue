<template>
  <section>
    <div
      class="board"
      :class="{'is-panel':relationIssue.visible}"
    >
      <Kanban
        v-for="classObj in groupByValueOnBoard"
        :id="'card' + classObj.id"
        :key="classObj.id"
        :board-object="classObj"
        :list="classifyIssueList[classObj.id]"
        :relative-list="relativeIssueList"
        :status="status"
        :group="group"
        :dimension="groupBy.dimension"
        :add-issue="saveIssue"
        :element-ids="elementIds"
        :project-id="projectId"
        @relationIssueId="onRelationIssueDialog($event, classObj.id)"
        @update="updateIssueStatus"
        @update-board="updateIssueBoard"
        @update-drag="quickUpdateIssue"
        @contextmenu="handleContextMenu"
      />
    </div>
    <transition name="slide-fade">
      <div v-if="relationIssue.visible" class="rightPanel">
        <div
          class="handle-button"
          :style="{'background-color':'#85c1e9'}"
          @click="handleRightPanelVisible"
        >
          <em class="el-icon-d-arrow-right" />
        </div>
        <ProjectIssueDetail
          ref="childrenDrawer"
          :props-issue-id="relationIssue.id"
          :is-in-dialog="true"
          :is-from-board="true"
          @popup="handleRelationIssueDialogBeforeClose"
          @delete="handleRelationDelete"
        />
      </div>
    </transition>
    <el-dialog
      :visible.sync="isProjectDetailPopUp"
      width="90%"
      top="3vh"
      append-to-body
      destroy-on-close
      :before-close="handleRelationIssueDialogBeforeClose"
    >
      <ProjectIssueDetail
        ref="children"
        :props-issue-id="relationIssue.id"
        :is-in-dialog="true"
        :is-from-board="false"
        @delete="handleRelationDelete"
      />
    </el-dialog>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update-row="getContextRow"
    />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssue, addIssue, updateIssue } from '@/api/issue'
import { Kanban } from '@/views/Project/IssueBoards/components'
import { ContextMenu } from '@/components/Issue'
import ProjectIssueDetail from '@/views/Project/IssueDetail/'

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
  components: { Kanban, ContextMenu, ProjectIssueDetail },
  props: {
    groupBy: {
      type: Object,
      default: () => ({
        dimension: 'status',
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
      default: () => ({})
    },
    relativeIssueList: {
      type: Array,
      default: () => []
    },
    classifyIssueList: {
      type: Object,
      default: () => ({})
    },
    projectIssueList: {
      type: Array,
      default: () => []
    },
    elementIds: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      group: 'mission',
      contextMenu: contextMenu,
      isProjectDetailPopUp: false,
      relationIssue: {
        visible: false,
        id: null
      }
    }
  },
  computed: {
    ...mapGetters(['tracker', 'status', 'priority']),
    groupByValueOnBoard() {
      if (this.groupBy.value.length <= 0) {
        return this.getStatusSort.map((item) => item)
      }
      return this.groupBy.dimension === 'assigned_to' ? this.filterMe(this.groupBy.value) : this.groupBy.value
    },
    getStatusSort() {
      const dimension = this[this.groupBy.dimension] || this.contextOptions[this.groupBy.dimension]
      let sort = this.groupBy.dimension === 'status' ? this.filterClosedStatus(dimension) : dimension
      sort = this.groupBy.dimension === 'assigned_to' ? this.filterMe(sort) : sort
      return sort
    }
  },
  methods: {
    loadData() {
      this.$emit('loadData')
    },
    filterMe(userList) {
      return userList.filter((item) => item.login !== '-Me-')
    },
    filterClosedStatus(statusList) {
      if (this.displayClosed) return statusList
      return statusList.filter((item) => item.is_closed === false)
    },
    updateIssueBoard() {
      this.loadData()
    },
    async saveIssue(data) {
      await addIssue(data)
        .then((res) => {
          // noinspection JSCheckFunctionSignatures
          // this.showSuccessMessage()
          this.addTopicDialogVisible = false
          this.$refs['quickAddIssue'].form.name = ''
          return res
        })
        .catch((error) => {
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
        // const getUpdateDimension = this[this.groupBy.dimension].find((item) => ((evt.list === '') ? item.id === evt.list : item.name === evt.list))
        try {
          const updatedData = { [`${this.groupBy.dimension}_id`]: evt.boardObject.id }
          const issueId = evt.event.added.element.id
          await this.updatedIssue(issueId, updatedData)
        } catch (e) {
          // error
        } finally {
          this.setProjectIssueList(evt)
          this.$emit('getRelativeList')
        }
      }
    },
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    },
    async updatedIssue(id, updatedData) {
      const formData = this.getFormData(updatedData)
      const res = await updateIssue(id, formData)
      await this.updateRelationIssue(this.projectIssueList, res.data)
    },
    setProjectIssueList(evt) {
      const idx = this.projectIssueList.findIndex((item) => item.id === evt.event.added.element.id)
      const issue = this.projectIssueList.find((item) => item.id === evt.event.added.element.id)
      issue[this.groupBy.dimension] = evt.boardObject
      this.$emit('updateIssueList', idx, issue)
    },
    updateRelationIssue(list, updatedIssue) {
      list.forEach((issue) => {
        if (issue.hasOwnProperty('parent') && issue.parent.id === updatedIssue.id) {
          this.$set(issue, 'parent', updatedIssue)
        }
        this.handleUpdatedIssue('children', updatedIssue)
        this.handleUpdatedIssue('relations', updatedIssue)
      })
    },
    handleUpdatedIssue(key, updatedIssue) {
      if (updatedIssue.hasOwnProperty(key)) this.setUpdatedIssue(key, updatedIssue)
    },
    setUpdatedIssue(key, updatedIssue) {
      const idx = updatedIssue[key].findIndex((item) => item.id === issue.id)
      const issue = updatedIssue[key].find((item) => item.id === issue.id)
      this.$set(issue[key], idx, issue)
    },
    async quickUpdateIssue(event) {
      const { id, params } = event
      this.$parent.isLoading = true
      const filterDimension = Object.keys(params)[0]
      const data = this.handleFilterArrayData(params)
      try {
        await this.updatedIssue(id, data)
      } catch (e) {
        // error
      } finally {
        const idx = this.projectIssueList.findIndex((item) => item.id === id)
        const issue = this.projectIssueList.find((item) => item.id === id)
        issue[filterDimension] = params[filterDimension]
        this.$emit('updateIssueList', idx, issue)
      }
      this.$parent.isLoading = false
    },
    handleFilterArrayData(value) {
      const filterDimension = Object.keys(value)[0]
      let data = { [`${filterDimension}_id`]: value[filterDimension].id }
      if (Array.isArray(value[filterDimension])) {
        data = { [filterDimension]: value[filterDimension].map((item) => item.id).join(',') }
      }
      return data
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
      const contextmenu = this.$refs.contextmenu.$refs.contextmenu
      this.$nextTick(() => {
        const contextmenuPosition = {
          top: eventY,
          left: eventX
        }
        const contextmenuWidth = contextmenu.$el.clientWidth
        const contextmenuHeight = contextmenu.$el.clientHeight
        if (contextmenuWidth <= 50) {
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
        contextmenu.style = {
          top: `${this.contextMenu.top}px`,
          left: `${this.contextMenu.left}px`
        }
        document.addEventListener('click', this.hideContextMenu)
      })
    },
    async getContextRow(issueId) {
      const issue = await getIssue(issueId)
      this.$nextTick(() => {
        this.contextMenu.row = issue.data
      })
    },
    hideContextMenu() {
      this.contextMenu.visible = false
      document.removeEventListener('click', this.hideContextMenu)
    },
    onRelationIssueDialog(id, element) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
      setTimeout(() => this.scrollTo(element), 100)
    },
    handleRelationDelete() {
      this.$set(this.relationIssue, 'visible', false)
      this.$set(this.relationIssue, 'id', null)
      this.isProjectDetailPopUp = false
    },
    handleRightPanelVisible() {
      this.$set(this.relationIssue, 'visible', false)
    },
    scrollTo(target) {
      const element = document.getElementById('card' + target)
      this.$nextTick(() => {
        element.scrollIntoView({ behavior: 'smooth' })
      })
    },
    handlePopConfirm(done) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          done()
        })
    },
    handleRelationIssueDialogBeforeClose(done) {
      const ref = done ? 'children' : 'childrenDrawer'
      if (!done) {
        done = () => {
          this.relationIssue.visible = false
          this.isProjectDetailPopUp = true
        }
      }
      if (this.$refs[ref].hasUnsavedChanges()) {
        this.handlePopConfirm(done)
      } else {
        done()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.board {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  height: calc(100vh - 70px - 40px - 24px - 25px - 10px);
  overflow-x: auto;
  transition: width 1s;

  &.is-panel {
    width: calc(100% - 750px);
    transition: width 1s;
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

.rightPanel {
  width: 100%;
  max-width: 750px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  background: #fff;
}

.slide-fade-enter-active {
  transition: all .5s ease-in-out;

}
.slide-fade-leave-active {
  transition: all .5s ease-in-out;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(800px);
}

.handle-button {
  width: 35px;
  height: 50px;
  position: absolute;
  left: -35px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 1;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 50px;
  background-color:'#85c1e9'
  i {
    font-size: 24px;
    line-height: 50px;
  }
}
</style>
