function Project(project) {
  if (!project) {
    return
  }

  // Database columns
  this.id = project.id
  this.name = project.name
  this.display = project.display
  this.description = project.description
  this.disabled = project.disabled
  this.git_url = project.git_url
  this.ssh_url = project.ssh_url
  this.creator_id = project.creator_id
  this.start_date = project.start_date
  this.due_date = project.due_date
  this.create_at = project.create_at
  this.update_at = project.update_at

  this.pm_user_id = project.pm_user_id
  this.pm_user_name = project.pm_user_name
  this.department = project.department

  this.redmine_url = project.redmine_url
  this.repository_ids = project.repository_ids
  this.harbor_url = project.harbor_url

  // Redmine fields
  this.updated_time = project.updated_time
  this.closed_count = project.closed_count
  this.overdue_count = project.overdue_count
  this.total_count = project.total_count
  this.project_status = project.project_status
}

export default Project
