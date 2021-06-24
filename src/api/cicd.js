import request from '@/utils/request'

export const getPipelines = (repository_id, params, config) => request.get(`/pipelines/${repository_id}/pipelines_exec`, { params, ...config })
export const changePipelineByAction = (repository_id, data) => request.post(`/pipelines/${repository_id}/pipelines_exec/action`, data)

export const getPipeline = () => request.get(`/pipelines`)
export const getStages = (id) => request.get(`/cicd/pipelines/${id}/stages`)

// CI/CD 詳細記錄 [測試詳細記錄]
export const getPipelinesLogs = (params) => request.get(`/pipelines/logs`, { params })
export const getPipelinesPhase = (rId, bName) => request.get(`/pipelines/${rId}/branch/${bName}/phase_yaml`)
export const getPipelinesConfig = (rId, params) => request.get(`/pipelines/${rId}/config`, { params })
export const getCiPipelineId = (rId) => request.get(`/git_repo_id_to_ci_pipe_id/${rId}`)
