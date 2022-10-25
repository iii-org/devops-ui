<template>
  <el-row
    type="flex"
    justify="space-between"
    align="middle"
  >
    <el-col
      :span="10"
      class="align-middle"
    >
      <el-row
        type="flex"
        justify="start"
        align="middle"
      >
        <el-col
          v-if="projectValue !== ''"
          class="star"
        >
          <div
            v-if="projectInformation.starred"
            class="star-content"
            @click="setStar(projectValue, false)"
          >
            <em class="el-icon-star-on star-on" />
          </div>
          <div
            v-else
            class="star-content"
            @click="setStar(projectValue, true)"
          >
            <em class="el-icon-star-off star-off" />
          </div>
        </el-col>
        <el-col>
          <el-select
            ref="selectProject"
            v-model="projectValue"
            :placeholder="$t('Project.SelectProject')"
            :loading="isLoading"
            filterable
            remote
            :remote-method="getSearchProject"
            class="project"
            :clearable="clearable"
            @visible-change="isSelectVisible"
            @click.native="checkUnsavedChanges"
            @blur="selectVisible = false"
            @change="setChange"
          >
            <template slot="prefix"><em class="el-icon-s-cooperation el-input__icon" /></template>
            <el-option-group
              v-for="group in categoryProjectList"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.id"
                :label="item.display"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-col>
        <el-col class="more">
          <el-popover
            v-if="projectValue !== ''"
            placement="right"
          >
            <div class="more-popover">
              <div class="item gitlab">
                <svg-icon
                  icon-class="gitlab"
                  class="text-xl"
                />
                <div class="sub-item">
                  <el-button
                    icon="el-icon-copy-document"
                    circle
                    size="mini"
                    @click="copyUrl(projectInformation.git_url)"
                  />
                  <a
                    :href="projectInformation.git_url"
                    target="_blank"
                  >
                    <el-button
                      circle
                      size="mini"
                    >
                      <em class="ri-external-link-line" />
                    </el-button>
                  </a>
                </div>
              </div>
              <el-link
                target="_blank"
                class="item"
                :underline="false"
                :href="projectInformation.redmine_url"
              >
                <svg-icon
                  icon-class="redmine"
                  class="text-xl"
                />
              </el-link>
              <el-link
                target="_blank"
                class="item"
                :underline="false"
                :href="projectInformation.harbor_url"
              >
                <svg-icon
                  icon-class="harbor"
                  class="text-xl"
                />
              </el-link>
              <div class="item project-name">#{{ projectInformation.name }}</div>
            </div>
            <div
              slot="reference"
              class="more-btn"
            >
              <em class="el-icon-more" />
            </div>
          </el-popover>
        </el-col>
      </el-row>
    </el-col>
    <el-col>
      <el-row
        type="flex"
        justify="space-between"
        align="middle"
      >
        <el-col class="min-w-max max-w-max">
          <slot name="button" />
        </el-col>
        <el-col class="align-middle text-right">
          <slot />
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { deleteStarProject, postStarProject } from '@/api/projects'

export default {
  name: 'ProjectListSelector',
  props: {
    projectId: {
      type: [Number, String],
      default: null
    },
    keepSelection: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      projectValue: '',
      selectVisible: false,
      toolbarVisible: false,
      categoryProjectList: [],
      isLoading: false,
      isSearch: false
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'selectedProject', 'selectedProjectId']),
    projectInformation() {
      const item = this.projectOptions.find((option) => option.id === this.projectValue)
      if (!item) return { display: this.$t('general.All') }
      return item
    }
  },
  watch: {
    projectId(value) {
      if (value) this.projectValue = value
    },
    selectedProjectId: {
      immediate: true,
      handler(val) {
        if (!this.keepSelection) return
        this.$nextTick(() => (this.projectValue = (!val || val) === -1 ? '' : val))
        this.$parent.isConfirmLeave = false
      }
    }
  },
  mounted() {
    this.getCategoryProjectList()
    this.handleRouteParams()
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject', 'getMyProjectOptions']),
    handleRouteParams() {
      if (!this.keepSelection) {
        this.handleMyWorkInitRoute()
        return
      }
      const routeProjectNameParam = this.$route.params.projectName
      if (!routeProjectNameParam) return
      const project = this.projectOptions.find((option) => option.name === routeProjectNameParam)
      if (!project) {
        this.$router.replace({ name: '404' })
        return
      }
      this.setChange(project.id)
    },
    handleMyWorkInitRoute() {
      const storedProjectId = Number(sessionStorage.getItem('workProjectId'))
      if (storedProjectId) {
        this.$emit('update:project-id', storedProjectId)
      } else {
        this.$router.push({ name: 'MyWork' })
      }
    },
    showNoProjectWarning() {
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
      this.listLoading = false
    },
    setChange(projectId) {
      if (this.keepSelection) {
        if (projectId || projectId !== '') {
          this.onProjectChange(projectId)
        }
        this.setNewRoute(projectId)
      } else {
        this.$emit('update:project-id', projectId)
      }
      this.selectVisible = false
    },
    setNewRoute() {
      this.$router.push({ name: this.$route.name, params: { projectName: this.selectedProject.name }, query: this.getQuery() })
    },
    getQuery() {
      const changeProject = this.$route.params.projectName !== this.selectedProject.name
      return changeProject ? {} : this.$route.query
    },
    onProjectChange(projectId) {
      this.setSelectedProject(this.projectOptions.find((elm) => elm.id === projectId) || { id: -1 })
      localStorage.setItem('projectId', projectId)
    },
    async setStar(id, star) {
      if (star) {
        await postStarProject(id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } else {
        await deleteStarProject(id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      }
      await this.getMyProjectOptions()
      this.getCategoryProjectList()
    },
    getCategoryProjectList() {
      if ((this.selectedProjectId === -1 || !this.selectedProjectId) && !this.clearable) {
        this.showNoProjectWarning()
        return []
      }
      const filteredArray = this.projectOptions.filter(obj => {
        return obj.is_lock !== true && obj.disabled !== true
      })
      const starred = filteredArray.filter((item) => item.starred)
      const projects = filteredArray.filter((item) => !item.starred)
      this.categoryProjectList = starred.length > 0
        ? [
          { label: this.$t('Project.Starred'), options: starred },
          { options: projects }
        ]
        : [{ options: projects }]
    },
    async getSearchProject(keyword) {
      this.isSearch = true
      this.isLoading = true
      await this.getMyProjectOptions(keyword)
      this.getCategoryProjectList()
      this.isLoading = false
    },
    isSelectVisible(visible) {
      if (!visible && this.isSearch) this.getSearchProject()
      this.isSearch = false
    },
    copyUrl(text) {
      this.$copyText(text).then(
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Copied'),
          type: 'success'
        })
      )
    },
    async checkUnsavedChanges() {
      if (this.$parent.isConfirmLeave) return
      if (this.$parent.hasUnsavedChanges) {
        this.$refs.selectProject.blur()
        await this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            this.$parent.isConfirmLeave = true
          })
          .catch()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.star {
  @apply align-middle p-2 min-w-max max-w-max;
  .star-content {
    @apply align-middle inline-block cursor-pointer;
    .star-on {
      @apply text-yellow-500 text-xl rounded-md;
    }

    .star-off {
      @apply text-xl text-gray-400;
    }
  }
}

.project {
  @apply w-full;
  >>> .el-input {
    input {
      @apply bg-gray-200 rounded-md font-semibold cursor-pointer text-black text-lg truncate;
    }

    .el-input__prefix {
      @apply text-lg text-black;
    }

    .el-select__caret {
      color: #000000;
    }
  }

  .clear-btn {
    @apply w-min h-full py-2 px-2 bg-gray-400 text-white rounded-md mr-2;
  }
}

.more {
  @apply align-middle p-2 min-w-max max-w-max;
  .more-btn {
    @apply align-middle cursor-pointer p-2 bg-gray-300 rounded-md;
  }
}

.more-popover {
  @apply align-middle;
  .item {
    @apply inline-block mr-3;
  }

  .gitlab {
    @apply p-1 bg-gray-200 rounded-md px-2 mr-2 align-middle;
    .sub-item {
      @apply inline-block;
    }
  }

  .project-name {
    @apply text-sm text-gray-400;
  }
}
</style>
