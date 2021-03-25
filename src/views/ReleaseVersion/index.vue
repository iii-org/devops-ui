<script>
import { mapGetters } from 'vuex'
import { getProjectIssueListByVersion, getProjectVersion } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'

const CLOSED_STATUS = 'Closed'

export default {
  name: 'ReleaseVersion',
  components: { ProjectListSelector },
  data: () => ({
    releaseVersions: [],
    projectVersions: [],
    projectVersionOptions: [],
    openIssues: []
  }),
  computed: {
    ...mapGetters(['selectedProjectId']),
    hasOpenIssue: () => {
      // FIXME
      return false
    }
  },
  watch: {
    selectedProject() {
      this.loadData()
      this.listQuery.page = 1
      this.searchData = ''
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const res = await getProjectVersion(this.selectedProjectId)
      this.projectVersions = res.data.versions
      const options = []
      this.projectVersions.forEach(ver => {
        options.push({
          value: ver.id,
          label: ver.name
        })
      })
      this.projectVersionOptions = options
    },
    async writeNote() {
      await this.checkIssues()
    },
    async checkIssues() {
      // Check if all issues of selected versions are closed
      this.openIssues = []
      for (const vId of this.releaseVersions) {
        const params = { fixed_version_id: vId }
        const res = await getProjectIssueListByVersion(this.selectedProjectId, params)
        for (const issue of res.data) {
          if (issue['issue_status'] !== CLOSED_STATUS) {
            this.openIssues.push(issue)
          }
        }
      }
    }
  }
}
</script>

<template>
  <div class="app-container">
    <p class="clearfix">
      <b style="float: left; vertical-align: middle; padding: 10px 0; margin-right: 10px;">
        {{ $t('Project.Name') }}
      </b>
      <project-list-selector />
    </p>
    <p>
      <b style="float: left; vertical-align: middle; padding: 10px 0; margin-right: 10px;">
        {{ $t('Release.internalVersions') }}
      </b>

      <el-select
        id="release_versions"
        v-model="releaseVersions"
        :placeholder="$t('Release.selectVersion')"
        multiple
        filterable
      >
        <el-option
          v-for="item in projectVersionOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <span class="newBtn">
        <el-button type="success" @click="writeNote">
          <span class="el-icon-edit" />
          {{ $t('Release.writeNote') }}
        </el-button>
      </span>
    </p>
    <el-divider />
    <span style="color: #f56c6c;">
      {{ $t('Release.openIssueHint') }}
    </span>
  </div>
</template>

<style scoped>
.clearfix {
  clear: both;
}
</style>
