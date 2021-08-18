<template>
  <el-row type="flex" justify="space-between" align="middle">
    <el-col :span="10" class="align-middle">
      <el-row type="flex" justify="start" align="middle">
        <el-col class="star">
          <div v-if="projectValue===''" />
          <div v-else-if="projectInformation.starred" class="star-content" @click="setStar(projectValue, false)">
            <i class="el-icon-star-on star-on" />
          </div>
          <div v-else class="star-content" @click="setStar(projectValue, true)">
            <i class="el-icon-star-off star-off" />
          </div>
        </el-col>
        <el-col>
          <el-select
            ref="selectProject"
            v-model="projectValue"
            :placeholder="$t('Project.SelectProject')"
            filterable
            class="project"
            :clearable="clearable"
            @focus="checkUnsavedChanges"
            @blur="selectVisible=false"
            @change="setChange"
          >
            <template slot="prefix"><i class="el-icon-s-cooperation el-input__icon" /></template>
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
        <el-col v-if="projectValue!==''" class="more">
          <el-popover placement="right">
            <div class="more-popover">
              <div class="item gitlab">
                <svg-icon icon-class="gitlab" class="text-xl" />
                <div class="sub-item">
                  <el-button
                    icon="el-icon-copy-document"
                    circle
                    size="mini"
                    @click="copyUrl(projectInformation.git_url)"
                  />
                  <a :href="projectInformation.git_url" target="_blank">
                    <el-button circle size="mini">
                      <svg-icon icon-class="foreign" />
                    </el-button>
                  </a>
                </div>
              </div>
              <el-link target="_blank" class="item" :underline="false" :href="projectInformation.redmine_url">
                <svg-icon icon-class="redmine" class="text-xl" />
              </el-link>
              <el-link target="_blank" class="item" :underline="false" :href="projectInformation.harbor_url">
                <svg-icon icon-class="harbor" class="text-xl" />
              </el-link>
              <div class="item project-name">
                #{{ projectInformation.name }}
              </div>
            </div>
            <div slot="reference" class="more-btn">
              <i class="el-icon-more" />
            </div>
          </el-popover>
        </el-col>
      </el-row>
    </el-col>
    <el-col>
      <el-row type="flex" justify="space-between" align="middle">
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
    keepSelection: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: false
    },
    hasUnsavedChanges: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      projectValue: '',
      selectVisible: false,
      toolbarVisible: false,
      categoryProjectList: []
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'selectedProject', 'selectedProjectId']),
    projectInformation() {
      const item = this.projectOptions.find((item) => (item.id === this.projectValue))
      if (!item) return { display: this.$t('general.All') }
      return item
    }
  },
  watch: {
    selectedProjectId: {
      immediate: true,
      handler(val) {
        if (this.keepSelection) {
          this.$nextTick(() => {
            if (!val || val === -1) {
              this.projectValue = ''
            }
            this.projectValue = val
          })
        }
      }
    },
    projectValue(value) {
      this.setChange(value)
    }
  },
  mounted() {
    this.getCategoryProjectList()
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject', 'getMyProjectOptions']),
    showNoProjectWarning() {
      // noinspection JSCheckFunctionSignatures
      this.$message({
        title: this.$t('general.Warning'),
        message: this.$t('Notify.NoProject'),
        type: 'warning'
      })
      this.listLoading = false
    },
    setChange(value) {
      if (this.keepSelection) {
        if (value || value !== '') {
          this.onProjectChange(value)
        }
      } else {
        this.$emit('change', value)
      }
      this.selectVisible = false
    },
    onProjectChange(value) {
      localStorage.setItem('projectId', value)
      this.setSelectedProject(this.projectOptions.find(elm => elm.id === value))
    },
    async setStar(id, star) {
      if (star) {
        await postStarProject(id)
        await this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } else {
        await deleteStarProject(id)
        await this.$message({
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
      const starred = this.projectOptions.filter((item) => (item.starred))
      const projects = this.projectOptions.filter((item) => (!item.starred))
      this.categoryProjectList = [{
        label: this.$t('Project.Starred'),
        options: starred
      }, { options: projects }]
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
    checkUnsavedChanges(event) {
      if (this.hasUnsavedChanges) {
        setTimeout(() => {
          this.$refs.selectProject.blur()
        }, 50)
        this.$emit('checkUnsavedChanges')
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
  > > > .el-input {
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
      @apply inline-block
    }
  }

  .project-name {
    @apply text-sm text-gray-400;
  }
}
</style>
