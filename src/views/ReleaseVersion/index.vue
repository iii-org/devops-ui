<script>
import { mapGetters } from 'vuex'
import { getProjectIssueListByVersion, getProjectVersion } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'
import OpenIssuesTable from '@/views/ReleaseVersion/OpenIssuesTable'
import CreateRelease from '@/views/ReleaseVersion/CreateRelease'

const STATE_INIT = 0
const STATE_SHOW_OPEN_ISSUES = 1
const STATE_CREATE_RELEASE = 2

const CLOSED_STATUS = 'Closed'

export default {
  name: 'ReleaseVersion',
  components: { CreateRelease, OpenIssuesTable, ProjectListSelector },
  data: () => ({
    state: STATE_INIT,
    allIssues: [],
    fullscreenLoading: false,
    fromQuery: false,
    openIssues: [],
    projectVersions: [],
    projectVersionOptions: [],
    releaseVersions: [],
    STATE_INIT: STATE_INIT,
    STATE_SHOW_OPEN_ISSUES: STATE_SHOW_OPEN_ISSUES,
    STATE_CREATE_RELEASE: STATE_CREATE_RELEASE
  }),
  computed: {
    ...mapGetters(['selectedProjectId'])
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
    const vsString = this.$route.query.versions
    if (vsString) {
      this.checkQuery(vsString)
    }
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
    checkQuery(vsString) {
      this.fromQuery = true
      this.releaseVersions = JSON.parse(`[${vsString}]`)
      this.startRelease()
    },
    writeNote() {
      this.fromQuery = false
      this.startRelease()
    },
    async startRelease() {
      this.fullscreenLoading = true
      if (!this.fromQuery) {
        const vsString = JSON.stringify(this.releaseVersions)
        this.$router.push({
          path: '', query: {
            versions: vsString.substring(1, vsString.length - 1)
          }
        })
      }
      await this.checkIssues()
      if (this.openIssues.length > 0) {
        this.listOpenIssues()
      } else {
        this.showCreateRelease()
      }
      this.fullscreenLoading = false
    },
    async checkIssues() {
      // Check if all issues of selected versions are closed
      this.allIssues = []
      this.openIssues = []
      for (const vId of this.releaseVersions) {
        const params = { fixed_version_id: vId }
        const res = await getProjectIssueListByVersion(this.selectedProjectId, params)
        for (const issue of res.data) {
          this.allIssues.push(issue)
          if (issue['issue_status'] !== CLOSED_STATUS) {
            this.openIssues.push(issue)
          }
        }
      }
    },
    listOpenIssues() {
      if (!this.fromQuery) {
        const h = this.$createElement
        this.$alert(
          h('div', this.$t('Release.openIssueAlert')),
          this.$t('general.caution'),
          {
            confirmButtonText: this.$t('general.Confirm')
          })
      }
      this.state = STATE_SHOW_OPEN_ISSUES
      this.$refs.openIssues.setData(this.openIssues)
    },
    showCreateRelease() {
      this.$refs.createRelease.setIssues(this.allIssues)
      this.state = STATE_CREATE_RELEASE
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
        <el-button v-loading.fullscreen.lock="fullscreenLoading" type="success" @click="writeNote">
          <span class="el-icon-edit" />
          {{ $t('Release.writeNote') }}
        </el-button>
      </span>
    </p>
    <el-divider />
    <span v-if="state === STATE_INIT" style="color: #f56c6c;">
      {{ $t('Release.openIssueHint') }}
    </span>
    <open-issues-table v-show="state == STATE_SHOW_OPEN_ISSUES" ref="openIssues" />
    <create-release v-show="state == STATE_CREATE_RELEASE" ref="createRelease" />
  </div>
</template>

<style scoped>
.clearfix {
  clear: both;
}
</style>
