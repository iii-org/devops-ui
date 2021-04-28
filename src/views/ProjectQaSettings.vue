<template>
  <el-row v-loading="isLoading" :element-loading-text="$t('Loading')" class="app-container" :gutter="20">
    <el-col :span="5">
      <el-row :gutter="10" class="text-center">
        <el-col :span="24" class="text-h6 mb-5">
          {{ $t('Dashboard.ADMIN.ProjectList.NAME') }}
        </el-col>
        <el-col :span="24" class="mb-2">
          <el-input v-model="keyword" prefix-icon="el-icon-search" :placeholder="$t('Project.SearchProjectName')" />
        </el-col>
        <el-col :span="24" :style="{ overflow: 'hidden auto', 'max-height': `calc(100vh - 200px)` }">
          <draggable
            :list="filteredProjects"
            :group="{ name: 'project', pull: 'clone', put: false }"
            :sort="false"
            :move="checkMove"
          >
            <el-card
              v-for="project in filteredProjects"
              :key="project.project_id"
              :body-style="{ padding: '10px' }"
              class="mb-2 cursor-pointer"
              shadow="hover"
            >
              <span class="text-subtitle-2">{{ project.project_name }}</span>
            </el-card>
          </draggable>
        </el-col>
      </el-row>
    </el-col>

    <el-col :span="19">
      <el-row :gutter="10">
        <el-col :span="24" class="mb-3">
          <el-select
            v-model="selectedSubAdmins"
            filterable
            multiple
            :style="{ width: '100%' }"
            @remove-tag="fetchSubAdminProjects"
            @visible-change="fetchSubAdminProjects"
          >
            <el-option v-for="user in subAdmins" :key="user.id" :value="user.id" :label="user.name" />
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col v-for="user in subAdminProjects" :key="user.id" :span="8" class="mb-2">
          <el-card :style="{ 'border-top': `5px solid ${user.color}` }">
            <div class="text-center text-h6 mb-1">{{ user.name }}</div>
            <draggable
              :list="user.projects"
              group="project"
              :move="checkMove"
              :sort="false"
              @change="setProject(user.id, $event)"
            >
              <el-card v-for="project in user.projects" :key="project.project_id" :body-style="{ padding: '10px' }" class="mb-2" shadow="hover">
                <div class="d-flex justify-space-between">
                  <span class="text-subtitle-2">{{ project.project_name }}</span>
                  <i
                    class="el-icon-close cursor-pointer text-subtitle-2"
                    @click="removeProjectPermission(user.id, project.project_id)"
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

export default {
  name: 'ProjectQaSettings',
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
      return this.adminProjects.filter(project => project.project_name.toLowerCase().includes(keyword))
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.isLoading = true
      Promise.all([getAdminProjects(), getSubAdmins()])
        .then(res => {
          this.adminProjects = res[0].data.map(project => ({
            project_id: project.id,
            project_name: project.name
          }))
          this.subAdmins = res[1].data
        })
        .catch(err => console.error(err))
        .then(() => {
          this.isLoading = false
        })
    },
    fetchSubAdminProjects(status) {
      if (status === true || this.selectedSubAdmins.length === 0) return
      const params = { id: this.selectedSubAdmins.toString() }
      getSubAdminProjects(params)
        .then(res => {
          this.subAdminProjects = res.data.map(user => ({
            ...user,
            color: randomColor()
          }))
        })
        .catch(err => console.error(err))
    },
    addProjectPermission(user_id, project_id) {
      setProjectPermission({ user_id, project_id })
        .then()
        .catch(err => console.error(err))
    },
    removeProjectPermission(user_id, project_id) {
      deleteProjectPermission({ user_id, project_id })
        .then(res => {
          this.$notify({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.removeSubAdminProjects(user_id, project_id)
        })
        .catch(err => console.error(err))
    },
    removeSubAdminProjects(userId, projectId) {
      const userIdx = this.subAdminProjects.findIndex(user => user.id === userId)
      const projectIdx = this.subAdminProjects[userIdx].projects.findIndex(project => project.id === projectId)
      this.subAdminProjects[userIdx].projects.splice(projectIdx, 1)
    },
    checkMove(evt) {
      const draggedId = evt.draggedContext.element.project_id
      const qaProjects = evt.relatedContext.list.map(project => project.project_id)
      if (qaProjects.includes(draggedId)) return false
    },
    setProject(userId, evt) {
      const isAdded = evt.hasOwnProperty('added')
      if (isAdded) {
        const { project_id } = evt.added.element
        this.addProjectPermission(userId, project_id)
      } else {
        const { project_id } = evt.removed.element
        this.removeProjectPermission(userId, project_id)
      }
    }
  }
}
</script>
