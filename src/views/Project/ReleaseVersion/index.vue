<template>
  <div class="app-container">
    <el-row>
      <el-col>
        <ProjectListSelector>
          <div slot="button">
            <el-button
              type="success"
              @click="toggleCreateRelease"
            >
              <span class="el-icon-goods" />
              <span v-if="state === 'STATE_CREATE_RELEASE'">{{ $t('Release.stopRelease') }}</span>
              <span v-else>{{ $t('Release.startRelease') }}</span>
            </el-button>
            <el-button
              type="primary"
              @click="isShowVersions = !isShowVersions"
            >
              <span class="el-icon-document" />
              <span>{{ $t('Version.Manage') }}</span>
            </el-button>
          </div>
          <el-input
            v-model="keywords"
            style="width: 250px; float: right;"
            :placeholder="$t('Project.SearchProjectNameOrId')"
            prefix-icon="el-icon-search"
          />
        </ProjectListSelector>
      </el-col>
    </el-row>
    <el-divider />
    <ReleaseTable v-if="state === 'STATE_INIT'" :keywords="keywords" />
    <CreateRelease v-else-if="state === 'STATE_CREATE_RELEASE'" />
    <el-dialog :visible.sync="isShowVersions" width="60%">
      <ProjectVersions v-if="isShowVersions" :is-show-title="true" />
    </el-dialog>
  </div>
</template>

<script>
import ProjectListSelector from '@/components/ProjectListSelector'

const STATE_INIT = 0
const STATE_CREATE_RELEASE = 1

export default {
  name: 'ReleaseVersion',
  components: {
    ProjectListSelector,
    ReleaseTable: () => import('./ReleaseTable'),
    CreateRelease: () => import('./CreateRelease'),
    ProjectVersions: () => import('@/views/Plan/Settings/components/ProjectVersions')
  },
  data() {
    return {
      isCheckRelease: false,
      isShowVersions: false,
      state: 'STATE_INIT',
      STATE_INIT: STATE_INIT,
      STATE_CREATE_RELEASE: STATE_CREATE_RELEASE,
      keywords: ''
    }
  },
  methods: {
    toggleCreateRelease() {
      if (this.state === 'STATE_INIT') this.state = 'STATE_CREATE_RELEASE'
      else this.state = 'STATE_INIT'
    }
  }
}

</script>
