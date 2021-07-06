import request from '@/utils/request'

export const getTestCaseType = () => request.get(`/testCases/support_type`)
export const getTestCaseAPIMethod = () => request.get(`/testCases/support_RestfulAPI_Method`)
export const getTestCaseByIssue = (issue_id) => request.get(`/testCases_by_issue/${issue_id}`)
export const addTestCaseByIssue = (issue_id, data) => request.post(`/testCases_by_issue/${issue_id}`, data)
export const deleteTestCase = (test_case_id) => request.delete(`/testCases/${test_case_id}`)
