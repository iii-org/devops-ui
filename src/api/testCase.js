import request from '@/utils/request'

export function getTestCaseType() {
  return request({
    url: `/testCases/support_type`,
    method: 'get'
  })
}

export function getTestCaseAPIMethod() {
  return request({
    url: `/testCases/support_RestfulAPI_Method`,
    method: 'get'
  })
}

export function getTestCaseById(test_case_id) {
  return request({
    url: `/testCases/${test_case_id}`,
    method: 'get'
  })
}

export function getTestCaseByProject(project_id) {
  return request({
    url: `/testCases_by_project/${project_id}`,
    method: 'get'
  })
}

export function addTestCaseByProject(project_id, data) {
  return request({
    url: `/testCases_by_project/${project_id}`,
    method: 'post',
    data
  })
}

export function updateTestCase(test_case_id, data) {
  return request({
    url: `/testCases/${test_case_id}`,
    method: 'put',
    data
  })
}

export function deleteTestCase(test_case_id) {
  return request({
    url: `/testCases/${test_case_id}`,
    method: 'delete'
  })
}
