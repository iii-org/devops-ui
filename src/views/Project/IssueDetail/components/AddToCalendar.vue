<template>
  <el-tooltip :content="$t('Issue.AddToCalendar')" placement="right">
    <el-dropdown trigger="hover">
      <el-button circle size="small">
        <em class="el-icon-date" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>
          <div @click="addToCalendar('google')">
            <svg-icon icon-class="google" class="text-md" />
            <span>Google</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item>
          <div @click="addToCalendar('microsoft')">
            <svg-icon icon-class="microsoft" class="text-md" />
            <span>Outlook.com</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item>
          <div @click="addToCalendar('office365')">
            <svg-icon icon-class="office365" class="text-md" />
            <span>Microsoft 365</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item>
          <div @click="addToCalendar('ics')">
            <svg-icon icon-class="ical" class="text-md" />
            <span>ICalendar</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-tooltip>
</template>

<script>
import { getLocalTime } from '@/utils/handleTime'
import { calendarUrl } from '@/utils/addToCalendar'
import { ics } from '@/utils/ics'
import { mapGetters } from 'vuex'

export default {
  name: 'AddToCalendar',
  props: {
    issueId: {
      type: [String, Number],
      default: null
    },
    form: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapGetters(['tracker'])
  },
  methods: {
    addToCalendar(type) {
      if (type) {
        const { name, start_date, due_date, tracker_id } = this.form
        if (name) {
          const trackerName = this.$t(`Issue.${this.tracker.find((item) => item.id === tracker_id).name}`)
          const title = `${trackerName} #${this.issueId}: ${name}`
          const link = `${window.location.origin}/#/project/issues/${this.issueId}`
          const description = title.link(link)
          const data = {
            type: type,
            title: name,
            details: description,
            start: start_date,
            end: due_date
          }
          if (type === 'ics') {
            const cal = ics()
            cal.addEvent(name, description, '', getLocalTime(start_date), getLocalTime(due_date))
            cal.download('issue-' + (this.issueId || name))
            return
          }
          window.open(calendarUrl(data))
          // return calendarUrl(data)
        }
      }
    }
  }
}
</script>
