<script>
import { mapGetters } from 'vuex'
import { getProjectVersion } from '@/api/projects'
import ProjectListSelector from '@/components/ProjectListSelector'

export default {
  name: 'ReleaseVersion',
  components: { ProjectListSelector },
  data: () => ({
    releaseVersions: [],
    projectVersions: [],
    projectVersionOptions: []
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
    writeNote() {
      // TODO
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

    <el-table
      v-if="hasOpenIssue"
      v-loading="listLoading"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      :data="pagedData"
      height="100%"
    >
    </el-table>
  </div>
</template>

<style scoped>
.clearfix {
  clear: both;
}
</style>
