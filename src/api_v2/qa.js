import request from '@/utils/request'

export const getTestFileList = (project_id) => request.get(`/v2/quality/${project_id}/testfile_list`)
export const postTestFile = (project_id, software_name, data) =>
  request.post(`'/v2/quality/${project_id}/testfile/${software_name}`, data)
export const deleteTestFile = (project_id, software_name, filename) =>
  request.delete(`/v2/quality/${project_id}/testfile/${software_name}/${filename}`)

export const getTestPlanList = (project_id) => request.get('/v2/quality/' + project_id + '/testplan_list')
export const getTestFileByTestPlan = (project_id, testPlanId) =>
  request.get(`/v2/quality/${project_id}/testfile_by_testplan/${testPlanId}`)
export const putTestPlanWithTestFile = (project_id, data) =>
  request.put(`/v2/quality/${project_id}/testplan_with_testfile`, data)
export const postTestPlanWithTestFile = (project_id, data) =>
  request.post(`/v2/quality/${project_id}/testplan_with_testfile`, data)
export const deleteTestPlanWithTestFile = (project_id, issue_id, data) =>
  request.delete(`/v2/quality/${project_id}/testplan_with_testfile/${issue_id}`, data)

export const getTraceabilityMatrixReport = (project_id, config) => request.get(`/v2/quality/${project_id}/report`, config)
export const getTraceOrderList = (params) => request.get(`/v2/trace_order`, { params })
export const postTraceOrder = (data) => request.post(`/v2/trace_order`, data)
export const patchTraceOrder = (trace_order_id, data) => request.patch(`/v2/trace_order/${trace_order_id}`, data)
export const deleteTraceOrder = (trace_order_id) => request.delete(`/v2/trace_order/${trace_order_id}`)
export const patchTraceOrderExecute = (data) => request.patch(`/v2/trace_order/execute`, data)
export const getTraceOrderResult = (params) => request.get(`/v2/trace_order/result`, { params })
