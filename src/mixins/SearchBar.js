/**
 * ! Before using this module, you need to know:
 * 1. The main feature of searchBar mixins is offer filteredData.
 * 2. Define function for saving keyword information in sessionStorage.
 *    ! Have to define storageName if you want to save keyword info.
 */

import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      storageName: '',
      searchKeys: ['name'],
      keyword: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject']),
    filteredData() {
      const { listData, searchKeys } = this
      const keyword = this.keyword ? this.keyword.toLowerCase() : ''
      if (!listData) return
      return listData.filter(data => {
        let result = false
        for (const value of searchKeys) {
          // distinguish string and number, string to lowercase while number to string, and only Checkmarx uses number
          if (data[value] === null) data[value] = ''
          const columnValue =
            typeof data[value] === 'string' ? data[value].toLowerCase() : data[value]?.toString()
          result = result || columnValue?.includes(keyword)
          if (result) break
        }
        return result
      })
    }
  },
  watch: {
    keyword() {
      this.listQuery.page = 1
      if (this.storageName) this.storeKeyword()
    },
    watch: {
      selectedProject() {
        this.keyword = ''
      }
    }
  },
  async mounted() {
    // await this.getInitStoredKeywordData()
  },
  methods: {
    ...mapActions('projects', ['getKeyword', 'setKeyword']),
    async getInitStoredKeywordData() {
      if (!this.storageName) return
      const key = this.storageName
      const storedData = await this.fetchStoredKeywordData()
      const { storedKeyword } = storedData
      this.keyword = storedKeyword[key] ? storedKeyword[key] : null
    },
    async fetchStoredKeywordData() {
      let storedKeyword
      await this.getKeyword().then((res) => {
        const keyword = res
        storedKeyword = keyword
      })
      return { storedKeyword }
    },
    async storeKeyword() {
      if (this.storageName) {
        const key = this.storageName
        const storedData = await this.fetchStoredKeywordData()
        const { storedKeyword } = storedData
        storedKeyword[key] = this.keyword
        await this.setKeyword(storedKeyword)
      }
    },
    async clearKeyword() {
      this.keyword = ''
      if (this.storageName) {
        const key = this.storageName
        const storedData = await this.fetchStoredKeywordData()
        const { storedKeyword } = storedData
        storedKeyword[key] = this.keyword
        await this.setKeyword(storedKeyword)
      }
    }
  }
}
