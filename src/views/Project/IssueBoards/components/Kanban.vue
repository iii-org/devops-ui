<template>
  <div :key="reload" class="board-column">
    <div class="board-column-header">
      <div class="header-bar" />
      <el-row class="d-flex">
        <el-col :span="3">
          <i class="el-icon-plus ml-4 mr-5 add-button" @click="showDialog = true" />
        </el-col>
        <el-col :span="19" class="text-center">{{ headerText }}</el-col>
        <!-- <i class="el-icon-more header-icon" /> -->
      </el-row>
    </div>
    <draggable
      :list="list" v-bind="$attrs" :class="['board-column-content', cName]" :move="checkRelatives"
      @change="end(cName, $event)"
    >
      <div v-for="(element,idx) in list" :key="element.id" class="board-item" @drop="drop($event, idx)"
           @dragover="allowDrop($event, idx)"
      >
        <div class="pb-4">
          <div>
            <el-link type="primary" :underline="false" style="font-size: 16px" @click="handleClick(element.id)">
              {{ element.issue_name }}
            </el-link>
          </div>
        </div>
        <div>
          <span class="detail">
            <i class="el-icon-date" />
            <span class="ml-1">{{ element.due_date }}</span>
          </span>
          <span class="ml-1 detail">
            <i class="el-icon-s-custom" />
            <span class="ml-1">{{ element.assigned_to }}</span>
          </span>
          <p v-if="element.parent_id" class="parent">
            <i class="el-icon-caret-right" /> 父議題：
            <el-tag class="el-tag--circle" size="mini" :class="element.parent_status">
              {{ $t('ProjectActive.' + element.parent_status) }}
            </el-tag>
            <el-link type="primary" :underline="false" @click="handleClick(element.parent_id)">
              {{ element.parent_name }}
            </el-link>
          </p>
          <div v-if="element.children.length>0" class="parent">
            <el-collapse>
              <el-collapse-item>
                <template #title>
                  <i class="el-icon-caret-right" /> 子議題 ({{ element.children|lengthFilter }})
                </template>
                <ol class="children_list">
                  <li v-for="(subElement,idx) in element.children" :key="idx">
                    <el-tag class="el-tag--circle" size="mini" :class="subElement.issue_status">
                      {{ $t('ProjectActive.' + subElement.issue_status) }}
                    </el-tag>
                    <el-link type="primary" :underline="false" @click="handleClick(element.id)">
                      {{ subElement.issue_name }}
                    </el-link>
                  </li>
                </ol>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </draggable>
    <AddIssueDialog
      :dialog-visible="showDialog"
      :dimension="dimension"
      :focus-value="cName"
      :focus-version="focusVersion"
      @close="showDialog = false"
      @update="updateBoard"
    />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import AddIssueDialog from './AddIssueDialog.vue'

export default {
  name: 'Kanban',
  components: {
    draggable,
    AddIssueDialog
  },
  filters: {
    lengthFilter(value) {
      return value.length
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
    }
  },
  data: () => ({
    showDialog: false,
    reload: 0
  }),
  methods: {
    checkRelatives(evt) {
      const result = true
      // this.$emit('update', evt)
      // const { id, parent_id } = evt.draggedContext.element
      // const toName = evt.to.classList[1]
      // const cIdx = this.relativeList.findIndex(item => item.id === id)
      // const childrenIssueList = this.relativeList[cIdx].children
      // const pIdx = this.relativeList.findIndex(item => item.id === parent_id)
      // const parentIssue = this.relativeList[pIdx] || {}
      // if (
      //   toName === 'Closed' &&
      //   childrenIssueList.length &&
      //   !childrenIssueList.every(item => item.issue_status === 'Closed')
      // ) {
      //   result = false
      // }
      // if (parentIssue !== {} && parentIssue.issue_status === 'Closed') {
      //   result = false
      // }
      return result
    },
    end(list, event) {
      this.$emit('update', { list: list, event: event })
    },
    updateBoard(sendData) {
      this.$emit('updateBoard', sendData)
    },
    handleClick(id) {
      this.$router.push({ path: `/project/issue-list/${id}` })
    },
    drop(e, idx) {
      e.preventDefault()
      const data = JSON.parse(e.dataTransfer.getData('json'))
      // this.$set(this.list[idx], Object.keys(data)[0], Object.values(data)[0].name)
      this.$emit('update-drag', { id: this.list[idx].id, value: { [Object.keys(data)[0]]: Object.values(data)[0] }})
      this.reload += 1
    },
    allowDrop(e, idx) {
      e.dataTransfer.dropEffect = 'copy'
      e.dataTransfer.clearData()
      e.preventDefault()
      // console.log('dragover')
    }
  }
}
</script>
<style lang="scss" scoped>
.board-column {
  width: 280px;
  // min-height: 100px;
  // height: auto;
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
    border: 10px solid transparent;
    height: 100%;

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
</style>
