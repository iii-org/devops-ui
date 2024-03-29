<template>
  <el-row class="app-container">
    <el-col>
      <div>
        <span class="ml-2 text-xl">
          <span>
            {{ $t('route.Monitoring') }}
          </span>
        </span>
      </div>
      <el-divider />
      <el-card>
        <el-table
          :data="listData"
          fit
        >
          <el-table-column
            :label="$t('ServiceMonitoring.Services')"
            align="center"
            width="200"
            prop="name"
          />
          <el-table-column
            :label="$t('ServiceMonitoring.Health')"
            align="center"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getTagType(scope.row.status)"
                effect="dark"
              >
                {{ $t(`ServiceMonitoring.${scope.row.status}`) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('ServiceMonitoring.Logs')"
            align="center"
          >
            <template slot-scope="scope">
              <el-skeleton
                v-if="scope.row.status === 'loading'"
                :rows="1"
                animated
              />
              <div v-else-if="!scope.row.message">-</div>
              <div v-else>{{ scope.row.message }}</div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('ServiceMonitoring.LastUpdateTime')"
            align="center"
            prop="datetime"
            width="200"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.status === 'loading'">
                {{ $t('Loading') }}
              </div>
              <div v-else>
                {{ scope.row.datetime }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('general.Actions')"
            align="center"
            width="200"
          >
            <template slot-scope="scope">
              <el-tooltip
                placement="bottom"
                :content="$t('ServiceMonitoring.CheckNow')"
              >
                <em
                  :class="scope.row.status === 'loading'
                    ? 'ri-loader-2-line disabled operate-button'
                    : 'ri-refresh-line finished operate-button'"
                  @click="handleCheck(scope.row.name)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { getLocalTime } from '@/utils/handleTime'
import { getSystemServerList, getServerStatus } from '@/api_v2/monitoring'

export default {
  name: 'ServiceMonitoring',
  data() {
    return {
      listData: []
    }
  },
  mounted() {
    this.loadData()
    this.handleUpdate()
  },
  methods: {
    async loadData() {
      this.listData = (await getSystemServerList()).data.map((item) => ({
        name: item,
        status: 'loading'
      }))
      this.listData.forEach((item) => {
        this.fetchData(item.name)
      })
    },
    async fetchData(name) {
      await getServerStatus(name.toLowerCase()).then((res) => {
        const idx = this.listData.findIndex((item) => item.name === res.name)
        this.$set(this.listData, idx, this.handleData(res))
      })
    },
    handleUpdate() {
      const tenMinutes = 1000 * 60 * 10
      let timer = window.setInterval(async () => {
        await this.loadData()
      }, tenMinutes)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(timer)
        timer = null
      })
    },
    handleData(res) {
      if (res.name === 'Harbor nfs folder storage remain.') res.name = 'Harbor'
      const datetime = getLocalTime(res.datetime)
      res.datetime = datetime
      return res
    },
    getTagType(status) {
      if (status === 'loading') return 'warning'
      else if (status) return 'success'
      else return 'danger'
    },
    async handleCheck(name) {
      const idx = this.listData.findIndex((item) => item.name === name)
      this.$set(this.listData[idx], 'status', 'loading')
      await getServerStatus(name.toLowerCase()).then((res) => {
        this.$set(this.listData, idx, this.handleData(res))
      })
    }
  }
}
</script>
