<template>
  <div class="app-container">
    <div class="flex justify-between mt-3">
      <div class="font-medium text-lg">{{ $t('ProjectSettings.ParentIssueRequiredSettings') }}</div>
      <div>
        <el-switch
          v-model="isToggle"
          inactive-color="#ff4949"
          class="mr-5"
          :disabled="disableSwitch || permission"
          :active-text="$t('general.Enable')"
          :inactive-text="$t('general.Disable')"
          @change="toggleSwitch"
        />
        <el-button class="buttonPrimary" :disabled="!isToggle || permission" @click="handleSave">{{ $t('general.Save') }}</el-button>
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
        <el-table-column align="center" :label="$t('ProjectSettings.IssueType')">
          <template slot-scope="scope">
            {{ $t(`Issue.${scope.row.name}`) }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          type="selection"
          width="200"
          :selectable="checkboxState"
        />
      </el-table>
    </div>
    <div v-if="!isToggle" class="text-center">{{ $t('ProjectSettings.NotYetEnabled') }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { 
  getIssueForceTracker,
  createIssueForceTracker,
  updateIssueForceTracker,
  deleteIssueForceTracker
} from '@/api_v2/issue'

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
      newForceTrackerList: [],
      oldForceTrackerListId: [],
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
    ...mapGetters(['tracker', 'selectedProject', 'userId', 'userRole']),
    permission() {
      if (this.userRole === 'Administrator') return false
      else if (this.selectedProject.owner_id === this.userId) return false
      else return true
    }
  },
  watch: {
    selectedProject: {
      handler(val) {
        this.disableSwitch = val === -1
      },
      immediate: true
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData(update) {
      this.$forceUpdate()
      const res = await getIssueForceTracker(this.selectedProject.id)
      this.isToggle = res.data.enable
      this.oldForceTrackerListId = res.data.need_fatherissue_trackers.map(object => object.id)
      const selected = this.tracker.filter(ob => this.oldForceTrackerListId.includes(ob.id))
      if (!update) this.toggleSelection(selected)
    },
    async toggleSwitch(bool) {
      this.listLoading = true
      if (bool) {
        await createIssueForceTracker(this.selectedProject.id)
          .then(async () => {
            await this.fetchData()
            this.showChangeMessage(bool)
          })
          .catch(err => {
            this.listLoading = false
            return err
          })
      } else {
        await deleteIssueForceTracker(this.selectedProject.id)
          .then(async() => {
            await this.fetchData()
            this.showChangeMessage(bool)
          })
          .catch(err => {
            this.listLoading = false
            return err
          })
      }
      this.listLoading = false
    },
    showChangeMessage(bool) {
      this.$message({
        title: this.$t('general.Success'),
        message: bool ? this.$t('ProjectSettings.EnableForceTracker') : this.$t('ProjectSettings.DisableForceTracker'),
        type: 'success'
      })
    },
    toggleSelection(rows) {
      if (this.$refs.multipleTable) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      }
    },
    async handleSelectionChange(val) {
      this.newForceTrackerList = val
    },
    async handleSave() {
      this.listLoading = true
      const newForceTrackerListId = this.newForceTrackerList.map(object => object.id)
      await updateIssueForceTracker(this.selectedProject.id, { need_fatherissue_trackers: newForceTrackerListId })
        .then(async () => {
          await this.fetchData(true)
          await this.showUpdateMessage()
        })
        .catch(err => {
          this.listLoading = false
          return err
        })
      this.listLoading = false
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Updated'),
        type: 'success'
      })
    },
    checkboxState() {
      return !(this.permission)
    }
  }
}
</script>

<style lang="scss" scoped>
>>> input.el-input__inner {
  text-align: center;
}
</style>
