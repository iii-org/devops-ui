import request from '@/utils/request'

export function getTemplateList() {
  return request({
    url: '/template_list',
    method: 'get'
  })
}

export function getTemplateParams(git_project_id) {
  return request({
    url: `/template/${git_project_id}`,
    method: 'get'
  })
}

export function getTemplateParamsByVersion(git_project_id, version) {
  return request({
    url: `/template/${git_project_id}?tag_name=${version}`,
    method: 'get'
  })
}
