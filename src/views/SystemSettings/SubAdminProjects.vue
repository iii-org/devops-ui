<template>
  <el-row
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    class="app-container"
    :gutter="20"
  >
    <el-col
      :span="11"
      :xs="7"
      :sm="5"
    >
      <el-row
        :gutter="10"
        class="text-center"
      >
        <el-col
          :span="24"
          class="text-title mb-5"
        >
          {{ $t('Dashboard.ADMIN.ProjectList.NAME') }}
        </el-col>
        <el-col
          :span="24"
          class="mb-2"
        >
          <el-input
            v-model="keyword"
            prefix-icon="el-icon-search"
            :placeholder="$t('Project.SearchProjectName')"
          />
        </el-col>
        <el-col
          :span="24"
          :style="{ overflow: 'hidden auto', 'max-height': `calc(100vh - 200px)` }"
        >
          <draggable
            :list="filteredProjects"
            :group="{ name: 'project', pull: 'clone', put: false }"
            :sort="false"
            :move="checkMove"
            :multi-drag="true"
            selected-class="sortable-selected"
          >
            <el-card
              v-for="project in filteredProjects"
              :key="project.id"
              :body-style="{ padding: '10px' }"
              class="mb-2 cursor-pointer"
              shadow="hover"
            >
              <span class="text-sm">{{ project.name }}</span>
            </el-card>
          </draggable>
        </el-col>
      </el-row>
    </el-col>

    <el-col
      :span="13"
      :xs="17"
      :sm="19"
    >
      <el-row :gutter="10">
        <el-col
          :span="24"
          class="mb-3"
        >
          <el-select
            v-model="selectedSubAdmins"
            filterable
            multiple
            :style="{ width: '100%' }"
            @remove-tag="handleSelectChange"
            @visible-change="handleSelectChange"
          >
            <el-option
              v-for="user in subAdmins"
              :key="user.id"
              :value="user.id"
              :label="`${user.name} (${user.login})`"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col
          v-for="user in subAdminProjects"
          :key="user.id"
          :span="24"
          :sm="12"
          :lg="8"
          :xl="6"
          class="mb-2"
        >
          <el-card :style="{ 'border-top': `5px solid ${user.color}` }">
            <div class="text-center mb-1">
              <span class="text-title">{{ user.name }}</span>
              <span class="text-sm">({{ user.login }})</span>
            </div>
            <draggable
              :list="user.projects"
              group="project"
              :move="checkMove"
              :sort="false"
              @change="setProject(user.id, $event)"
            >
              <el-card
                v-for="project in user.projects"
                :key="project.id"
                :body-style="{ padding: '10px' }"
                class="mb-2 cursor-pointer"
                shadow="hover"
              >
                <div class="flex justify-between">
                  <span class="text-sm">{{ project.name }}</span>
                  <em
                    class="el-icon-close cursor-pointer text-sm"
                    @click="removeProjectPermission(user.id, project.id)"
                  />
                </div>
              </el-card>
            </draggable>
          </el-card>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import draggable from 'vuedraggable'
import {
  getAdminProjects,
  getSubAdmins,
  getSubAdminProjects,
  setProjectPermission,
  deleteProjectPermission
} from '@/api/subAdminProject'

const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`

const mapping = {
  added: {
    propName: 'added',
    method: 'addProjectPermission'
  },
  removed: {
    propName: 'remove',
    method: 'removeProjectPermission'
  }
}

export default {
  name: 'SubAdminProjects',
  components: { draggable },
  data() {
    return {
      isLoading: false,
      keyword: '',
      adminProjects: [],
      subAdmins: [],
      selectedSubAdmins: [],
      subAdminProjects: []
    }
  },
  computed: {
    filteredProjects() {
      const keyword = this.keyword.toLowerCase()
      return this.adminProjects.filter((project) => project.name.toLowerCase().includes(keyword))
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.isLoading = true
      Promise.all([getAdminProjects(), getSubAdmins()])
        .then((res) => {
          this.adminProjects = res[0].data.map((project) => ({
            id: project.id,
            name: project.name
          }))
          this.subAdmins = res[1].data
        })
        .catch((err) => console.error(err))
        .then(() => {
          this.isLoading = false
        })
    },
    handleSelectChange(isDropdownAppears) {
      if (isDropdownAppears === true) return
      if (this.selectedSubAdmins.length === 0) {
        this.subAdminProjects = []
      } else {
        this.fetchSubAdminProjects()
      }
    },
    fetchSubAdminProjects() {
      const params = { id: this.selectedSubAdmins.toString() }
      getSubAdminProjects(params)
        .then((res) => {
          this.subAdminProjects = res.data.map((user) => ({
            ...user,
            color: randomColor()
          }))
        })
        .catch((err) => console.error(err))
    },
    addProjectPermission(user_id, project_id) {
      setProjectPermission({ user_id, project_id })
        .then(() => {
          this.$notify({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        })
        .catch((err) => console.error(err))
    },
    removeProjectPermission(user_id, project_id) {
      deleteProjectPermission({ user_id, project_id })
        .then(() => {
          this.$notify({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.removeSubAdminProjects(user_id, project_id)
        })
        .catch((err) => console.error(err))
    },
    removeSubAdminProjects(userId, projectId) {
      const userIdx = this.subAdminProjects.findIndex((user) => user.id === userId)
      const projectIdx = this.subAdminProjects[userIdx].projects.findIndex((project) => project.id === projectId)
      this.subAdminProjects[userIdx].projects.splice(projectIdx, 1)
    },
    checkMove(evt) {
      const draggedContext = evt.draggedContext
      if (Array.isArray(draggedContext)) {
        let result = true
        draggedContext.forEach((item) => {
          const draggedId = item.element.id
          const qaProjects = evt.relatedContext.list.map((project) => project.id)
          if (qaProjects.includes(draggedId)) result = result && false
        })
        return result
      } else {
        const draggedId = draggedContext.element.id
        const qaProjects = evt.relatedContext.list.map((project) => project.id)
        if (qaProjects.includes(draggedId)) return false
      }
    },
    getSetMode(evt) {
      if (evt.hasOwnProperty('added')) {
        return 'added'
      } else if (evt.hasOwnProperty('removed')) {
        return 'removed'
      }
    },
    setProject(userId, evt) {
      const setMode = this.getSetMode(evt)
      if (setMode) {
        const { propName, method } = mapping[setMode]
        if (Array.isArray(evt[propName])) {
          evt[propName].forEach((item) => {
            const { id } = item.element
            this[method](userId, id)
          })
        } else {
          const { id } = evt[propName].element
          this[method](userId, id)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.sortable-selected {
  >>> .el-card__body {
    background-color: mix($menuActiveText, #ffffff, 20%);
  }
}
</style>
