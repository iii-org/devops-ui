import request from '@/utils/request'

export function getFlowType() {
  return request({
    url: `/flows/support_type`,
    method: 'get'
  })
}

export function getFlowByIssue(issue_id) {
  return request({
    url: `/flows_by_issue/${issue_id}`,
    method: 'get'
  })
}

export function addFlowByIssue(issue_id, data) {
  return request({
    url: `/flows_by_issue/${issue_id}`,
    method: 'post',
    data
  })
}

export function deleteFlow(flow_id) {
  return request({
    url: `/flows/${flow_id}`,
    method: 'delete'
  })
}