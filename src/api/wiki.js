import request from '@/utils/request'

export function getWikiList(project_id) {
  return request({
    url: `/project/${project_id}/wiki`,
    method: 'get'
  })
}
