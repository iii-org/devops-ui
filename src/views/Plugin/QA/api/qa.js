import request from '@/utils/request'

export const getTestFileList = (projectId) => request.get('/quality/' + projectId + '/testfile_list')
export const postTestFile = (projectId, software_name, data) => request.post('/quality/' + projectId + '/testfile/' + software_name, data)
export const deleteTestFile = (projectId, software_name, filename) => request.delete('/quality/' + projectId + '/testfile/' + software_name + '/' + filename)

export const getTestPlanWithTestFile = (projectId) => request.get('/quality/' + projectId + '/testplan_with_testfile')
export const getTestPlanList = (projectId) => request.get('/quality/' + projectId + '/testplan_list')
export const getTestPlanDetail = (projectId, issueId) => request.get('/quality/' + projectId + '/testplan/' + issueId)
export const getTestFileByTestPlan = (projectId, testPlanId) => request.get(`/quality/${projectId}/testfile_by_testplan/${testPlanId}`)
export const putTestPlanWithTestFile = (projectId, data) => request.put('/quality/' + projectId + '/testplan_with_testfile', data)
export const postTestPlanWithTestFile = (projectId, data) => request.post('/quality/' + projectId + '/testplan_with_testfile', data)
export const deleteTestPlanWithTestFile = (projectId, issueId, data) => request.delete('/quality/' + projectId + '/testplan_with_testfile/' + issueId, data)
export const getTraceabilityMatrixReport = (projectId, config) => request.get(`/quality/${projectId}/report`, config)