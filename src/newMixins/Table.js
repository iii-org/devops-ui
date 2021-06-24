export default {
  data() {
    return {
      rowHeight: 53, // If you can, detect the real thread cell height
      afterInit: false,
      resizing: false,
      timeout: false,
      resizeTime: new Date(),
      delta: 500
    }
  },
  async mounted() {
    await this.initTableData()

    window.onresize = () => {
      this.resizeTime = new Date()
      if (this.timeout === false) {
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
      this.$nextTick(async function() {
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
          this.listQuery.limit = Math.floor(tableHeight / this.rowHeight)
        }

        this.listQuery.page = Math.ceil(this.listQuery.offset / this.listQuery.limit)
      })
    },
    adjustTable(forceRowNum) {
      this.$nextTick(function() {
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
