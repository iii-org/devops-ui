import request from '@/utils/request'

export const getPipelines = (repository_id, params, config) =>
  request.get(`/v2/pipelines/${repository_id}/pipelines_exec`, { params, ...config })
export const changePipelineByAction = (repository_id, data) =>
  request.post(`/v2/pipelines/${repository_id}/pipelines_exec/action`, data)
export const getPipelinesConfig = (repository_id, params) =>
  request.get(`/v2/pipelines/${repository_id}/config`, { params })
export const getCiPipelineId = (repository_id) => request.get(`/v2/git_repo_id_to_ci_pipe_id/${repository_id}`)
