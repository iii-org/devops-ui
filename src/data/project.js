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
  this.redmine_url = project.redmine_url
  this.repository_ids = project.repository_ids
  this.ssh_url = project.ssh_url
}

export default Project
