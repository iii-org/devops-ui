<template>
  <div
    v-show="showButton"
    class="flex"
  >
    <el-input
      v-model="filterName"
      class="mr-2"
      :placeholder="$t('Issue.InputFilterName')"
    />
    <el-button
      type="success"
      @click="setCustomFilter"
    >
      {{ $t('general.Save') }}
    </el-button>
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

export default {
  name: 'SaveFilterButton',
  props: {
    showButton: {
      type: Boolean,
      default: false
    },
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
      filterName: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    isIssueList() {
      return this.$route.name === 'issue-list'
    },
    myWorkProjectId() {
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
    },
    setCustomFilter() {
      if (!this.filterName) {
        this.$message.warning(this.$t('Issue.InputFilterName'))
        return
      }
      const sendData = this.formatFilterData()
      sendData.name = this.filterName
      addIssueFilter(this.myWorkProjectId, sendData).then(() => {
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
        } else if (this.filterValue[originalKey]) {
          sendData[key] = this.filterValue[originalKey] === 'null' ? null : this.filterValue[originalKey]
        }
        sendData['focus_tab'] = this.activeTab
        sendData['group_by'] = this.groupBy
      }
      return sendData
    }
  }
}
</script>
