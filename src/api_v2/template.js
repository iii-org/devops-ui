import request from '@/utils/request'

export const getTemplateList = (params) => request.get('/v2/template_list', { params })
export const getTemplateParams = (git_project_id) => request.get(`/v2/template/${git_project_id}`)
export const getTemplateParamsByVersion = (git_project_id, version) =>
  request.get(`/v2/template/${git_project_id}?tag_name=${version}`)
export const getTemplateFromProject = () => request.get(`/v2/template_from_project/template/list`)
export const createTemplateFromProject = (id, data) => request.post(`/v2/template_from_project/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const deleteTemplateFromProject = (project_id) => request.delete(`/v2/template_from_project/template/${project_id}`)
