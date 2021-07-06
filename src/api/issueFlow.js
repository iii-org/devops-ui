import request from '@/utils/request'

export const getFlowType = () => request.get(`/flows/support_type`)
export const getFlowByIssue = (issue_id) => request.get(`/flows_by_issue/${issue_id}`)
export const addFlowByIssue = (issue_id, data) => request.post(`/flows_by_issue/${issue_id}`, data)
export const deleteFlow = (flow_id) => request.delete(`/flows/${flow_id}`)
