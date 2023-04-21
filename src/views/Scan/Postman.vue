<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector>
        <ScanLogButton slot="button" />
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
          :label="$t('Log.fullLog')"
        >
          <template slot-scope="scope">
            <el-tooltip
              :id="`btn-postman-${scope.$index}`"
              placement="bottom"
<<<<<<< HEAD
              :content="$t('general.Report')"
=======
              :content="$t('Postman.Postman')"
>>>>>>> 7b6e71d1 (feat: modify table button layout)
            >
              <em
                class="ri-file-list-2-line active operate-button"
                @click="handleClick('PostmanTestCase', scope.row.id)"
              />
            </el-tooltip>
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
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPostmanResult } from '@/api/postman'
import { BasicData, SearchBar, Pagination } from '@/mixins'
import { ProjectListSelector, ElTableColumnTime } from '@/components'
import ScanLogButton from './ScanLogButton'

export default {
  name: 'Postman',
  components: {
    ProjectListSelector,
    ElTableColumnTime,
    ScanLogButton
  },
  mixins: [BasicData, SearchBar, Pagination],
  data() {
    return {
      storageName: 'postman',
      storageType: ['SearchBar'],
      dialogVisible: false,
      searchKeys: ['branch', 'commit_id']
    }
  },
  computed: {
    ...mapGetters(['userRole'])
  },
  methods: {
    async fetchData() {
      return (await getPostmanResult(this.selectedProjectId)).data
    },
    handleClick(target, id) {
      this.$router.push({ name: target, params: { id, projectName: this.selectedProject.name }})
    }
  }
}
</script>
