<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector>
        <el-button
          v-if="pod.has_pod"
          slot="button"
          class="buttonPrimary"
          :disabled="selectedProjectId === -1"
          @click="handleLogClick"
        >
          <em class="ri-computer-line mr-1" />
          {{ $t('SonarQube.ScanLogs') }}
        </el-button>
        <el-input
          v-model="keyword"
          :placeholder="$t('Git.searchBranchOrCommitId')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </ProjectListSelector>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="pagedData"
        fit
      >
        <el-table-column
          align="center"
          :label="$t('Postman.Id')"
          prop="id"
          width="100"
        />
        <el-table-column
          align="center"
          :label="$t('Postman.Branch')"
          prop="branch"
          min-width="120"
        />
        <el-table-column
          align="center"
          label="Commit"
          width="140"
        >
          <template slot-scope="scope">
            <el-link
              class="linkTextColor"
              target="_blank"
              style="font-size: 16px"
              :href="scope.row.commit_url"
            >
              <svg-icon
                class="mr-1"
                icon-class="ion-git-commit-outline"
              />{{ scope.row.commit_id }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('Postman.TestPass')"
          prop="success"
          min-width="100"
        />
        <el-table-column
          align="center"
          :label="$t('Postman.TestFail')"
          prop="failure"
          min-width="100"
        />
        <el-table-column-time
          :label="$t('Postman.StartTime')"
          prop="run_at"
        />
        <el-table-column
          align="center"
          :label="$t('general.Actions')"
          width="120"
        >
          <template slot-scope="scope">
            <el-button
              :id="`btn-postman-${scope.$index}`"
              size="mini"
              class="buttonPrimaryReverse"
              @click="handleClick('PostmanTestCase', scope.row.id)"
            >
              {{ $t('Postman.Postman') }}
            </el-button>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
      </el-table>
      <Pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :layout="'total, sizes, prev, pager, next'"
        @pagination="onPagination"
      />
      <PodLog
        ref="podLogDialog"
        :pod-name="pod.pod_name"
        :container-name="pod.container_name"
      />
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPostmanResult } from '@/api/postman'
import { getPostmanPod } from '@/api_v2/postman'
import { BasicData, SearchBar, Pagination, ProjectSelector } from '@/mixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'
import PodLog from '@/views/SystemResource/PluginResource/components/PodsList/components/PodLog'

export default {
  name: 'Postman',
  components: { ElTableColumnTime, PodLog },
  mixins: [BasicData, SearchBar, Pagination, ProjectSelector],
  data() {
    return {
      dialogVisible: false,
      searchKeys: ['branch', 'commit_id'],
      pod: {}
    }
  },
  computed: {
    ...mapGetters(['userRole'])
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'PostmanTestCase') {
      next((vm) => {
        vm.keyword = sessionStorage.getItem('keyword')
        sessionStorage.removeItem('keyword')
      })
    } else {
      next()
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'PostmanTestCase') {
      sessionStorage.setItem('keyword', this.keyword)
    }
    next()
  },
  methods: {
    async fetchData() {
      this.pod = (await getPostmanPod(this.selectedProjectId)).data
      return (await getPostmanResult(this.selectedProjectId)).data
    },
    handleClick(target, id) {
      this.$router.push({ name: target, params: { id, projectName: this.selectedProject.name }})
    },
    handleLogClick() {
      this.$refs.podLogDialog.fetchData(this.pod.pod_name, this.pod.container_name)
      this.$refs.podLogDialog.dialogVisible = true
    }
  }
}
</script>
