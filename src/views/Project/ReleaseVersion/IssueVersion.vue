<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <div class="form_item">
      <span style="padding-right: 10px;">{{ $t('Project.Version') }}</span>
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
      <span class="ml-3">
        <el-button
          :type="releaseVersions.length === 0 ? 'info' : 'primary'"
          :disabled="releaseVersions.length === 0"
          @click="checkIssues"
        >
          <span class="el-icon-edit" />
          {{ $t('Release.checkIssue') }}
        </el-button>
      </span>
    </div>
    <el-skeleton v-if="isLoading" :rows="6" animated class="mt-5" />
    <IssuesTable
      v-else-if="!isLoading && hasOpenIssue"
      ref="issueList"
      :all-issues="allIssues"
      @init="loadData"
    />
    <ClosedIssues
      v-else-if="!isLoading && !hasOpenIssue"
      ref="closedIssue"
      :all-issues="allIssues"
    />
    <div class="text-right">
      <el-button
        :disabled="isLoading || hasOpenIssue"
        @click="nextStep"
      >
        下一步
      </el-button>
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectVersion, getProjectIssueList } from '@/api_v2/projects'
import Issue from '@/data/issue.js'

export default {
  name: 'IssueVersion',
  components: {
    IssuesTable: () => import('./IssuesTable'),
    ClosedIssues: () => import('./ClosedIssues')
  },
  data() {
    return {
      releaseVersions: [],
      projectVersions: [],
      projectVersionOptions: [],
      hasOpenIssue: false,
      allIssues: [],
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const res = await getProjectVersion(this.selectedProjectId)
      this.projectVersions = res.data.versions.filter((ver) => ver.status !== 'closed')
      const options = []
      this.projectVersions.forEach((ver) => {
        options.push({
          value: ver.id,
          label: ver.name
        })
      })
      this.projectVersionOptions = options
    },
    async checkIssues() {
      // Check if all issues of selected versions are closed
      this.isLoading = true
      this.hasOpenIssue = false
      this.allIssues = []
      this.releaseVersions.forEach(async (vId) => {
        const params = { fixed_version_id: vId }
        await getProjectIssueList(this.selectedProjectId, params)
          .then((res) => this.getAllIssues(res.data))
          .catch(() => { this.isLoading = false })
      })
    },
    getAllIssues(data) {
      data.forEach(async (issueJson) => {
        const issue = new Issue(issueJson)
        console.log(issue)
        this.allIssues.push(issue)
        console.log(this.allIssues)
        if (!issue.isClosed) {
          this.hasOpenIssue = true
          // await this.showOpenIssues()
        }
        this.isLoading = false
      })
    },
    // async showOpenIssues() {
    // if (!this.fromQuery) {
    //   const h = this.$createElement
    //   this.$alert(h('div', this.$t('Release.openIssueAlert')), this.$t('general.caution'), {
    //     confirmButtonText: this.$t('general.Confirm')
    //   })
    // }
    // this.$nextTick(() => {
    //   this.$refs.issueList.setData(this.allIssues)
    // })
    // },
    nextStep() {
      this.$emit('onNextStep')
    }
  }
}
</script>

<style lang="scss" scoped>
.form_item {
  padding: 10px 10px;
  font-weight: bold;
  font-size: 14px;
  vertical-align: middle;
  color: #606266;
  line-height: 40px;
  box-sizing: border-box;
}
</style>
