<template>
  <div class="board-column">
    <div class="board-column-header">
      <div class="header-bar" />
      <div class="header-text">
        {{ headerText }}
        <!-- <i class="el-icon-more header-icon" /> -->
      </div>
    </div>
    <!-- <draggable :list="list" v-bind="$attrs" :class="['board-column-content', cName]" :move="checkMove" @end="end"> -->
    <draggable :list="list" v-bind="$attrs" :class="['board-column-content', cName]" @end="end">
      <div v-for="element in list" :key="element.id" class="board-item">
        <div style="padding-bottom: 20px">{{ element.name }}</div>
        <div>
          <span style="font-size: 15px;">
            <i class="el-icon-date" />
            <span style="margin-left:2px">{{ element.date }}</span>
          </span>
          <span style="font-size: 15px;margin-left:5px;">
            <i class="el-icon-s-custom" />
            <span style="margin-left:2px">{{ element.user }}</span>
          </span>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'Kanban',
  components: {
    draggable
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
    cName: {
      type: String,
      default: ''
    }
  },
  methods: {
    // checkMove(evt) {
    //   console.log('checkMove ==>', evt)
    //   if (evt.to.className.includes('Active')) {
    //     this.$message({ type: 'success', message: 'Move denied' })
    //     return false
    //   } else return true
    // },
    end(evt) {
      this.$emit('update', evt)
    }
  }
}
</script>
<style lang="scss" scoped>
.board-column {
  min-width: 280px;
  min-height: 100px;
  height: auto;
  overflow: hidden;
  background: #ffffff;
  border-radius: 3px;
  border: 1px solid #e7e7e7;
  margin: 0px 5px;

  .board-column-header {
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    border-radius: 3px 3px 0 0;

    .header-bar {
      background: red;
      height: 3px;
    }
    .header-text {
      margin-left: 10px;
    }
    .header-icon {
      float: right;
      margin-right: 10px;
      line-height: 50px;
    }
  }

  .board-column-content {
    height: auto;
    overflow: hidden;
    border: 10px solid transparent;
    min-height: 60px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    align-items: center;

    .board-item {
      cursor: pointer;
      width: 95%;
      height: 70px;
      margin: 5px 0;
      background-color: #fff;
      text-align: left;
      line-height: 20px;
      padding: 5px 10px;
      box-sizing: border-box;
      border: 1px solid #e9e9e9;
      box-shadow: 1px 3px 3px 0 rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
