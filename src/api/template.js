import request from '@/utils/request'

export function getTemplate() {
  return request({
    url: '/template',
    method: 'get'
  })
}
