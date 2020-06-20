<template>
  <div class="app-container">
    {{$route.params.issue_num}}
  </div>
</template>

<script>
import { getIssue } from '@/api/issue'
// import Pagination from '@/components/Pagination'

export default {
  // components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      console.log(this.$route.params.work_num)
      getIssue(this.$route.params.work_num).then(response => {
        console.log(response)
        // this.list = response.data.items
        // this.total = response.data.total
        this.listLoading = false
      })
    }
  }
}
</script>
