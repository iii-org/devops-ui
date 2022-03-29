<template>
  <div class="div-container">
    <el-row>
      <!-- tree-props 取消第二個子議題箭頭-->
      <el-table
        ref="issueList"
        class="w-screen"
        :data="pagedData"
        fit
        highlight-current-row
        row-key="id"
        :tree-props="{ children: 'child' }"
      >
        <el-table-column
          :label="$t('TestCase.Index')"
          type="index"
          width="100"
          sortable
        />
        <el-table-column
          :label="$t('Issue.PackageVersionTime')"
          sortable
          width="230"
        >
          <template slot-scope="scope">
            {{ UTCtoLocalTime(scope.row.create_at) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('Version.Version')"
          prop="tag_name"
          sortable
        />
        <el-table-column
          :label="$t('Issue.SourceCode')"
          sortable
          width="230"
        >
          <template slot-scope="scope">
            <el-link
              class="linkTextColor"
              :underline="false"
              :href="scope.row.git_url"
              target="_blank"
            >
              <span>
                <em class="ri-git-branch-line mr-1" />{{ scope.row.branch }}
              </span>
              <span>
                <svg-icon
                  class="mr-1"
                  icon-class="ion-git-commit-outline"
                />{{ scope.row.commit }}
              </span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('Issue.IssueList')"
          sortable
        >
          <template slot-scope="scope">
            <el-link
              class="linkTextColor"
              :underline="false"
              @click="showClosedIssue(scope.row.tag_name)"
            >{{ scope.row.tag_name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('ProcessDevEnvironment.Image')"
          sortable
        >
          <template slot-scope="scope">
            <el-popover
              v-for="(image, idx) in scope.row.docker"
              :key="image"
              placement="top"
              width="400"
              trigger="hover"
              :open-delay="300"
              :close-delay="50"
            >
              <p
                :id="`copy-${scope.$index}-${idx}`"
                class="text-center"
              >
                <span class="text-subtitle-1 font-weight-bold">{{ image }}</span>
              </p>
              <div class="flex justify-center">
                <el-button
                  class="mr-2"
                  icon="el-icon-copy-document"
                  circle
                  size="mini"
                  @click="copyUrl(`copy-${scope.$index}-${idx}`)"
                />
              </div>
              <span slot="reference">
                <el-link
                  class="text-xl mr-2"
                  :underline="false"
                >
                  <svg-icon icon-class="harbor" />
                </el-link>
              </span>
            </el-popover>
            <span v-if="scope.row.docker.length === 0">{{ $t('Issue.NoImage') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          :label="$t('Release.Tags')"
          sortable
          width="100"
        >
          <template slot-scope="scope">
            <el-tooltip
              v-for="(tag, index) in scope.row.image_tags"
              :key="index"
              placement="top"
            >
              <div slot="content">
                {{ getImageTagsTooltip(tag) }}
              </div>
              <span type="text" class="cursor-pointer">
                {{ getImageTags(tag) }}<span v-if="index !== scope.row.image_tags.length - 1">, </span>
              </span>
            </el-tooltip>
          </template>
        </el-table-column> -->
        <el-table-column
          align="center"
          :label="$t('general.Actions')"
          width="200"
        >
          <template slot-scope="scope">
            <!-- <ActionInput :scope="scope" /> -->
            <el-tooltip :content="$t('general.Report')" placement="top">
              <em
                v-show="scope.row.commit"
                class="el-icon-tickets cursor-pointer mr-2"
                @click="handleToTestReport(scope.row.commit)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <template slot="empty">
          <el-empty :description="$t('general.NoData')" />
        </template>
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
import { getReleaseVersion } from '@/api_v2/release'
import { BasicData, Pagination, SearchBar } from '@/newMixins'
import { UTCtoLocalTime } from '@/filters'

export default {
  name: 'ReleaseTable',
  // components: {
  // ActionInput: () => import('./ActionInput')
  // },
  mixins: [BasicData, Pagination, SearchBar],
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
      const res = await getReleaseVersion(this.selectedProject.id)
      return res.data.releases
    },
    formatTime(value) {
      return value.split('.')[0]
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    showClosedIssue(tag_name) {
      this.$router.push({
        name: 'closed-issue-list',
        params: { issueTag: tag_name, projectName: this.selectedProject.name }
      })
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
    },
    UTCtoLocalTime(time) {
      return UTCtoLocalTime(time)
    },
    handleToTestReport(commitId) {
      this.$router.push({
        name: 'TestReport',
        params: { commitId, projectName: this.selectedProject.name }
      })
    }
    // getImageTags(tag) {
    //   const [key] = Object.keys(tag)
    //   return key
    // },
    // getImageTagsTooltip(tag) {
    //   const [[value]] = Object.values(tag)
    //   return value
    // }
  }
}
</script>

<style lang="scss" scoped>
.el-link {
  font-size: 16px;
}
</style>
