import request from '@/utils/request'

export function getTestValueType() {
  return request({
    url: `/testValues/support_types`,
    method: 'get'
  })
}

export function getTestValueLocation() {
  return request({
    url: `/testValues/support_locations`,
    method: 'get'
  })
}

export function getTestValueByItem(item_id) {
  return request({
    url: `/testValues_by_testItem/${item_id}`,
    method: 'get'
  })
}

export function addTestValueByItem(item_id, data) {
  return request({
    url: `/testValues_by_testItem/${item_id}`,
    method: 'post',
    data
  })
}

export function updateTestValue(item_id, data) {
  return request({
    url: `/testValues/${item_id}`,
    method: 'put',
    data
  })
}

export function deleteTestValue(value_id) {
  return request({
    url: `/testValues/${value_id}`,
    method: 'delete'
  })
}