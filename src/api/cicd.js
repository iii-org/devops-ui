import request from '@/utils/request'

export function getPipelines(project_id) {
  return request({
    url: `/pipelines/rd/${project_id}/pipelines_exec`,
    method: 'get'
  })
}

export function getPipeline(id) {
  return request({
    url: `/pipelines`,
    method: 'get'
  })
}

export function getStages(id) {
  return request({
    url: `/cicd/pipelines/${id}/stages`,
    method: 'get'
  })
}
//CI/CD 詳細記錄 [測試詳細記錄]
export function getPipelinesLogs(params) {
  return request({
    url: `/pipelines/rd/logs`,
    method: 'get',
    params
  })
}

export function getPipelinesPhase(rId, bName) {
  return request({
    url: `/pipelines/${rId}/branch/${bName}/phase_yaml`,
    method: 'get'
  })
}
