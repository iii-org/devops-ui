import request from '@/utils/request'

export function getUserRedmineMailProfile() {
  return request({
    url: `/mail`,
    method: 'get'
  })
}

export function editUserRedmineMailProfile(data) {
  return request({
    url: `/mail`,
    method: 'put',
    data
  })
}
