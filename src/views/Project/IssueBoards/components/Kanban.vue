<template>
  <div :key="reload" class="board-column">
    <div class="board-column-header">
      <div class="header-bar" />
      <el-row class="d-flex">
        <el-col :span="3">
          <i class="el-icon-plus ml-4 mr-5 add-button" @click="showDialog = true" />
        </el-col>
        <el-col :span="19" class="text-center">{{ headerText }} <b>({{ list.length }})</b></el-col>
        <!--        <i class="el-icon-more header-icon" />-->
      </el-row>
    </div>
    <draggable
      :list="list"
      v-bind="$attrs"
      :class="['board-column-content', cName]"
      :move="checkRelatives"
      @change="end(boardObject, $event)"
    >
      <div
        v-for="(element, idx) in list"
        :key="element.id+issueReload"
        class="board-item"
        :style="{ cursor: 'move' }"
        @drop="drop($event, idx)"
        @dragover="allowDrop($event, idx)"
      >
        <div class="pb-4">
          <div>
            <el-link
              class="cursor-pointer"
              type="primary"
              :underline="false"
              style="font-size: 16px"
              @click="handleClick(element.id)"
            >
              {{ element.name }}
            </el-link>
          </div>
        </div>
        <div>
          <span v-if="dimension !== 'status'" class="detail">
            <status :name="element.status.name" size="mini" class="status" />
          </span>
          <span v-if="dimension !== 'priority'" class="detail">
            <priority :name="element.priority.name" size="mini" class="priority" />
          </span>
          <span v-if="dimension !== 'tracker'" class="detail">
            <tracker :name="element.tracker.name" class="tracker" />
          </span>
        </div>
        <el-progress v-if="element.done_ratio>0" :percentage="element.done_ratio" :status="getStatus(element)" />
        <div>
          <span class="detail due_date">
            <i class="el-icon-date" />
            <span class="ml-1" :class="getDueDateClass(element)">{{ element.due_date }}</span>
          </span>
          <el-tooltip
            v-if="element.assigned_to"
            :content="element.assigned_to.login"
            placement="right-start"
            :disabled="!element.assigned_to.login"
          >
            <span class="ml-1 detail">
              <i class="el-icon-user-solid" />
              <span class="ml-1">{{ element.assigned_to.name }}</span>
            </span>
          </el-tooltip>
        </div>
        <div v-if="element.family " class="parent">
          <el-collapse v-model="element.show" @change="onCollapseChange(element)">
            <el-collapse-item name="relation">
              <template #title>
                <i class="el-icon-caret-right" /> {{ $t('Issue.RelatedIssue') }} {{ element | lengthFilter }}
              </template>
              <template v-if="element.family">
                <div v-if="element.hasOwnProperty('parent')" class="parent">
                  <b>{{ $t('Issue.ParentIssue') }}：</b>
                  <status :name="element.parent.status.name" size="mini" />
                  <el-link type="primary" :underline="false" @click="handleClick(element.parent.id)">
                    {{ element.parent.name }}
                  </el-link>
                </div>
                <div v-if="element.hasOwnProperty('children')&&element.children.length > 0" class="parent">
                  <b>{{ $t('Issue.ChildrenIssue') }}：</b>
                  <ol class="children_list">
                    <li v-for="(subElement, index) in element.children" :key="index">
                      <status :name="subElement.status.name" size="mini" />
                      <el-link type="primary" :underline="false" @click="handleClick(subElement.id)">
                        {{ subElement.name }}
                      </el-link>
                    </li>
                  </ol>
                </div>
              </template>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </draggable>
    <!-- TODO:focus-version -->
    <AddIssueDialog
      :dialog-visible="showDialog"
      :dimension="dimension"
      :focus-value="boardObject"
      :focus-version="focusVersion"
      @close="showDialog = false"
      @update="updateBoard"
    />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import AddIssueDialog from './AddIssueDialog.vue'
import Status from '@/components/Issue/Status'
import Priority from '@/components/Issue/Priority'
import Tracker from '@/components/Issue/Tracker'
import { getCheckIssueClosable, getIssueFamily } from '@/api/issue'

export default {
  name: 'Kanban',
  components: {
    Tracker,
    Priority,
    Status,
    draggable,
    AddIssueDialog
  },
  filters: {
    lengthFilter(value) {
      if (!value.hasOwnProperty('parent') && !value.hasOwnProperty('children')) return null
      const parent = (value.hasOwnProperty('parent')) ? 1 : 0
      const children = (value.hasOwnProperty('children')) ? value.children.length : 0
      return '(' + (parent + children) + ')'
    },
    sortByPriority(value) {
      const priorityCompare = (a, b) => (a.priority.id - b.priority.id)
      return value.sort(priorityCompare)
    }
  },
  props: {
    dimension: {
      type: String,
      default: null
    },
    headerText: {
      type: String,
      default: 'Header'
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
    cName: {
      type: String,
      default: ''
    },
    focusVersion: {
      type: String,
      default: ''
    },
    status: {
      type: Array,
      default: () => []
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
        console.log(result)
      } catch (e) {
        console.log(e)
      }
      return result
    },
    checkPriority(to, element) {
      return element.children.length <= 0
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
    drop(e, idx) {
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
            const checkChildrenStatus = this.checkChildrenStatusByApi(element)
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
          }
        } else {
          this.$emit('update-drag', {
            id: this.list[idx].id,
            value: { [Object.keys(data)[0]]: Object.values(data)[0] }
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
        return 'exception'
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
    async onCollapseChange(element) {
      await this.$set(element, 'loadingRelation', true)
      const family = await getIssueFamily(element.id)
      const data = family.data
      if (data.hasOwnProperty('parent')) { await this.$set(element, 'parent', data.parent) }
      if (data.hasOwnProperty('children')) { await this.$set(element, 'children', data.children) }
      this.issueReload += 1
      await this.$set(element, 'loadingRelation', false)
    },
    differentInDays(a, b) {
      const Difference_In_Time = a.getTime() - b.getTime()
      console.log(Difference_In_Time / (1000 * 3600 * 24))
      return Difference_In_Time / (1000 * 3600 * 24)
    }
  }
}
</script>
<style lang="scss" scoped>
.board-column {
  width: 280px;
  overflow: hidden;
  background: #ffffff;
  border-radius: 3px;
  border: 1px solid #e7e7e7;
  margin: 0 5px 20px 5px;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    border-radius: 3px 3px 0 0;

    .header-bar {
      background: red;
      height: 3px;
    }

    .header-icon {
      float: right;
      margin-right: 10px;
      line-height: 50px;
    }
  }

  .board-column-content {
    overflow: hidden;
    overflow-y: auto;
    border: 10px solid transparent;
    height: 90%;

    .board-item {
      cursor: pointer;
      width: 95%;
      height: 70px;
      margin: 5px auto;
      background-color: #fff;
      text-align: left;
      line-height: 20px;
      padding: 5px 10px;
      box-sizing: border-box;
      border: 1px solid #e9e9e9;
      box-shadow: 1px 3px 3px 0 rgba(0, 0, 0, 0.2);
    }
  }

  .add-button {
    cursor: pointer;
  }

  .detail {
    font-size: 1em;

    .tracker {
      font-size: 0.75em;
    }
  }
}

.parent {
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
.due_date{
  .danger{
    font-weight: 900;
    color:#F56C6C;
  }
  .warning{
    font-weight: 500;
    color: #d27e00;
  }
}

.board-column .board-column-content .board-item {
  font-size: 16px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  height: auto !important;
}
</style>
