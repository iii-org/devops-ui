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
