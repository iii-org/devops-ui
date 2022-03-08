import request from '@/plugins/axios'

export const getTemplateList = (params) => request.get('/v2/template_list', { params })
export const getTemplateParams = (git_project_id) => request.get(`/v2/template/${git_project_id}`)
export const getTemplateParamsByVersion = (git_project_id, version) =>
  request.get(`/v2/template/${git_project_id}?tag_name=${version}`)
