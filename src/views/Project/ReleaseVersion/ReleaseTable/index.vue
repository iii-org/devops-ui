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
        :row-class-name="getRowClass"
      >
        <el-table-column
          type="expand"
          class-name="informationExpand"
        >
          <template slot-scope="{row}">
            <div class="ml-3" style="color: #409EFF;">
              {{ $t('Release.releaseNote') }}
            </div>
            <VueMarkdown class="ml-5 primary">
              {{ '\n' + row.note }}
            </VueMarkdown>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('TestCase.Index')"
          type="index"
          width="100"
          sortable
        />
        <el-table-column
          :label="$t('Issue.ReleaseTime')"
          sortable
          width="120"
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
          width="120"
        >
          <template slot-scope="scope">
            <el-link
              class="linkTextColor"
              :underline="false"
              :href="scope.row.git_url"
              target="_blank"
            >
              <span>
                <em v-if="scope.row.branch" class="ri-git-branch-line mr-1" />
                {{ scope.row.branch }}
              </span>
              <span>
                <svg-icon
                  v-if="scope.row.commit"
                  class="mr-1"
                  icon-class="ion-git-commit-outline"
                />
                {{ scope.row.commit }}
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
              :key="image.repo"
              placement="top"
              width="400"
              trigger="click"
              :open-delay="300"
              :close-delay="50"
            >
              <CommandSelector
                v-if="image"
                :scope="scope"
                :image="image"
                :idx="idx"
                @onUpdated="loadData"
              />
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
        <el-table-column
          :label="$t('Release.Tags')"
          sortable
          width="250"
        >
          <template slot-scope="scope">
            <div id="release-tag">
              <div v-if="scope.row.image_tags && scope.row.image_tags.length > 1 && !isExpand">
                <div slot="reference">
                  <el-tooltip placement="top">
                    <div slot="content">
                      {{ getImageTagsTooltip(scope.row.image_tags[0]) }}
                    </div>
                    <div class="cursor-pointer">
                      <el-tag style="font-size:14px;">
                        {{ getImageTags(scope.row.image_tags[0]) }}
                      </el-tag>
                      <span
                        :style="getStyle('menuActiveText')"
                        class="small"
                        @click="isExpand = true"
                      >
                        +{{ $t('general.SeeMore') }}
                      </span>
                    </div>
                  </el-tooltip>
                </div>
              </div>
              <div
                v-for="(tag, idx) in scope.row.image_tags"
                v-else-if="isExpand"
                :key="idx"
                placement="top"
                width="400"
                trigger="click"
                :open-delay="300"
                :close-delay="50"
              >
                <div slot="reference">
                  <el-tooltip placement="top">
                    <div slot="content">
                      {{ getImageTagsTooltip(tag) }}
                    </div>
                    <div class="cursor-pointer">
                      <el-tag style="font-size:14px;">
                        {{ getImageTags(tag) }}
                        <em
                          v-if="isEditTag"
                          class="el-icon-error cursor-pointer button"
                          :style="getStyle('danger')"
                          @click="deleteTag(scope.row, tag)"
                        />
                      </el-tag>
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('general.Actions')"
          width="200"
        >
          <template slot-scope="scope">
            <ActionInput
              :scope="scope"
              @onEditTag="onEditTag"
              @onUpdated="loadData"
              @onShowAll="isExpand = true"
            />
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
import { getReleaseVersion, deleteReleaseTag } from '@/api_v2/release'
import { BasicData, Pagination, SearchBar } from '@/newMixins'
import { UTCtoLocalTime } from '@/filters'
import variables from '@/styles/theme/variables.scss'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'ReleaseTable',
  components: {
    CommandSelector: () => import('./CommandSelector'),
    ActionInput: () => import('./ActionInput'),
    VueMarkdown: VueMarkdown
  },
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
      isExpand: false,
      isEditTag: false,
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
        name: 'ClosedIssueList',
        params: { issueTag: tag_name, projectName: this.selectedProject.name }
      })
    },
    UTCtoLocalTime(time) {
      return UTCtoLocalTime(time)
    },
    getImageTags(tag) {
      const [key] = Object.keys(tag)
      return key
    },
    getImageTagsTooltip(tag) {
      const [[value]] = Object.values(tag)
      return value
    },
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return {
        color
      }
    },
    onEditTag(isEditTag) {
      this.isEditTag = isEditTag
    },
    async deleteTag(row, tag) {
      await deleteReleaseTag(this.selectedProjectId, row.id, Object.keys(tag)[0])
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          this.loadData()
        })
    },
    getRowClass({ row }) {
      return row.note ? '' : 'row-expand-cover'
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .row-expand-cover .el-table__expand-icon {
  display: none
}
.el-link {
  font-size: 16px;
}
.small {
  font-size: 10px;
}
</style>
