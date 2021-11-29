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
  priority_id: 'priority'
}

export default {
  props: {
    showButton: {
      type: Boolean,
      default: false
    },
    filterValue: {
      type: Object,
      default: () => ({})
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
      addIssueFilter(this.selectedProjectId, sendData).then((response) => {
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
        priority_id: null,
        name: '',
        type: 'issue_list'
      }
      for (const key in keyMap) {
        const originalKey = keyMap[key]
        if (key === 'tags') {
          sendData[key] = this.filterValue[originalKey] ? this.filterValue[originalKey].join(',') : null
        } else if (this.filterValue[originalKey]) {
          sendData[key] = this.filterValue[originalKey] === 'null' ? null : this.filterValue[originalKey]
        }
      }
      return sendData
    }
  }
}
</script>