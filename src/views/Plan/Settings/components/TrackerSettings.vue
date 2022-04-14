<template>
  <div class="app-container">
    <div class="flex justify-between mt-3">
      <div class="font-medium text-lg">{{ $t('ProjectSettings.IssueReminderFeature') }}</div>
      <div>
        <el-switch
          v-model="isToggle"
          inactive-color="#ff4949"
          class="mr-5"
          :disabled="disableSwitch"
          :active-text="$t('general.Enable')"
          :inactive-text="$t('general.Disable')"
          @change="toggleSwitch"
        />
        <el-button class="buttonPrimary" :disabled="!isToggle" @click="handleSave">{{ $t('general.Save') }}</el-button>
      </div>
    </div>
    <el-divider />
    <div v-show="isToggle">
      <el-table
        ref="multipleTable"
        v-loading="listLoading"
        :element-loading-text="$t('Loading')"
        :data="tracker"
        border
        fit
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" align="center" :label="$t('ProjectSettings.Index')" width="100" />
        <el-table-column align="center" :label="$t('ProjectSettings.NotificationConditions')">
          <template slot-scope="scope">
            {{ $t(`Issue.${scope.row.name}`) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          type="selection"
          width="200"
          property="isEnabled"
        />
        <!-- <el-table-column label="status" width="120"> 
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.isEnabled" :checked="scope.row.isEnabled" @change="handleCheckChange(scope.row)" />
          </template>
        </el-table-column>        -->
      </el-table>
    </div>
    <div v-if="!isToggle" class="text-center">{{ $t('ProjectSettings.NotYetEnabled') }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { changeProjectAlertSettings, updateAlertSettingsByProject } from '@/api/alert'
import { getIssueForceTracker } from '@/api_v2/issue'

export default {
  name: 'AlertSettings',
  data() {
    return {
      listLoading: false,
      disableSwitch: true,
      isToggle: false,
      alertList: [],
      originData: [],
      trackerList: [],
      currentForceTracker: [],
      need_fatherissue_trackers: [{
        id: 1,
        name: 'Epic'
      }, {
        id: 2,
        name: 'Audit'
      }]
    }
  },
  computed: {
    ...mapGetters(['tracker', 'selectedProjectId']),
    hasUnsavedChanges() {
      return this.isTableDataChanged(0) || this.isTableDataChanged(1)
    }
  },
  watch: {
    selectedProjectId: {
      handler(val) {
        this.disableSwitch = val === -1
      },
      immediate: true
    }
    // isToggle() {
    //   this.toggleSelection(this.currentForceTracker)
    // }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await getIssueForceTracker(this.selectedProjectId)
      this.isToggle = res.data.enable
      this.currentForceTracker = this.need_fatherissue_trackers
      console.log(this.tracker[1])
      console.log(this.need_fatherissue_trackers[1])
      this.toggleSelection([this.tracker[1]])
    },
    getRowKeys(row) {
      return row.id
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    async toggleSwitch(bool) {
      const param = {}
      param.enable = bool
      // this.listLoading = true
      // await changeProjectAlertSettings(this.selectedProjectId, param)
      //   .then(_ => {
      //     this.loadData()
      //     this.showChangeMessage(bool)
      //   })
      //   .catch(err => {
      //     this.listLoading = false
      //     return err
      //   })
    },
    showChangeMessage(bool) {
      this.$message({
        title: this.$t('general.Success'),
        message: bool ? this.$t('ProjectSettings.EnableMessage') : this.$t('ProjectSettings.DisableMessage'),
        type: 'success'
      })
    },
    toggleSelection(rows) {
      console.log(rows)
      console.log(this.$refs.multipleTable)
      if (this.$refs.multipleTable) {
        rows.forEach(row => {
          console.log(row)
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      }
    },
    handleSelectionChange(val) {
      // console.log(val)
    },
    handleSave() {
      this.handleUpdateAlertTable(0)
      this.handleUpdateAlertTable(1)
    },
    async handleUpdateAlertTable(index) {
      const params = {}
      const alertId = this.listData[index].id
      params.disabled = this.listData[index].disabled
      params.days = this.listData[index].days
      this.listLoading = true
      await updateAlertSettingsByProject(alertId, params)
        .then(_ => {
          this.loadData()
          this.showUpdateMessage()
        })
        .catch(err => {
          this.listLoading = false
          return err
        })
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('ProjectSettings.SuccessUpdateAlertSettings'),
        type: 'success'
      })
    },
    isTableDataChanged(index) {
      if (!this.listData) return false
      for (const key in this.listData[index]) {
        if (this.originData[index][key] !== this.listData[index][key]) return true
      }
      return false
    },
    toggleUsage(row) {
      row.disabled = !row.disabled
    }
  }
}
</script>

<style lang="scss" scoped>
>>> input.el-input__inner {
  text-align: center;
}
</style>
