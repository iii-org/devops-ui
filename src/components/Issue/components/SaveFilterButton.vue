<template>
  <div>
    <el-button
      v-if="showSaveSettingsButton"
      style="width:100%"
      class="buttonPrimary"
      @click="showSaveSettingsButton = !showSaveSettingsButton"
    >
      {{ $t('general.SaveSettings') }}
    </el-button>
    <div
      v-else
      class="flex"
    >
      <el-input
        v-model="filterName"
        class="mr-2"
        :placeholder="$t('Issue.InputFilterName')"
      />
      <el-button
        class="buttonSecondary"
        @click="setCustomFilter"
      >
        {{ $t('general.Save') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { addIssueFilter } from '@/api/issueFilter'

const keyMap = {
  status_id: 'status',
  tags: 'tags',
  tracker_id: 'tracker',
  assigned_to_id: 'assigned_to',
  fixed_version_id: 'fixed_version',
  priority_id: 'priority',
  show_closed_issues: 'displayClosed',
  show_closed_versions: 'fixed_version_closed'
}
const sendDataMap = {
  status: 'status_id',
  tracker: 'tracker_id',
  assigned_to: 'assigned_to_id',
  fixed_version: 'fixed_version_id',
  priority: 'priority_id'
}

export default {
  name: 'SaveFilterButton',
  props: {
    filterValue: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: ''
    },
    projectId: {
      type: [Number, String],
      default: null
    },
    activeTab: {
      type: String,
      default: null
    },
    groupBy: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      filterName: '',
      showSaveSettingsButton: true
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    isIssueList() {
      return this.$route.name === 'issue-list'
    },
    focusProjectId() {
      if (this.$route.name === 'my-works') {
        return this.projectId ? this.projectId : -1 // -1 means all projects (dump project)
      } else {
        return this.selectedProjectId
      }
    }
  },
  methods: {
    reset() {
      this.filterName = ''
      this.showSaveSettingsButton = true
    },
    setCustomFilter() {
      if (!this.filterName) {
        this.$message.warning(this.$t('Issue.InputFilterName'))
        return
      }
      const sendData = this.formatFilterData()
      sendData.name = this.filterName
      addIssueFilter(this.focusProjectId, sendData).then(() => {
        this.$message.success(this.$t('Notify.Saved'))
        this.$emit('update')
        this.reset()
      })
    },
    formatFilterData() {
      const sendData = {
        status_id: null,
        tags: [],
        tracker_id: null,
        assigned_to_id: null,
        fixed_version_id: null,
        show_closed_issues: null,
        show_closed_versions: null,
        priority_id: null,
        group_by: null,
        focus_tab: null,
        name: '',
        type: this.type
      }
      for (const key in keyMap) {
        const originalKey = keyMap[key]
        if (key === 'tags') {
          sendData[key] = this.filterValue[originalKey] ? this.filterValue[originalKey].join(',') : null
        } else if (key === 'assigned_to_id') {
          sendData[key] = this.filterValue[originalKey]
        } else {
          sendData[key] = this.filterValue[originalKey] === 'null' ? null : this.filterValue[originalKey]
        }
        sendData['focus_tab'] = this.activeTab
        sendData['group_by'] = this.groupBy
      }
      const isIssueBoard = this.$route.name === 'issue-boards'
      return isIssueBoard ? this.formateSendData(sendData) : sendData
    },
    formateSendData(sendData) {
      const result = Object.assign({}, sendData)
      const removeKey = sendDataMap[this.groupBy.dimension]
      delete result[removeKey]
      return result
    }
  }
}
</script>
