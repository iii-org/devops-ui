import { updateIssue } from '@/api/issue'

const CLOSED_STATUS_ID = 6
const CLOSED_STATUS_NAME = 'Closed'

function Issue(issue) {
  // Flatten the data for performance since it's not necessary to be nested
  this.id = issue.id
  this.name = issue.name
  this.description = issue.description
  this.updatedOn = issue.updated_on
  this.startDate = issue.start_date
  this.dueDate = issue.due_date
  this.parentId = issue.parent_id
  this.issueLink = issue.issue_link

  this.projectId = issue.project.id
  this.projectName = issue.project.name
  this.projectDisplay = issue.project.display
  this.trackerId = issue.tracker.id
  this.trackerName = issue.tracker.name
  this.priorityId = issue.priority.id
  this.priorityName = issue.priority.name
  this.statusId = issue.status.id
  this.statusName = issue.status.name
  this.isClosed = issue.is_closed
  this.versionId = issue.fixed_version.id
  this.versionName = issue.fixed_version.name
  this.assigneeId = issue.assigned_to.id
  this.assigneeName = issue.assigned_to.name
  this.assigneeLogin = issue.assigned_to.login

  this.close = async function() {
    await updateIssue(this.id, { status_id: CLOSED_STATUS_ID })
    this.setStatus(CLOSED_STATUS_ID, CLOSED_STATUS_NAME, true)
  }
  this.setStatus = function(id, name, isClosed) {
    this.statusId = id
    this.statusName = name
    this.isClosed = isClosed
  }
}

export default Issue
