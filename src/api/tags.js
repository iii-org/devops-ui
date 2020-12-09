import request from '@/utils/request'

export function getTagsId(rId) {
  return request({
    url: '/repositories/' + rId + '/tags',
    method: 'get'
  })
}

export function newTag(rId, data) {
  return request({
    url: '/repositories/' + rId + '/tags',
    method: 'POST',
    data
  })
}
