import request from '@/utils/request'

export function getPipelines(param) {
  return request({
    url: '/cicd/pipelines',
    method: 'get',
    param
  })
}

export function getPipeline(id) {
  return request({
    url: `/cicd/pipelines/${id}`,
    method: 'get'
  })
}

export function getStages(id) {
  return request({
    url: `/cicd/pipelines/${id}/stages`,
    method: 'get'
  })
}
