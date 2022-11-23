import axios from 'axios'
const CancelToken = axios.CancelToken

export default {
  data() {
    return {
      cancelToken: null,
      cancel: null
    }
  },
  created () {
    this.setCancelToken()
  },
  methods: {
    setCancelToken() {
      this.cancelToken = new CancelToken(c => {
        this.cancel = c
      })
    },
    cancelRequest() {
      this.cancel()
      this.setCancelToken()
    }
  }
}
