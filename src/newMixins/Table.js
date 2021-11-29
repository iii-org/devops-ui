export default {
  data() {
    return {
      tableHeight: '60vh',
      rowHeight: 53, // If you can, detect the real thread cell height
      afterInit: false,
      resizing: false,
      timeout: false,
      resizeTime: new Date(),
      delta: 500
    }
  },
  async mounted() {
    this.$nextTick(() => {
      if (this.$refs['wrapper']) {
        this.tableHeight = this.$refs['wrapper'].clientHeight
      }
    })
    await this.initTableData()

    window.onresize = () => {
      this.$nextTick(() => {
        if (this.$refs['wrapper']) {
          this.tableHeight = this.$refs['wrapper'].clientHeight
        }
      })
      this.resizeTime = new Date()
      if (!this.timeout) {
        this.timeout = true
        setTimeout(this.afterResize, this.delta)
      }
    }
  },
  methods: {
    async initTableData() {
      if (this.remote) {
        await this.adjustTableRemote()
        if (this.afterInit) {
          await this.loadData()
        }
      } else {
        await this.adjustTable()
      }
    },
    async afterResize() {
      if (new Date() - this.resizeTime < this.delta) {
        setTimeout(this.afterResize, this.delta)
      } else {
        this.timeout = false
        await this.initTableData()
      }
    },
    adjustTableRemote(forceRowNum) {
      this.$nextTick(async () => {
        let siblingsHeight = 0
        const $table = this.$el.getElementsByClassName('el-table__body')[0]
        if (!$table) {
          return // Component not ready yet, will be called after
        }
        const parentNode = $table.parentNode
        const parentHeight = parentNode.clientHeight
        for (const child of $table.getElementsByClassName('el-table__row')) {
          if (child.className.match(/\bel-table__row\b/)) continue
          siblingsHeight += child.clientHeight
          const styles = window.getComputedStyle(child)
          siblingsHeight += parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])
        }
        const tableHeight = parentHeight - siblingsHeight
        if (!this.afterInit) {
          await this.initTableData()
        }
        this.afterInit = true

        if (forceRowNum) {
          this.listQuery.limit = forceRowNum
        } else {
          this.listQuery.limit = Math.floor(tableHeight / this.rowHeight) - 1
        }
        const nowPage = Math.ceil((this.listQuery.offset + 1) / this.listQuery.limit)
        if (nowPage <= 0) {
          this.listQuery.page = 1
        } else {
          this.listQuery.page = nowPage
        }
      })
    },
    adjustTable(forceRowNum) {
      this.$nextTick(() => {
        let siblingsHeight = 0
        const $table = this.$el.getElementsByClassName('el-table')[0]
        if (!$table) {
          return // Component not ready yet, will be called after
        }
        const parentNode = $table.parentNode
        const parentHeight = parentNode.clientHeight
        for (const child of parentNode.children) {
          if (child.className.match(/\bel-table\b/)) continue
          siblingsHeight += child.clientHeight
          const styles = window.getComputedStyle(child)
          siblingsHeight += parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])
        }
        const tableHeight = parentHeight - siblingsHeight
        if (forceRowNum) {
          this.listQuery.limit = forceRowNum
        } else {
          this.listQuery.limit = Math.floor(tableHeight / this.rowHeight)
        }
      })
    }
  }
}
