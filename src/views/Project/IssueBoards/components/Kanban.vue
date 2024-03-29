<template>
  <div
    class="board-column"
    :style="fromWbs ? 'background: transparent' : ''"
    :class="getHeaderBarClassName(boardObject.name)"
  >
    <div class="board-column-header" :style="!fromWbs ? '': 'height: 10px'">
      <div class="header-bar" />
      <el-row v-if="!fromWbs" class="flex">
        <el-col class="text-center">
          {{ getTranslateHeader(boardObject.name) }} <strong>({{ list.length }})</strong>
        </el-col>
      </el-row>
    </div>
    <Draggable
      :list="list"
      v-bind="$attrs"
      class="board-column-content"
      :style="fromWbs ? 'border: 1px solid transparent' : ''"
      :class="boardObject.name"
      :move="canIssueMoved"
      :draggable="'.item'"
      @change="end(boardObject, $event)"
    >
      <div
        v-for="(element, idx) in list"
        :id="element.id"
        :key="element.id"
        :ref="element.id"
        class="board-item item"
        @drop="dropPanelLabels($event, idx, element.id)"
        @dragover="allowDrop($event, idx)"
      >
        <div
          v-if="element.done_ratio > 0"
          class="progress-bar"
          :class="getStatus(element)"
          :style="{width: `${element.done_ratio}%`}"
        />
        <div @contextmenu="handleContextMenu(element, '', $event)">
          <div class="title" :class="fromWbs ? 'cardTitle' : ''">
            <span
              class="text linkTextColor"
              :class="fromWbs ? 'msg-text' : ''"
              @click="handleClick(element.id)"
            >
              <el-tooltip
                v-if="fromWbs"
                placement="bottom-start"
                :open-delay="100"
                :content="element.name"
              >
                <span>
                  {{ element.name }}
                </span>
              </el-tooltip>
              <span v-else>
                {{ element.name }}
              </span>
              <el-tag
                v-for="item in element.tags"
                :key="item.id"
                effect="plain"
                size="mini"
                class="tags"
              >
                {{ item.name }}
              </el-tag>
            </span>
            <div class="action">
              <div
                class="icon"
                @click.stop="handleContextMenu(element, '', $event)"
              >
                <em class="el-icon-more" />
              </div>
            </div>
          </div>
          <div class="issue-status-tags">
            <span v-if="dimension !== 'status'">
              <Status
                v-if="element.status.name"
                :name="$t(`Issue.${element.status.name}`)"
                :type="element.status.name"
                size="mini"
                class="status"
              />
            </span>
            <span v-if="dimension !== 'priority'">
              <Priority
                v-if="element.priority.name"
                :name="$t(`Issue.${element.priority.name}`)"
                :type="element.priority.name"
                size="mini"
                class="priority"
              />
            </span>
            <span v-if="dimension !== 'tracker'">
              <Tracker
                :name="$t(`Issue.${element.tracker.name}`)"
                :type="element.tracker.name"
                class="tracker"
                :style="
                  fromWbs ?
                    'max-width: 80px; display: inline-block;'
                    : ''
                "
              />
            </span>
            <span v-if="element.done_ratio > 0 && !fromWbs">
              <el-tag
                :type="getStatus(element)"
                size="mini"
                effect="dark"
              >
                {{ element.done_ratio }}%
              </el-tag>
            </span>
            <el-tooltip
              v-if="Object.keys(element.assigned_to).length > 0"
              :content="element.assigned_to.login"
              placement="right-start"
              :disabled="!element.assigned_to.login"
            >
              <span v-if="fromWbs" style="float:right;">
                <span class="detail user">
                  <em class="el-icon-user-solid" />
                  <span
                    class="text"
                    style="
                      font-size: 14px;
                      max-width: 70px;
                      display: inline-block;
                    "
                  >
                    {{ element.assigned_to.name }}
                  </span>
                </span>
              </span>
            </el-tooltip>
          </div>
        </div>
        <div
          v-if="element.family"
          class="relation"
        >
          <el-collapse
            v-model="element.show"
            @change="onCollapseChange(element)"
          >
            <el-collapse-item name="relation">
              <template #title>
                <em class="el-icon-caret-right" /> {{ $t('Issue.RelatedIssue') }} {{ element | lengthFilter }}
              </template>
              <div
                v-if="element.family"
                class="parent"
              >
                <div
                  v-if="element.hasOwnProperty('parent')"
                  @contextmenu="handleContextMenu(element.parent, '', $event)"
                >
                  <strong>{{ $t('Issue.ParentIssue') }}：</strong>
                  <Status
                    :name="$t(`Issue.${element.parent.status.name}`)"
                    :type="element.parent.status.name"
                    size="mini"
                  />
                  <el-link
                    class="linkTextColor"
                    :underline="false"
                    @click="handleClick(element.parent.id)"
                  >
                    {{ element.parent.name }}
                    <el-tag
                      v-for="item in element.parent.tags"
                      :key="item.id"
                      effect="plain"
                      size="mini"
                      class="tags"
                    >
                      {{ item.name }}
                    </el-tag>
                  </el-link>
                </div>
                <div v-if="element.hasOwnProperty('children') && element.children.length > 0">
                  <strong>{{ $t('Issue.ChildrenIssue') }}：</strong>
                  <ol class="children_list">
                    <li
                      v-for="(subElement, index) in element.children"
                      :key="index"
                      @contextmenu="handleContextMenu(subElement, '', $event)"
                    >
                      <Status
                        :name="$t(`Issue.${subElement.status.name}`)"
                        :type="subElement.status.name"
                        size="mini"
                      />
                      <el-link
                        class="linkTextColor"
                        :underline="false"
                        @click="handleClick(subElement.id)"
                      >
                        {{ subElement.name }}
                        <el-tag
                          v-for="item in subElement.tags"
                          :key="item.id"
                          effect="plain"
                          size="mini"
                          class="tags"
                        >
                          {{ item.name }}
                        </el-tag>
                      </el-link>
                    </li>
                  </ol>
                </div>
                <div v-if="element.hasOwnProperty('relations') && element.relations.length > 0">
                  <strong>{{ $t('Issue.RelatedIssue') }}：</strong>
                  <ol class="children_list">
                    <li
                      v-for="(subElement, index) in element.relations"
                      :key="index"
                      @contextmenu="handleContextMenu(subElement, '', $event)"
                    >
                      <Status
                        :name="$t(`Issue.${subElement.status.name}`)"
                        :type="subElement.status.name"
                        size="mini"
                      />
                      <el-link
                        class="linkTextColor"
                        :underline="false"
                        @click="handleClick(subElement.id)"
                      >
                        {{ subElement.name }}
                        <el-tag
                          v-for="item in subElement.tags"
                          :key="item.id"
                          effect="plain"
                          size="mini"
                          class="tags"
                        >
                          {{ item.name }}
                        </el-tag>
                      </el-link>
                    </li>
                  </ol>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div
          v-if="element.due_date || Object.keys(element.assigned_to).length > 0 && !fromWbs"
          class="info"
        >
          <div
            v-if="element.due_date"
            class="detail due_date"
            :class="getStatus(element)"
          >
            <em class="el-icon-date" />
            <div
              class="text"
              :class="getStatus(element)"
            >{{ element.due_date }}</div>
          </div>
          <div
            v-else
            class="detail due_date"
          >
            <em class="el-icon-date" />
          </div>
          <el-tooltip
            v-if="Object.keys(element.assigned_to).length > 0"
            :content="element.assigned_to.login"
            placement="right-start"
            :disabled="!element.assigned_to.login"
          >
            <div class="detail user">
              <em class="el-icon-user-solid" />
              <div class="text">{{ element.assigned_to.name }}</div>
            </div>
          </el-tooltip>
          <div
            v-else
            class="detail user"
          >
            <em class="el-icon-user-solid" />
          </div>
        </div>
        <div
          v-else
          class="no-info"
        />
      </div>
      <div v-if="!fromWbs" slot="header">
        <div
          :class="selectedProjectId === -1 ? 'board-item-ban' : 'board-item'"
          class="title board-item select-none"
          @click="showDialog = !showDialog"
        >
          <em
            class="el-icon-plus ml-4 mr-5 add-button"
            :class="{ rotate: showDialog }"
          /> {{ $t('Issue.AddIssue') }}
        </div>
        <transition name="slide-down">
          <QuickAddIssueOnBoard
            v-if="showDialog"
            class="board-item quick-add"
            :project-id="projectId"
            :save-data="addIssue"
            :board-object="boardObject"
            @after-add="showDialog = !showDialog"
          />
        </transition>
      </div>
    </Draggable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssueFamily } from '@/api/issue'
import Draggable from 'vuedraggable'
import { Priority, Tracker, Status } from '@/components/Issue'
import QuickAddIssueOnBoard from './QuickAddIssueOnBoard'

export default {
  name: 'Kanban',
  components: {
    QuickAddIssueOnBoard,
    Tracker,
    Priority,
    Status,
    Draggable
  },
  filters: {
    lengthFilter(value) {
      if (!value.hasOwnProperty('parent') && !value.hasOwnProperty('children') && !value.hasOwnProperty('relations')) {
        return null
      }
      const parent = value.hasOwnProperty('parent') ? 1 : 0
      const children = value.hasOwnProperty('children') ? value.children.length : 0
      const relations = value.hasOwnProperty('relations') ? value.relations.length : 0
      const total = parent + children + relations
      return `(${total})`
    }
  },
  props: {
    dimension: {
      type: String,
      default: null
    },
    boardObject: {
      type: Object,
      default: () => ({})
    },
    list: {
      type: Array,
      default: () => []
    },
    relativeList: {
      type: Array,
      default: () => []
    },
    status: {
      type: Array,
      default: () => []
    },
    addIssue: {
      type: Function,
      default: () => ({})
    },
    elementIds: {
      type: Array,
      default: () => []
    },
    fromWbs: {
      type: Boolean,
      default: false
    },
    fixedVersion: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: Number,
      default: null
    }
  },
  data() {
    this.unassignedError = {
      title: this.$t('Kanban.unassignedErrorTitle'),
      content: this.$t('Kanban.unassignedErrorContent')
    }
    this.assignedError = {
      title: this.$t('Kanban.assignedErrorTitle'),
      content: this.$t('Kanban.assignedErrorContent')
    }
    this.childrenStatusError = {
      title: this.$t('Kanban.childrenStatusErrorTitle'),
      content: this.$t('Kanban.childrenStatusErrorContent')
    }
    this.priorityError = {
      title: this.$t('Kanban.priorityErrorTitle'),
      content: this.$t('Kanban.priorityErrorContent')
    }
    this.trackerError = {
      title: this.$t('Kanban.trackerErrorTitle'),
      content: this.$t('Kanban.trackerErrorContent')
    }
    this.closedVersionError = {
      title: this.$t('Kanban.closedVersionErrorTitle'),
      content: this.$t('Kanban.closedVersionErrorContent')
    }
    return {
      showDialog: false,
      showAlert: false,
      errorMsg: [],
      timeoutId: -1,
      timeoutIdx: -1,
      toClosedVersionError: {}
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'forceTracker', 'enableForceTracker']),
    getHeaderBarClassName() {
      return function (name) {
        return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      }
    },
    differentInDays() {
      return function (a, b) {
        const day = 1000 * 3600 * 24
        const Difference_In_Time = a.getTime() - b.getTime()
        return Difference_In_Time / day
      }
    },
    getPanelLabelParams() {
      return function (data, element) {
        const key = Object.keys(data)[0]
        const value = Object.values(data)[0]
        let params = { [key]: value }
        if (key === 'tags') params = this.getPanelLabelParamsByTags(element, key, value)
        return params
      }
    },
    getPanelLabelParamsByTags() {
      return function (element, key, value) {
        const result = element.tags
        const findTagIndex = element.tags.findIndex((item) => item.id === value.id)
        findTagIndex >= 0 ? result.splice(findTagIndex, 1) : result.push(value)
        return { [key]: result }
      }
    },
    checkChildrenIssuesClosed() {
      return function (element) {
        const checkedIssue = this.relativeList.length > 0 ? this.findCompleteIssues(element) : element
        if (!checkedIssue.children || checkedIssue.children.length === 0) return true
        return checkedIssue.children
          .map((issue) => issue.is_closed === true)
          .reduce((issue_status, all) => issue_status && all)
      }
    },
    findCompleteIssues() {
      return function (element) {
        return this.relativeList.find((list) => list.id === element.id)
      }
    }
  },
  watch: {
    async elementIds() {
      this.$nextTick(() => {
        this.updateAnimation()
      })
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.timeoutId)
    window.clearTimeout(this.timeoutIdx)
  },
  methods: {
    /**
     * issues can be dragged to another status if returning true to property "move", while returning false can't
     * check if dragged issue can be moved to another issue status
     * three items to check:
     *  1. if the issue is assigned - isAssigned()
     *  2. if the children issues of dragged issue are closed - isChildrenIssuesClosed()
     *  3. the priority status of the issue - isPriorityUnchanged()
     * @Param {Object} evt - drag event
     */
    canIssueMoved(evt) {
      const toName = evt.to.classList[1]
      const fromName = evt.from.classList[1]
      const toClassObj = this.status.find((item) => item.name === toName)
      const fromClassObj = this.status.find((item) => item.name === fromName)
      return this.isIssueNormal(toClassObj, fromClassObj, evt)
    },
    isIssueNormal(toClassObj, fromClassObj, evt) {
      const element = evt.draggedContext.element
      switch (this.dimension) {
        case 'status':
          return this.isStatusNormal(toClassObj, fromClassObj, evt)
        case 'priority':
          return this.isPriorityNormal(element)
      }
    },
    isStatusNormal(toClassObj, fromClassObj, evt) {
      const element = evt.draggedContext.element
      const isAssigned = this.isAssigned(toClassObj, fromClassObj, element)
      const isChildrenIssuesClosed = toClassObj.is_closed === true ? this.isChildrenIssuesClosed(element) : true
      const isForceTracker = this.isTrackerStrict(element)
      const isVersionClosed = this.isClosedVersion(toClassObj, element, evt)
      if (this.errorMsg.length > 0) this.showErrorAlert(this.errorMsg)
      return isAssigned && isChildrenIssuesClosed && isForceTracker && isVersionClosed
    },
    isClosedVersion(toClassObj, element, evt) {
      const version_id = element.fixed_version.id
      const version = this.fixedVersion.find(issue => parseInt(version_id) === parseInt(issue.id))
      if (version) {
        if (version.status === 'closed') {
          const error = 'closedVersionError'
          this.handleErrorAlert(error)
          return false
        }
      }
      if (this.boardObject.hasOwnProperty('fixed_version_id')) {
        const version_board_id = evt.to.id.substring(
          evt.to.id.indexOf('_') + 1,
          evt.to.id.lastIndexOf('_')
        )
        const version_board = this.fixedVersion.find(issue => parseInt(version_board_id) === parseInt(issue.id))
        if (version_board) {
          if (version_board.status === 'closed') {
            const error = 'toClosedVersionError'
            this.handleErrorAlert(error, version_board)
            return false
          }
          return true
        }
      }
      return true
    },
    isPriorityNormal(element, value) {
      const isPriorityUnchanged = this.isPriorityUnchanged(element, value)
      if (this.errorMsg.length > 0) this.showErrorAlert(this.errorMsg)
      return isPriorityUnchanged
    },
    isAssigned(toClassObj, fromClassObj, element) {
      const isAssigned = this.checkAssigned(toClassObj, element)
      let isAllow = isAssigned
      if (toClassObj.id === fromClassObj.id) isAllow = true
      if (!isAllow) {
        const error = 'unassignedError'
        this.handleErrorAlert(error)
      }
      // else if (isAssigned && toClassObj.name === 'Active') {
      //   if (fromClassObj === null || fromClassObj.name !== 'Active') {
      //     const error = 'assignedError'
      //     this.handleErrorAlert(error)
      //     isAssigned = !isAssigned
      //   }
      // }
      return isAllow
    },
    isChildrenIssuesClosed(element) {
      const isChildrenIssuesClosed = this.checkChildrenIssuesClosed(element)
      if (!isChildrenIssuesClosed) {
        const error = 'childrenStatusError'
        this.handleErrorAlert(error)
      }
      return isChildrenIssuesClosed
    },
    isTrackerStrict(element) {
      if (this.enableForceTracker) {
        const hasForceTacker = this.forceTracker.find(x => x.id === element.tracker.id)
        if (hasForceTacker) {
          if (element.has_father) return true
          else {
            const error = 'trackerError'
            this.handleErrorAlert(error)
            return false
          }
        }
      }
      return true
    },
    isPriorityUnchanged(element) {
      const isPriorityUnchanged = this.checkPriority(element)
      if (!isPriorityUnchanged) {
        const error = 'priorityError'
        this.handleErrorAlert(error)
      }
      return isPriorityUnchanged
    },
    dropPanelLabels(e, idx, elementId) {
      e.preventDefault()
      if (e.dataTransfer.getData('json')) {
        const data = JSON.parse(e.dataTransfer.getData('json'))
        const element = this.list[idx]
        this.handleDropUpdate(data, element)
      }
    },
    handleDropUpdate(data, element) {
      const key = Object.keys(data)[0]
      const toClassObj = Object.values(data)[0]
      let params = { [key]: toClassObj }
      if (key === 'status') {
        const isStatusNormal = this.isStatusNormal(toClassObj, null, element)
        if (isStatusNormal) this.emitDragUpdate(element.id, params)
      } else if (key === 'priority') {
        const isPriorityNormal = this.isPriorityNormal(element, params)
        if (isPriorityNormal) this.emitDragUpdate(element.id, params)
      } else {
        params = this.getPanelLabelParams(data, element)
        this.emitDragUpdate(element.id, params)
      }
    },
    checkAssigned(to, element) {
      return !(Object.keys(element.assigned_to).length < 3 && to.id > 1)
    },
    handleErrorAlert(key, version) {
      if (version) {
        this.toClosedVersionError = {
          title: this.$t('Kanban.closedVersionErrorTitle'),
          content: this.$t('Kanban.toClosedVersionErrorContent', { fixed_version: version.name })
        }
      }
      const { title, content } = this[key]
      this.errorMsg.push(this.getErrorAlert(title, content))
    },
    getErrorAlert(title, content) {
      const h = this.$createElement
      return h('li', [h('b', title), h('p', content)])
    },
    checkPriority(element) {
      return !element.has_children
    },
    end(boardObject, event) {
      const updateData = { boardObject, event }
      this.$emit('update', updateData)
      this.$forceUpdate()
    },
    handleClick(id) {
      // this.$router.push({ name: 'IssueDetail', params: { issueId: id }})
      this.$emit('relationIssueId', id)
    },
    showErrorAlert(errorMsg) {
      const h = this.$createElement
      if (!this.showAlert) {
        this.showAlert = true
        this.$msgbox({ message: h('ul', errorMsg), title: this.$t('Kanban.ChangeIssueError') }).then(() => {
          this.showAlert = false
        })
      }
      this.errorMsg = []
    },
    emitDragUpdate(id, params) {
      const update = { id, params }
      this.$emit('update-drag', update)
    },
    allowDrop(e) {
      e.dataTransfer.dropEffect = 'copy'
      e.dataTransfer.clearData()
      e.preventDefault()
    },
    getStatus(element) {
      const dueDate = new Date(element.due_date)
      const today = new Date()
      const notClosed = element.status.name !== 'Closed'
      if (element.done_ratio === 100) {
        return 'success'
      } else if (notClosed && today > dueDate) {
        return 'danger'
      } else if (notClosed && this.differentInDays(dueDate, today) <= 3) {
        return 'warning'
      }
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    async onCollapseChange(element) {
      this.$set(element, 'loadingRelation', true)
      const family = await getIssueFamily(element.id)
      this.setRelativeIssue(element, family.data)
      this.$forceUpdate()
      this.$set(element, 'loadingRelation', false)
    },
    setRelativeIssue(element, data) {
      const relations = ['parent', 'children', 'relations']
      relations.forEach(async (relation) => {
        const hasOwnProperty = data.hasOwnProperty(relation)
        if (hasOwnProperty) await this.$set(element, relation, data[relation])
      })
    },
    handleContextMenu(row, context, event) {
      this.fromWbs ? this.$emit('contextmenu', row, context, event) : this.$emit('contextmenu', { row, context, event })
    },
    updateAnimation() {
      for (const elementId of this.elementIds) {
        setTimeout(() => {
          var element = document.getElementById(elementId)
          if (element) {
            this.scrollTo(element)
            const relation = element.getElementsByClassName('el-collapse-item__header')
            if (relation.length > 0) {
              relation[0].style.background = 'rgba(255,0,0,.2)'
              relation[0].style.transition = 'background 0.3s ease-in-out'
            }
            element.style.boxShadow = '0px 0px 10px 2px rgba(255,0,0,.2)'
            element.style.background = 'rgba(255,0,0,.2)'
            element.style.transition = 'box-shadow 0.3s ease-in-out'
            element.style.transition = 'background 0.3s ease-in-out'
            this.$nextTick(() => {
              window.setTimeout(() => {
                element.style.boxShadow = ''
                element.style.background = ''
                if (relation.length > 0) relation[0].style.background = ''
              }, 500)
            })
          }
        }, 100)
      }
    },
    scrollTo(element) {
      this.$nextTick(() => {
        element.parentNode.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.board-column {
  width: 280px;
  margin: 10px 5px 10px 5px;
  flex: 0 0 280px;
  padding-bottom: 20px;
  @apply overflow-hidden bg-white rounded-md border-solid border border-gray-300;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    @apply overflow-hidden;

    .header-bar {
      height: 3px;
      @apply bg-red-500;
    }
  }

  .board-column-content {
    border: 10px solid transparent;
    height: 95%;
    min-height: 130px;
    @apply overflow-x-hidden overflow-y-auto space-y-4;

    .quick-add {
      padding: 10px 10px 0 10px;
    }

    .board-item {
      cursor: pointer;
      width: 95%;
      height: auto;
      text-align: left;
      line-height: 20px;
      box-sizing: border-box;
      border: 1px solid #e9e9e9;
      @apply shadow-md bg-white rounded-md border-solid border border-gray-300 mx-auto;
      font-size: 14px;

      &-ban {
        pointer-events: none;
        opacity: 0.4;
      }

      .tags {
        @apply mr-1;
      }

      .add-button {
        transition: transform 0.6s;
        @apply m-3;
        &.rotate {
          transform: rotate(225deg);
        }
      }

      &.item {
        cursor: move;
      }

      .progress-bar {
        @apply bg-active rounded-full;
        height: 5px;

        &.success {
          @apply bg-success;
        }

        &.danger {
          @apply bg-danger;
        }

        &.warning {
          @apply bg-warning;
        }
      }

      .title {
        @apply m-3 flex justify-between content-start;

        .text {
          @apply cursor-pointer text-left text-primary font-bold break-all;
        }

        .action {
          @apply flex cursor-pointer w-5 h-5;
          .icon {
            @apply bg-gray-200 text-black rounded-md text-center align-middle px-1;
          }
        }
      }

      .relation {
        .parent {
          @apply m-3;
          font-size: 0.75em;

          .el-tag {
            font-size: 0.5em;
          }

          .Active {
            @apply bg-active;
          }

          .Assigned {
            @apply bg-assigned;
          }

          .Solved {
            @apply bg-solved;
          }

          .InProgress {
            @apply bg-inProgress;
          }

          .Verified {
            @apply bg-finished;
          }

          .Closed {
            @apply bg-closed;
          }
        }

        .children_list {
          margin: 0;
        }

        >>> .el-collapse-item {
          &__header {
            height: 2.5em;
          }

          &__content {
            padding-bottom: 0;
          }
        }
      }

      .issue-status-tags {
        font-size: 1em;
        @apply mx-3 mb-1;

        .tracker {
          font-size: 0.8em;
        }
      }

      .info {
        @apply flex border-0 border-t border-solid border-gray-200 divide-x divide-solid divide-gray-200 rounded-b-md;
        .detail {
          min-width: 0;
          font-size: 1em;
          line-height: 1em;
          padding: 0 3px;
          @apply ml-1 flex flex-1 py-2 border-0;
          .text {
            @apply truncate;
          }

          em {
            @apply mr-0.5 text-gray-400;
          }
        }

        .due_date {
          .danger {
            font-weight: 900;
            color: #f56c6c;
          }

          .warning {
            font-weight: 500;
            color: #d27e00;
          }
        }
      }

      .no-info {
        @apply mb-3;
      }
    }
  }

  &.active {
    .board-column-header {
      .header-bar {
        @apply bg-active;
      }
    }
  }

  &.assigned {
    .board-column-header {
      .header-bar {
        @apply bg-assigned;
      }
    }
  }

  &.solved {
    .board-column-header {
      .header-bar {
        @apply bg-solved;
      }
    }
  }

  &.inprogress {
    .board-column-header {
      .header-bar {
        @apply bg-inProgress;
      }
    }
  }

  &.verified {
    .board-column-header {
      .header-bar {
        @apply bg-finished;
      }
    }
  }

  &.closed {
    .board-column-header {
      .header-bar {
        @apply bg-closed;
      }
    }
  }

  &.document {
    .board-column-header {
      .header-bar {
        @apply bg-document;
      }
    }
  }

  &.research {
    .board-column-header {
      .header-bar {
        @apply bg-research;
      }
    }
  }

  &.epic {
    .board-column-header {
      .header-bar {
        @apply bg-epic;
      }
    }
  }

  &.audit {
    .board-column-header {
      .header-bar {
        @apply bg-audit;
      }
    }
  }

  &.feature {
    .board-column-header {
      .header-bar {
        @apply bg-feature;
      }
    }
  }

  &.bug {
    .board-column-header {
      .header-bar {
        @apply bg-bug;
      }
    }
  }

  &.issue {
    .board-column-header {
      .header-bar {
        @apply bg-issue;
      }
    }
  }

  &.changeRequest {
    .board-column-header {
      .header-bar {
        @apply bg-changeRequest;
      }
    }
  }

  &.risk {
    .board-column-header {
      .header-bar {
        @apply bg-risk;
      }
    }
  }

  &.testPlan {
    .board-column-header {
      .header-bar {
        @apply bg-testPlan;
      }
    }
  }

  &.failManagement {
    .board-column-header {
      .header-bar {
        @apply bg-failManagement;
      }
    }
  }
}
.cardTitle {
  margin-top: 3px;
  margin-bottom: 3px;
}
.msg-text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 220px;
  font-weight: bold;
}
</style>
