<template>
  <el-card style="width: 80%; background-color: #dbdbdb;">
    <div class="form_item">
      <span style="padding-right: 10px;">{{ $t('Project.Version') }}</span>
      <el-select
        id="release_versions"
        v-model="selectedVersions"
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
          :type="selectedVersions.length === 0 ? 'info' : 'primary'"
          :disabled="selectedVersions.length === 0"
          @click="checkIssues"
        >
          <span class="el-icon-edit" />
          {{ $t('Release.checkIssue') }}
        </el-button>
      </span>
    </div>
    <el-skeleton v-if="isLoading" :rows="6" animated class="mt-5" />
    <el-empty v-else-if="hasNoIssue" description="此版本尚未建立議題" />
    <IssuesTable
      v-else-if="!isLoading && hasOpenIssue"
      ref="issueList"
      :all-issues.sync="allIssues"
      :project-version-options="projectVersionOptions"
      @onInit="onInit"
      @onUpdate="onInit"
    />
    <ClosedIssues
      v-else-if="!isLoading && !hasOpenIssue"
      ref="closedIssue"
      :all-issues="allIssues"
    />
    <div class="text-right">
      <el-button
        :disabled="disabled"
        @click="onNext"
      >
        下一步
        <i class="el-icon-right" />
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
  inject: ['releaseData', 'updateData'],
  data() {
    return {
      selectedVersions: [],
      projectVersions: [],
      projectVersionOptions: [],
      hasOpenIssue: false,
      hasNoIssue: false,
      isCheck: false,
      allIssues: [],
      isLoading: false
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    disabled() {
      return this.isLoading || this.hasOpenIssue || this.selectedVersions.length === 0 || !this.isCheck
    }
  },
  watch: {
    hasOpenIssue(val) {
      if (val) this.showUnClosedIssuesWarning()
    }
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
      this.isCheck = true
      this.isLoading = true
      this.hasOpenIssue = false
      this.allIssues = []
      this.selectedVersions.forEach(async (vId) => {
        const params = { fixed_version_id: vId }
        await getProjectIssueList(this.selectedProjectId, params)
          .then((res) => {
            this.getAllIssues(res.data)
          })
          .catch(() => { this.isLoading = false })
      })
    },
    getAllIssues(data) {
      if (data.length === 0) {
        this.isLoading = false
        this.hasNoIssue = true
        return
      }
      this.hasNoIssue = false
      data.forEach(async (issueJson) => {
        const issue = new Issue(issueJson)
        this.allIssues.push(issue)
        if (!issue.isClosed) {
          this.hasOpenIssue = true
        }
        this.isLoading = false
      })
    },
    showUnClosedIssuesWarning() {
      const h = this.$createElement
      this.$alert(h('div', this.$t('Release.openIssueAlert')), this.$t('general.caution'), {
        confirmButtonText: this.$t('general.Confirm')
      })
    },
    onInit() {
      this.loadData()
      this.checkIssues()
    },
    onNext() {
      this.updateData.issues = this.allIssues
      this.releaseData.versions = this.selectedVersions
      this.updateData.projectVersions = this.projectVersions
      this.$emit('onNext')
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
