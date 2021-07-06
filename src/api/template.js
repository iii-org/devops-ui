import request from '@/utils/request'

export const getTemplateList = (params) => request.get('/template_list', { params })
export const getTemplateParams = (git_project_id) => request.get(`/template/${git_project_id}`)
export const getTemplateParamsByVersion = (git_project_id, version) => request.get(`/template/${git_project_id}?tag_name=${version}`)
