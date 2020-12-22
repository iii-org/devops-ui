import request from '@/utils/request'

// repositoryid
export function getPipelines(repository_id) {
  return request({
    url: `/pipelines/${repository_id}/pipelines_exec`,
    method: 'get'
  })
}

export function changePipelineByAction(repository_id, data) {
  return request({
    url: `/pipelines/${repository_id}/pipelines_exec/action`,
    method: 'post',
    data
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

// CI/CD 詳細記錄 [測試詳細記錄]
export function getPipelinesLogs(params) {
  return request({
    url: `/pipelines/logs`,
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
