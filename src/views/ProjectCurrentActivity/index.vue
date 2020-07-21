<script>
import { mapGetters, mapActions } from 'vuex'
import Kanban from '@/components/Kanban'
import { getProjectList } from '@/api/projects'
export default {
  components: { Kanban },
  data() {
    return {
      projectList: [],
      group: 'mission',
      list1: [
        { name: 'Mission', id: 1, iat: '2011-09-22 20:12:33', iss: 'ninoaaa' },
        { name: 'Mission', id: 2, iat: '2011-09-22 20:12:33', iss: 'ninobbb' },
        { name: 'Mission', id: 3, iat: '2011-09-22 20:12:33', iss: 'ninocc' },
        { name: 'Mission', id: 4, iat: '2011-09-22 20:12:33', iss: 'ninodd' }
      ],
      list2: [
        { name: 'Mission', id: 5, iat: '2011-09-22 20:12:33', iss: 'ninoxxx' },
        { name: 'Mission', id: 6, iat: '2011-09-22 20:12:33', iss: 'ninobbb' },
        { name: 'Mission', id: 7, iat: '2011-09-22 20:12:33', iss: 'ninoccccc' }
      ],
      list3: [
        { name: 'Mission', id: 8, iat: '2011-09-22 20:12:33', iss: 'ninobbb' },
        { name: 'Mission', id: 9, iat: '2011-09-22 20:12:33', iss: 'ninoddd' },
        { name: 'Mission', id: 10, iat: '2011-09-22 20:12:33', iss: 'ninoaaaa' }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // this.listLoading = true
      getProjectList().then(res => {
        this.projectList = res.data.items
      })
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div>
      <h3>
        Project:
        <span>
          <el-select v-model="value" filterable placeholder="select project">
            <el-option
              v-for="item in projectList"
              :key="item.project_name"
              :label="item.project_name"
              :value="item.project_name">
            </el-option>
          </el-select>
        </span>
      </h3>
    </div>
    <el-divider />
    <div class="components-container board">
      <Kanban :key="1" :list="list1" :group="group" class="kanban todo" header-text="Todo" />
      <Kanban :key="2" :list="list2" :group="group" class="kanban in-progress" header-text="In Progress" />
      <Kanban :key="3" :list="list3" :group="group" class="kanban done" header-text="Done" />
      <Kanban :key="3" :list="list3" :group="group" class="kanban close" header-text="Close" />
    </div>
  </div>
</template>
<style lang="scss">
.board {
  // width: 1000px;
  margin-left: 20px;
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  align-items: flex-start;
}
.kanban {
  &.todo {
    .board-column-header {
      .header-bar {
        background: #85C1E9;
      }
    }
  }
  &.in-progress {
    .board-column-header {
      .header-bar {
        background: #FFC300;
      }
    }
  }
  &.done {
    .board-column-header {
      .header-bar {
        background: #82E0AA;
      }
    }
  }
  &.close {
    .board-column-header {
      .header-bar {
        background: #AEB6BF;
      }
    }
  }
}
</style>
