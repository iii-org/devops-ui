function User(user) {
  if (!user) {
    return
  }

  this.create_at = user.create_at
  this.department = user.department
  this.status = user.status
  this.email = user.email
  this.from_ad = user.from_ad
  this.id = user.id
  this.login = user.login
  this.name = user.name
  this.phone = user.phone
  this.title = user.title
  this.update_at = user.update_at
  if (user.default_role) {
    this.default_role_id = user.default_role.id
    this.default_role_name = user.default_role.name
  }
}

export default User
