<template>
  <div class="board-column">
    <div class="board-column-header">
      <div class="header-bar" />
      <div class="d-flex">
        <div>
          <i class="el-icon-plus ml-4 mr-5 add-button" @click="showDialog = true" />
        </div>
        <div class="ml-15">{{ headerText }}</div>
        <!-- <i class="el-icon-more header-icon" /> -->
      </div>
    </div>
    <draggable :list="list" v-bind="$attrs" :class="['board-column-content', cName]" :move="checkRelatives" @end="end">
      <div v-for="element in list" :key="element.id" class="board-item">
        <div class="pb-4">
          <el-link type="primary" :underline="false" style="font-size: 16px" @click="handleClick(element.id)">
            {{ element.name }}
          </el-link>
        </div>
        <div>
          <span style="font-size: 15px;">
            <i class="el-icon-date" />
            <span class="ml-1">{{ element.date }}</span>
          </span>
          <span class="ml-1" style="font-size: 15px">
            <i class="el-icon-s-custom" />
            <span class="ml-1">{{ element.user }}</span>
          </span>
        </div>
      </div>
    </draggable>
    <AddIssueDialog :dialog-visible="showDialog" :focus-status="cName" @close="showDialog = false" @update="updateBoard" />
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
  props: {
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
    }
  },
  data: () => ({
    showDialog: false
  }),
  methods: {
    checkRelatives(evt) {
      let result = true
      const { id, parent_id } = evt.draggedContext.element
      const toName = evt.to.classList[1]
      const cIdx = this.relativeList.findIndex(item => item.id === id)
      const childrenIssueList = this.relativeList[cIdx].children
      const pIdx = this.relativeList.findIndex(item => item.id === parent_id)
      const parentIssue = this.relativeList[pIdx] || {}
      if (
        toName === 'Closed' &&
        childrenIssueList.length &&
        !childrenIssueList.every(item => item.issue_status === 'Closed')
      ) {
        result = false
      }
      if (parentIssue !== {} && parentIssue.issue_status === 'Closed') {
        result = false
      }
      return result
    },
    end(evt) {
      this.$emit('update', evt)
    },
    updateBoard() {
      this.$emit('updateBoard')
    },
    handleClick(id) {
      this.$router.push({ path: `/project/list/${id}` })
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
  margin: 0px 5px 20px 5px;

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
}
</style>
