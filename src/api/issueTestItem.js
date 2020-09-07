import request from '@/utils/request'

export function getTestItemByCase(case_id) {
  return request({
    url: `/testItems_by_testCase/${case_id}`,
    method: 'get'
  })
}

export function addTestItemByCase(case_id, data) {
  return request({
    url: `/testItems_by_testCase/${case_id}`,
    method: 'post',
    data
  })
}

export function deleteTestItem(item_id) {
  return request({
    url: `/testItems/${item_id}`,
    method: 'delete'
  })
}