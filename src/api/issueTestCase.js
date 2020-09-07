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

export function getTestCaseByIssue(issue_id) {
  return request({
    url: `/testCases_by_issue/${issue_id}`,
    method: 'get'
  })
}

export function addTestCaseByIssue(issue_id, data) {
  return request({
    url: `/testCases_by_issue/${issue_id}`,
    method: 'post',
    data
  })
}

export function deleteTestCase(testcase_id) {
  return request({
    url: `/testCases/${testcase_id}`,
    method: 'delete'
  })
}