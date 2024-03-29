/**
 * ! Before using this module, you need to know:
 * 1. The main feature of pagination mixins is offer pagedData.
 * 2. Define function for saving page information in sessionStorage.
 *    ! Have to define storageName if you want to save page info.
 */

import { mapActions } from 'vuex'
import { Pagination } from '@/components'

/**
 * * How to use Pagination component
 * ! for required
 * ? for optional
 *
 * ! @total {Number}
 * ! @page {Number}
 * ! @limit {Number}
 * ! @pageSizes {Array}
 * ! @layout {String}
 * ? @background {Boolean}
 * ? @autoScroll {Boolean}
 * ? @hidden {Boolean}
 * ! @pagination {Function}
 *
 * * Component example
 *  <Pagination
 *    :total="listQuery.total"
 *    :page.sync="listQuery.current"
 *    :limit="listQuery.limit"
 *    :page-sizes="[10, 25, 50, 100]"
 *    :layout="'total, sizes, prev, pager, next'"
 *    :background="true"
 *    :auto-scroll="true"
 *    :hidden="true"
 *    @pagination="onPagination or handleCurrentChange"
 *  />
 */

export default {
  components: { Pagination },
  data() {
    return {
      storageName: '',
      listQuery: {
        offset: 0,
        limit: 10,
        total: 0,
        page: 1
      }
    }
  },
  computed: {
    pagedData() {
      if (this.remote) { return [] }
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      if (!this.filteredData) return
      return this.filteredData.slice(start, end)
    }
  },
  watch: {
    selectedProject() {
      this.listQuery.page = 1
    },
    filterValue: {
      handler() {
        this.listQuery.page = 1
        this.listQuery.offset = 0
      },
      deep: true
    }
  },
  async mounted() {
    // await this.getStoredListQuery()
  },
  methods: {
    ...mapActions('projects', ['getListQuery', 'setListQuery']),
    async onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async getStoredListQuery() {
      if (!this.storageName) return
      const key = this.storageName
      const storeListQuery = await this.getListQuery()
      const storedTabQuery = storeListQuery[key]
      if (storedTabQuery !== undefined) {
        this.listQuery = storedTabQuery
      }
      return Promise.resolve()
    },
    async handleCurrentChange(val) {
      this.listQuery.offset = val.limit * val.page - val.limit
      this.listQuery.limit = val.limit
      this.listQuery.page = val.page
      await this.loadData()
      if (this.storageName) {
        const key = this.storageName
        const storeListQuery = await this.getListQuery()
        storeListQuery[key] = this.listQuery
        await this.setListQuery(storeListQuery)
      }
    },
    setNewListQuery(pageInfo) {
      const { offset, limit, current, total, pages } = pageInfo
      if (pages !== 0 && current > pages) {
        this.resetListQuery()
      } else {
        this.listQuery = { offset, limit, total, page: current }
      }
    },
    async resetListQuery() {
      this.listQuery.offset = 0
      this.listQuery.page = 1
      if (this.storageName) {
        const key = this.storageName
        const storeListQuery = await this.getListQuery()
        storeListQuery[key] = this.listQuery
        await this.setListQuery(storeListQuery)
      }
      await this.loadData()
    }
  }
}
