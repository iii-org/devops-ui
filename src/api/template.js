import request from '@/utils/request'

export function getTemplateList() {
  return request({
    url: '/template_list',
    method: 'get'
  })
}
