import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      searchKeys: ['name'],
      keyword: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    filteredData() {
      const { listData, searchKeys } = this
      const keyword = this.keyword.toLowerCase()
      if (!listData) return
      return listData.filter(data => {
        let result = false
        for (const value of searchKeys) {
          // distinguish string and number, string to lowercase while number to string, and only Checkmarx uses number
          if (data[value] === null) data[value] = ''
          const columnValue =
            typeof data[value] === 'string' ? data[value].toLowerCase() : data[value].toString()
          result = result || columnValue.includes(keyword)
          if (result) break
        }
        return result
      })
    }
  },
  watch: {
    keyword() {
      this.listQuery.page = 1
    },
    watch: {
      selectedProject() {
        this.keyword = ''
      }
    }
  }
}
