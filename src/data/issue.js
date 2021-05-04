import { updateIssue } from '@/api/issue'

const CLOSED_STATUS_ID = 6
const CLOSED_STATUS_NAME = 'Closed'

function Issue(issue) {
  this.data = issue

  // Flatten the data for performance since it's not necessary to be nested
  this.id = this.data.id
  this.name = this.data.name
  this.description = this.data.description
  this.updatedOn = this.data.updated_on
  this.startDate = this.data.start_date
  this.dueDate = this.data.due_date
  this.parentId = this.data.parent_id
  this.issueLink = this.data.issue_link

  this.projectId = this.data.project.id
  this.projectName = this.data.project.name
  this.projectDisplay = this.data.project.display
  this.trackerId = this.data.tracker.id
  this.trackerName = this.data.tracker.name
  this.priorityId = this.data.priority.id
  this.priorityName = this.data.priority.name
  this.statusId = this.data.status.id
  this.statusName = this.data.status.name
  this.versionId = this.data.fixed_version.id
  this.versionName = this.data.fixed_version.name
  this.assigneeId = this.data.assigned_to.id
  this.assigneeName = this.data.assigned_to.name
  this.assigneeLogin = this.data.assigned_to.login

  this.isOpen = function() {
    return this.data.status.id !== CLOSED_STATUS_ID
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
