import { updateIssue } from '@/api/issue'

const CLOSED_STATUS_ID = 6
const CLOSED_STATUS_NAME = 'Closed'

function Issue(issue) {
  this.data = issue

  // Set props for vue.js usage, only this level is reactive
  this.id = this.data.id
  this.name = this.data.name
  this.versionName = this.data.fixed_version.name
  this.category = this.data.tracker.name
  this.statusName = this.data.status.name
  this.assigneeName = this.data.assigned_to.name

  this.isOpen = function() {
    return this.data.status.id !== 6
  }
  this.close = async function() {
    await updateIssue(this.id, { status_id: CLOSED_STATUS_ID })
    this.setStatus(CLOSED_STATUS_ID, CLOSED_STATUS_NAME)
  }
  this.setStatus = function(id, name) {
    this.data.status.id = id
    this.data.status.name = name
    this.statusName = this.data.status.name // For reactive
  }
}

export default Issue
