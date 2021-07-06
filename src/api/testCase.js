import request from '@/utils/request'

export const getTestCaseType = () => request.get(`/testCases/support_type`,)
export const getTestCaseAPIMethod = () => request.get(`/testCases/support_RestfulAPI_Method`,)
export const getTestCaseById = (test_case_id) => request.get(`/testCases/${test_case_id}`,)
export const getTestCaseByProject = (project_id) => request.get(`/testCases_by_project/${project_id}`,)
export const addTestCaseByProject = (project_id, data) => request.post(`/testCases_by_project/${project_id}`, data)
export const updateTestCase = (test_case_id, data) => request.put(`/testCases/${test_case_id}`, data)
export const deleteTestCase = (test_case_id) => request.delete(`/testCases/${test_case_id}`,)
