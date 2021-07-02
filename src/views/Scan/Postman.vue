<template>
  <el-row class="app-container">
    <el-col>
      <div class="flex justify-between">
        <project-list-selector />
        <el-input
          v-model="keyword"
          :placeholder="$t('Postman.SearchBranch')"
          style="width: 250px"
          prefix-icon="el-icon-search"
        />
      </div>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="pagedData"
        height="calc(100vh - 280px)"
        border
        fit
      >
        <el-table-column align="center" :label="$t('Postman.Id')" prop="id" width="100" />
        <el-table-column align="center" :label="$t('Postman.Branch')" prop="branch" min-width="120" />
        <el-table-column align="center" label="Commit" width="140">
          <template slot-scope="scope">
            <el-link type="primary" target="_blank" style="font-size: 16px" :href="scope.row.commit_url">
              <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.commit_id }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('Postman.TestPass')" prop="success" min-width="100" />
        <el-table-column align="center" :label="$t('Postman.TestFail')" prop="failure" min-width="100" />
        <el-table-column-time :label="$t('Postman.StartTime')" prop="run_at" />
        <el-table-column align="center" :label="$t('general.Actions')" width="120">
          <template slot-scope="scope">
            <!-- <el-button
              :id="`btn-devops-${scope.$index}`"
              size="mini"
              type="primary"
              plain
              @click="handleClick('devops-test-case', scope.row.id)"
            >
              {{ $t('Postman.DevOps') }}
            </el-button> -->
            <el-button
              :id="`btn-postman-${scope.$index}`"
              size="mini"
              type="primary"
              @click="handleClick('postman-test-case', scope.row.id)"
            >
              {{ $t('Postman.Postman') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="filteredData.length"
        :page="listQuery.page"
        :limit="listQuery.limit"
        :page-sizes="[listQuery.limit]"
        :layout="'total, prev, pager, next'"
        @pagination="onPagination"
      />
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { getPostmanResult } from '@/api/postman'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'
import ElTableColumnTime from '@/components/ElTableColumnTime'

export default {
  name: 'Postman',
  components: { ElTableColumnTime },
  mixins: [BasicData, SearchBar, Pagination, Table, ProjectSelector],
  data() {
    return {
      dialogVisible: false,
      searchKeys: ['branch']
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
      this.$router.push({ name: target, params: { id } })
    }
  }
}
</script>
