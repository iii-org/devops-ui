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
        for (let i = 0; i < searchKeys.length; i++) {
          // distinguish string and number, string to lowercase while number to string, and only Checkmarx uses number
          const columnValue =
            typeof data[searchKeys[i]] === 'string' ? data[searchKeys[i]].toLowerCase() : data[searchKeys[i]].toString()
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
