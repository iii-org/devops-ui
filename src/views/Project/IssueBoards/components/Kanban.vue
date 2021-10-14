<template>
  <div :key="reload" class="board-column">
    <div class="board-column-header">
      <div class="header-bar" />
      <el-row class="flex">
        <el-col class="text-center">{{ getTranslateHeader(boardObject.name) }} <b>({{ list.length }})</b></el-col>
        <!--        <i class="el-icon-more header-icon" />-->
      </el-row>
    </div>
    <draggable
      :list="list"
      v-bind="$attrs"
      class="board-column-content"
      :class="boardObject.name"
      :move="checkRelatives"
      :draggable="'.item'"
      @change="end(boardObject, $event)"
    >
      <div
        v-for="(element, idx) in list"
        :key="element.id"
        class="board-item item"
        @drop="drop($event, idx)"
        @dragover="allowDrop($event, idx)"
      >
        <div v-if="element.done_ratio>0" class="progress-bar" :class="getStatus(element)"
             :style="{width: `${element.done_ratio}%`}"
        />
        <div @contextmenu="handleContextMenu(element, '', $event)">
          <div class="title">
            <el-link
              class="cursor-pointer"
              type="primary"
              :underline="false"
              style="font-size: 16px"
              @click="handleClick(element.id)"
            >
              {{ element.name }}
              <el-tag v-for="item in element.tags" :key="item.id" effect="plain" size="mini" class="mr-1">
                {{ item.name }}
              </el-tag>
            </el-link>
          </div>
          <div class="issue-status-tags">
            <span v-if="dimension !== 'status'">
              <status :name="element.status.name" size="mini" class="status" />
            </span>
            <span v-if="dimension !== 'priority'">
              <priority :name="element.priority.name" size="mini" class="priority" />
            </span>
            <span v-if="dimension !== 'tracker'">
              <tracker :name="element.tracker.name" class="tracker" />
            </span>
            <span v-if="element.done_ratio>0">
              <el-tag :type="getStatus(element)" size="mini" effect="dark">{{ element.done_ratio }}%</el-tag>
            </span>
          </div>
        </div>
        <div v-if="element.family" class="relation">
          <el-collapse v-model="element.show" @change="onCollapseChange(element)">
            <el-collapse-item name="relation">
              <template #title>
                <i class="el-icon-caret-right" /> {{ $t('Issue.RelatedIssue') }} {{ element | lengthFilter }}
              </template>
              <div v-if="element.family" class="parent">
                <div v-if="element.hasOwnProperty('parent')"
                     @contextmenu="handleContextMenu(element.parent, '', $event)"
                >
                  <b>{{ $t('Issue.ParentIssue') }}：</b>
                  <status :name="element.parent.status.name" size="mini" />
                  <el-link type="primary" :underline="false" @click="handleClick(element.parent.id)">
                    {{ element.parent.name }}
                    <el-tag v-for="item in element.parent.tags" :key="item.id" effect="plain" size="mini" class="mr-1">
                      {{ item.name }}
                    </el-tag>
                  </el-link>
                </div>
                <div v-if="element.hasOwnProperty('children')&&element.children.length > 0">
                  <b>{{ $t('Issue.ChildrenIssue') }}：</b>
                  <ol class="children_list">
                    <li v-for="(subElement, index) in element.children" :key="index"
                        @contextmenu="handleContextMenu(subElement, '', $event)"
                    >
                      <status :name="subElement.status.name" size="mini" />
                      <el-link type="primary" :underline="false" @click="handleClick(subElement.id)">
                        {{ subElement.name }}
                        <el-tag v-for="item in subElement.tags" :key="item.id" effect="plain" size="mini" class="mr-1">
                          {{ item.name }}
                        </el-tag>
                      </el-link>
                    </li>
                  </ol>
                </div>
                <div v-if="element.hasOwnProperty('relations')&&element.relations.length > 0">
                  <b>{{ $t('Issue.RelatedIssue') }}：</b>
                  <ol class="children_list">
                    <li v-for="(subElement, index) in element.relations" :key="index"
                        @contextmenu="handleContextMenu(subElement, '', $event)"
                    >
                      <status :name="subElement.status.name" size="mini" />
                      <el-link type="primary" :underline="false" @click="handleClick(subElement.id)">
                        {{ subElement.name }}
                        <el-tag v-for="item in subElement.tags" :key="item.id" effect="plain" size="mini" class="mr-1">
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
        <div v-if="element.due_date || Object.keys(element.assigned_to).length>0" class="info">
          <div v-if="element.due_date" class="ml-1 detail due_date" :class="getDueDateClass(element)">
            {{ element.due_date }}
          </div>
          <div v-else class="ml-1 detail due_date">
            <i class="el-icon-date" />
          </div>
          <el-tooltip
            v-if="Object.keys(element.assigned_to).length>0"
            :content="element.assigned_to.login"
            placement="right-start"
            :disabled="!element.assigned_to.login"
          >
            <div class="ml-1 detail user">
              <span class="ml-1">{{ element.assigned_to.name }}</span>
            </div>
          </el-tooltip>
          <div v-else class="ml-1 detail user">
            <i class="el-icon-user-solid" />
          </div>
        </div>
        <div v-else class="no-info" />
      </div>
      <div slot="header">
        <div class="title board-item select-none" @click="showDialog = !showDialog"><i
          class="el-icon-plus ml-4 mr-5 add-button"
        /> {{ $t('Issue.AddIssue') }}
        </div>
        <QuickAddIssueOnBoard v-if="showDialog" class="board-item" :save-data="addIssue" :board-object="boardObject"
                              @after-add="showDialog = !showDialog"
        />
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import { getCheckIssueClosable, getIssueFamily } from '@/api/issue'
import QuickAddIssueOnBoard from './QuickAddIssueOnBoard'

export default {
  name: 'Kanban',
  components: {
    QuickAddIssueOnBoard,
    Tracker,
    Priority,
    Status,
    draggable
  },
  filters: {
    lengthFilter(value) {
      if (!value.hasOwnProperty('parent') && !value.hasOwnProperty('children') && !value.hasOwnProperty('relations')) return null
      const parent = (value.hasOwnProperty('parent')) ? 1 : 0
      const children = (value.hasOwnProperty('children')) ? value.children.length : 0
      const relations = (value.hasOwnProperty('relations')) ? value.relations.length : 0
      return '(' + (parent + children + relations) + ')'
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
      default: () => {
      }
    }
  },
  data() {
    return {
      showDialog: false,
      showAlert: false,
      reload: 0,
      issueReload: 0
    }
  },
  methods: {
    checkRelatives(evt) {
      const errorMsg = []
      const toName = evt.to.classList[1]
      const toClassObj = this.status.find(item => item.name === toName)
      const element = evt.draggedContext.element
      const h = this.$createElement
      if (this.dimension === 'status') {
        const checkAssigned = this.checkAssigned(toClassObj, element)
        if (!checkAssigned) {
          errorMsg.push(
            h('li', [h('b', '尚未分派的議題：'), h('p', '沒有人被分派到此議題，無法調整到"已分配"之後的議題狀態')])
          )
        }
        if (toClassObj.id === 6) {
          const checkChildrenStatus = this.checkChildrenStatus(element)
          if (!checkChildrenStatus) {
            errorMsg.push(h('li', [h('b', '子議題尚未全關閉：'), h('p', '有未關閉的子議題，請確認所有議題皆已關閉')]))
          }
          if (!checkAssigned || !checkChildrenStatus) {
            this.showErrorAlert(errorMsg)
          }
          return checkAssigned && checkChildrenStatus
        }
        if (!checkAssigned) {
          this.showErrorAlert(errorMsg)
        }
        return checkAssigned
      } else if (this.dimension === 'priority') {
        const checkPriority = this.checkPriority(element)
        if (!checkPriority) {
          errorMsg.push(h('li', [h('b', '父議題不能改變優先權：'), h('p', '優先權會依據最後的子議題進行優先權變更！')]))
          this.showErrorAlert(errorMsg)
        }
        return checkPriority
      }
    },
    checkAssigned(to, element) {
      return !(Object.keys(element.assigned_to).length <= 2 && to.id >= 2)
    },
    checkChildrenStatus(element) {
      if (element.children.length <= 0) return true
      return element.children.map(issue => issue.status.id === 6).reduce((issue_status, all) => issue_status && all)
    },
    async checkChildrenStatusByApi(element) {
      this.check = true
      let result = false
      try {
        result = await getCheckIssueClosable(element.id)
        result = result.data
      } catch (e) {
        console.error(e)
      }
      return result
    },
    checkPriority(element) {
      return !element.has_children
    },
    end(boardObject, event) {
      this.reload += 1
      this.$emit('update', { boardObject: boardObject, event: event })
    },
    updateBoard(sendData) {
      this.$emit('update-board', sendData)
    },
    handleClick(id) {
      this.$router.push({ name: 'issue-detail', params: { issueId: id }})
    },
    showErrorAlert(errorMsg) {
      const h = this.$createElement
      if (!this.showAlert) {
        this.showAlert = true
        this.$msgbox({ message: h('ul', errorMsg), title: '異動議題錯誤' }).then(() => {
          this.showAlert = false
        })
      }
    },
    async drop(e, idx) {
      e.preventDefault()
      if (e.dataTransfer.getData('json')) {
        const data = JSON.parse(e.dataTransfer.getData('json'))
        const toClassObj = Object.values(data)[0]
        const element = this.list[idx]
        const h = this.$createElement
        const checkAssigned = this.checkAssigned(toClassObj, element)
        const errorMsg = []

        if (Object.keys(data)[0] === 'status') {
          if (!checkAssigned) {
            errorMsg.push(
              h('li', [h('b', '尚未分派的議題：'), h('p', '沒有人被分派到此議題，無法調整到"已分配"之後的議題狀態')])
            )
          }
          if (toClassObj.id === 6) {
            const checkChildrenStatus = await this.checkChildrenStatusByApi(element)
            if (checkAssigned && checkChildrenStatus) {
              this.$emit('update-drag', {
                id: this.list[idx].id,
                value: { [Object.keys(data)[0]]: Object.values(data)[0] }
              })
            } else {
              if (!checkChildrenStatus) {
                errorMsg.push(
                  h('li', [h('b', '子議題尚未全關閉：'), h('p', '有未關閉的子議題，請確認所有議題皆已關閉')])
                )
              }
              this.showErrorAlert(errorMsg)
            }
          } else {
            if (checkAssigned) {
              this.$emit('update-drag', {
                id: this.list[idx].id,
                value: { [Object.keys(data)[0]]: Object.values(data)[0] }
              })
            } else {
              this.showErrorAlert(errorMsg)
            }
          }
        } else if (Object.keys(data)[0] === 'priority') {
          const checkPriority = this.checkPriority(element)
          if (!checkPriority) {
            errorMsg.push(
              h('li', [h('b', '父議題不能改變優先權：'), h('p', '優先權會依據最後的子議題進行優先權變更！')])
            )
            this.showErrorAlert(errorMsg)
          } else {
            this.$emit('update-drag', {
              id: this.list[idx].id,
              value: { [Object.keys(data)[0]]: Object.values(data)[0] }
            })
          }
        } else {
          let value = { [Object.keys(data)[0]]: Object.values(data)[0] }
          if (Object.keys(data)[0] === 'tags') {
            const now = Object.values(data)[0]
            const result = element.tags
            const findTagIndex = element.tags.findIndex(item => item.id === now.id)
            if (findTagIndex >= 0) {
              result.splice(findTagIndex, 1)
            } else {
              result.push(now)
            }
            value = { [Object.keys(data)[0]]: result }
          }
          this.$emit('update-drag', {
            id: this.list[idx].id,
            value: value
          })
        }
        this.reload += 1
      }
    },
    allowDrop(e) {
      e.dataTransfer.dropEffect = 'copy'
      e.dataTransfer.clearData()
      e.preventDefault()
    },
    getStatus(element) {
      const dueDate = new Date(element.due_date)
      const today = new Date()
      if (element.done_ratio === 100) {
        return 'success'
      } else if (element.due_date && today > dueDate && element.done_ratio < 100 && element.status.name !== 'Closed') {
        return 'danger'
      } else if (element.due_date && this.differentInDays(dueDate, today) <= 3 && element.done_ratio < 100 && element.status.name !== 'Closed') {
        return 'warning'
      }
    },
    getDueDateClass(element) {
      const dueDate = new Date(element.due_date)
      const today = new Date()
      if (element.due_date && today > dueDate && element.done_ratio < 100 && element.status.name !== 'Closed') {
        return 'danger'
      } else if (element.due_date && this.differentInDays(dueDate, today) <= 3 && element.done_ratio < 100 && element.status.name !== 'Closed') {
        return 'warning'
      }
    },
    getTranslateHeader(value) {
      return this.$te('Issue.' + value) ? this.$t('Issue.' + value) : value
    },
    async onCollapseChange(element) {
      this.$set(element, 'loadingRelation', true)
      const family = await getIssueFamily(element.id)
      const data = family.data
      if (data.hasOwnProperty('parent')) {
        await this.$set(element, 'parent', data.parent)
      }
      if (data.hasOwnProperty('children')) {
        await this.$set(element, 'children', data.children)
      }
      if (data.hasOwnProperty('relations')) {
        await this.$set(element, 'relations', data.relations)
      }
      this.issueReload += 1
      this.$set(element, 'loadingRelation', false)
    },
    differentInDays(a, b) {
      const Difference_In_Time = a.getTime() - b.getTime()
      return Difference_In_Time / (1000 * 3600 * 24)
    },
    handleContextMenu(row, context, event) {
      this.$emit('contextmenu', { row, context, event })
    }
  }
}
</script>
<style lang="scss" scoped>
.board-column {
  width: 280px;
  margin: 0 5px 20px 5px;
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
    @apply overflow-x-hidden overflow-y-auto h-full space-y-4;

    .board-item {
      cursor: pointer;
      width: 95%;
      height: auto;
      text-align: left;
      line-height: 20px;
      //padding: 10px 10px 0 10px;
      box-sizing: border-box;
      border: 1px solid #e9e9e9;
      @apply shadow-md bg-white rounded-md border-solid border border-gray-300 mx-auto;
      font-size: 16px;

      .add-button {
        cursor: pointer;
        @apply m-3;
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
        @apply m-3;
      }

      .relation {
        .parent {
          @apply m-3;
        }

        .children_list {
          margin: 0;
        }

        > > > .el-collapse-item {
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
          font-size: 0.80em;
        }
      }

      .info {
        @apply flex border-0 border-t border-solid border-gray-200 divide-x divide-solid divide-gray-200 rounded-b-md;
        .detail {
          font-size: 1em;
          line-height: 1em;
          padding: 0 3px;
          @apply flex flex-1 py-2 border-0 truncate;
        }

        .due_date {
          .danger {
            font-weight: 900;
            color: #F56C6C;
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

}

</style>
