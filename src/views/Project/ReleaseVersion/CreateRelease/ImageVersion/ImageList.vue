<template>
  <div class="mb-3">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <h3 class="mr-3">{{ $t('Release.ImageList') }}</h3>
        <div>
          <el-select
            v-if="branches.length > 0"
            v-model="branch"
            filterable
            @change="getImageList()"
          >
            <el-option
              v-for="item in branches"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
      </div>
      <div>
        <el-switch
          v-model="hasAllCommit"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-text="$t('Release.RenderAllCommit')"
          class="mr-2"
          @change="onSwitch"
        />
        <el-switch
          v-model="hasImage"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-text="$t('Release.OnlyImage')"
          @change="onSwitch"
        />
      </div>
    </div>
    <el-table
      ref="imageList"
      v-loading="isLoading"
      row-class-name="imageList"
      :data="imageList"
      highlight-current-row
      @current-change="handleCurrentChange"
      @row-click="handleRowClick"
    >
      <el-table-column
        prop="branch"
        :label="$t('general.Branch')"
      />
      <el-table-column
        prop="commit_id"
        :label="$t('general.Commit')"
      />
      <el-table-column label="Image">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.commit_message" placement="top">
            <span class="cursor-pointer">{{ getImage(scope.row.image) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Release.CommitTime')">
        <template slot-scope="scope">
          <span>{{ getPushTime(scope.row.push_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Release.TableReleaseVersion')">
        <template slot-scope="scope">
          <span>{{ scope.row.tag ? scope.row.tag : '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="listQuery.total"
      :page="listQuery.current"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getImageList } from '@/api_v2/release'
import { Table, Pagination } from '@/mixins'
import { getLocalTime } from '@/utils/handleTime'

const initParam = {
  page: 1,
  limit: 3
}

export default {
  name: 'ImageList',
  mixins: [Table, Pagination],
  props: {
    branches: {
      type: Array,
      default: () => []
    },
    commitId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false,
      imageList: [],
      branch: 'master',
      hasImage: true,
      hasAllCommit: false,
      currentRow: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  mounted() {
    this.getImageList()
  },
  methods: {
    getImageList() {
      this.fetchData(5)
    },
    async fetchData(limit) {
      const params = {
        branch_name: this.branch,
        only_image: this.hasImage,
        limit: limit || this.listQuery.limit,
        offset: this.listQuery.offset,
        not_all: !this.hasAllCommit
      }
      if (params.limit === 0) return
      this.isLoading = true
      await getImageList(this.selectedProjectId, params)
        .then((res) => {
          this.handleImageListData(res.data.image_list)
          this.listQuery = res.data.page
        })
        .catch((err) => console.error(err))
        .finally(() => {
          this.isLoading = false
        })
    },
    handleImageListData(list) {
      this.imageList = list.map(image => {
        if (image.commit_id === this.commitId) {
          this.$refs.imageList.setCurrentRow(image)
        }
        image.branch = this.branch
        return image
      })
    },
    getImage(image) {
      return image ? image.substr(0, 15) : '-'
    },
    getPushTime(time) {
      return getLocalTime(time)
    },
    async onPagination(listQuery) {
      const { page, limit } = listQuery
      this.listQuery.offset = page * limit - limit
      await this.getImageList()
    },
    onSwitch() {
      this.onPagination(initParam)
    },
    handleCurrentChange(row) {
      this.currentRow = row
    },
    handleRowClick(row) {
      this.$refs.imageList.setCurrentRow(row)
      this.$emit('onChangeImage', row)
    }
  }
}
</script>
