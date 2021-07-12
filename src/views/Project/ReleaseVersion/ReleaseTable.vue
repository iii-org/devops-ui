<template>
  <div>
    <el-row>
      <el-table
        ref="issueList"
        style="width: 100vw"
        :data="pagedData"
        border
        fit
        highlight-current-row
        row-key="id"
        :tree-props="{ children: 'child' }"
      >
        <el-table-column :label="$t('TestCase.Index')" type="index" sortable width="100" />
        <el-table-column :label="$t('Issue.PackageVersionTime')" sortable width="300">
          <template slot-scope="scope">
            {{ formatTime(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('Version.Version')" prop="tag_name" sortable width="120" />
        <el-table-column :label="$t('Issue.SourceCode')" sortable width="230">
          <template slot-scope="scope">
            <el-link type="primary" :underline="false" :href="scope.row.git_url" target="_blank">
              <span>
                <svg-icon class="mr-1" icon-class="mdi-branch" />{{ scope.row.branch }}
              </span>
              <span>
                <svg-icon class="mr-1" icon-class="ion-git-commit-outline" />{{ scope.row.commit }}
              </span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Issue.IssueList')" sortable>
          <template slot-scope="scope">
            <el-link type="primary" :underline="false" @click="showClosedIssue(scope.row.tag_name)">{{ scope.row.tag_name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('ProcessDevEnvironment.Image')" sortable>
          <template slot-scope="scope">
            <el-popover
              v-if="scope.row.docker"
              placement="top"
              width="400"
              trigger="hover"
              :open-delay="300"
              :close-delay="50"
            >
              <p :id="`copy-${scope.$index}`" class="text-center">
                <span class="text-subtitle-1 font-weight-bold">{{ scope.row.docker }}</span>
              </p>
              <div class="flex justify-center">
                <el-button
                  class="mr-2"
                  icon="el-icon-copy-document"
                  circle
                  size="mini"
                  @click="copyUrl(`copy-${scope.$index}`)"
                />
              </div>
              <span slot="reference">
                <el-link style="font-size: 22px" :underline="false">
                  <svg-icon icon-class="harbor" />
                </el-link>
              </span>
            </el-popover>
            <span v-else>{{ $t('Issue.NoImage') }}</span>
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
    </el-row>
  </div>
</template>

<script>
import { getReleaseVersion } from '@/api/release'
import MixinBasicTableWithProject from '@/mixins/MixinBasicTableWithProject'

export default {
  name: 'ReleaseTable',
  mixins: [MixinBasicTableWithProject],
  model: {
    prop: 'keyword',
    event: 'changed'
  },
  props: {
    keywords: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listLoading: false,
      searchKeys: ['commit', 'tag_name'],
      activeNames: []
    }
  },
  watch: {
    keywords(val) {
      this.keyword = val
    }
  },
  methods: {
    async fetchData() {
      const res = await getReleaseVersion(this.selectedProjectId)
      return res.data.plugin_list
    },
    formatTime(value) {
      const time = value.split('.')[0]
      return time
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    showClosedIssue(tag_name) {
      this.$router.push({ name: 'closed-issue-list', params: { issueTag: tag_name }})
    },
    copyUrl(id) {
      const target = document.getElementById(id)
      window.getSelection().selectAllChildren(target)
      document.execCommand('Copy')
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Copied'),
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-link {
  font-size: 16px;
}
</style>
