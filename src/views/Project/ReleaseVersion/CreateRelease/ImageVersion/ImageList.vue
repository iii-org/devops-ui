<template>
  <div class="mb-3">
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <h3 class="mr-3">映像檔清單</h3>
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
      <el-switch
        v-model="hasImage"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="僅有映像檔"
        @change="onSwitch"
      />
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
        label="程式分支"
      />
      <el-table-column
        prop="commit_id"
        label="程式提交碼"
      />
      <el-table-column label="Image">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.image" placement="top">
            <span class="cursor-pointer">{{ getImage(scope.row.image) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="提交時間">
        <template slot-scope="scope">
          <span>{{ getPushTime(scope.row.push_time) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
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
import { Table, Pagination } from '@/newMixins'

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
      this.fetchData(3)
    },
    async fetchData(limit) {
      const params = {
        branch_name: this.branch,
        only_image: this.hasImage,
        limit: limit || this.listQuery.limit,
        offset: this.listQuery.offset,
        not_all: true
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
      return this.$dayjs
        .utc(time)
        .local()
        .format('YYYY-MM-DD HH:mm:ss')
    },
    async onPagination(listQuery) {
      const { page, limit } = listQuery
      this.listQuery.offset = page * limit - limit
      await this.getImageList()
    },
    onSwitch() {
      const param = {
        page: 1,
        limit: 3
      }
      this.onPagination(param)
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
