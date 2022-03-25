import request from '@/utils/request'
import Project from '@/data/project'

export const postStarProject = (project_id) =>
  request.post(`/v2/project/${project_id}/star`)
export const deleteStarProject = (project_id) =>
  request.delete(`/v2/project/${project_id}/star`)
export const addNewProject = (
  data = { name: '', disabled: false, description: '' }
) => request.post(`/v2/project`, data)
export const getProjectTest = (project_id) =>
  request.get(`/v2/project/${project_id}/test_summary`)
export const getProjectCommitTestSummary = (project_id, commit_id) =>
  request.get(`/v2/project/${project_id}/test_summary/${commit_id}`)
export const updateProjectInfos = (project_id, data) =>
  request.patch(`/v2/project/${project_id}`, data)
export const editProject = (
  project_id,
  data = { name: '', disabled: false, description: '' }
) => request.put(`/v2/project/${project_id}`, data)
export const deleteProject = (project_id) =>
  request.delete(`/v2/project/${project_id}`)
export const getProjectAssignable = (project_id) =>
  request.get(`/v2/project/${project_id}/user/list?exclude=0`) // exclude=0 : 輸出參與此project的使用者列表
export const getNotInProject = (project_id) =>
  request.get(`/v2/project/${project_id}/user/list?exclude=1`) // exclude=1 : 輸出無參與此project的使用者列表
export const getProjectIssueProgress = (project_id, params = {}) =>
  request.get(`/v2/project/${project_id}/issues_progress`, { params })
export const getProjectIssueStatistics = (project_id, params = {}) =>
  request.get(`/v2/project/${project_id}/issues_statistics`, { params })
export const getProjectUserList = (project_id) =>
  request.get(`/v2/project/${project_id}/user/list`)
export const getProjectVersion = (project_id, params) =>
  request.get(`/v2/project/${project_id}/version/list`, { params })
export const getProjectIssueListByTree = (project_id) =>
  request.get(`/v2/project/${project_id}/issues_by_tree`)
export const addProjectVersion = (
  project_id,
  data = { name: '', due_date: '', description: '', status: '' }
) => request.post(`/v2/project/${project_id}/version`, data)
export const editProjectVersion = (
  project_id,
  version_id,
  data = { name: '', due_date: '', description: '', status: '' }
) => request.put(`/v2/project/${project_id}/version/${version_id}`, data)
export const deleteProjectVersion = (project_id, version_id) =>
  request.delete(`/v2/project/${project_id}/version/${version_id}`)
export const getProjectIssueList = (project_id, params, config) =>
  request.get('/v2/project/' + project_id + '/issues', {
    params: { ...params },
    ...config
  })
export const getProjectIssueListByVersion = (project_id, params) =>
  request.get(`/v2/project/${project_id}/issues`, { params })
export const addProjectMember = (project_id, data = { user_id: '' }) =>
  request.post(`/v2/project/${project_id}/member`, data)
export const deleteProjectMember = (project_id, user_id) =>
  request.delete(`/v2/project/${project_id}/member/${user_id}`)

export const getProjectFileList = (project_id) =>
  request.get(`/v2/project/${project_id}/file`)
export const deleteProjectFile = (file_id) =>
  request.delete(`/v2/file/${file_id}`)

export const getPipelineDefaultBranch = (repository_id) =>
  request.get(`/v2/project/${repository_id}/pipeline/default_branch`)
export const editPipelineDefaultBranch = (repository_id, data) =>
  request.put(`/v2/project/${repository_id}/pipeline/default_branch`, data)
export const updateUnalteredPipelineBranch = (repository_id, data) =>
  request.post(`/v2/pipelines/${repository_id}/pipelines`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const getPipelineBranch = (repository_id, params) =>
  request.get(`/v2/project/${repository_id}/pipeline/branches`, { params })
export const editPipelineBranch = (repository_id, data) =>
  request.put(`/v2/project/${repository_id}/pipeline/branches`, data)

export const getParticipateProject = (user_id) =>
  request.get(`/v2/projects_by_user/${user_id}`)
export const downloadProjectFile = (
  params = { id: '', filename: '', project_id: '' }
) => request.get(`/v2/download`, { params, responseType: 'arraybuffer' })
export const uploadProjectFile = (project_id, data) =>
  request.post(`/v2/project/${project_id}/file`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getCalculateProjectList = (project_ids) =>
  request.get(`/v2/project/list/caculate?project_ids=${project_ids}`)
export const updateCalculateProjectList = () =>
  request.post(`/v2/project/sync_project_issue_calculate`) // webster checked
export const getMyProjectList = async (simple, params) => {
  if (!params) params = {}
  if (simple) params['simple'] = simple
  const res = await request.get('/v2/project/list', { params })
  const ret = []
  if (Object.prototype.hasOwnProperty.call(res.data.project_list, 'page')) {
    for (const project of res.data.project_list.project_list) {
      ret.push(new Project(project))
    }
    return {
      projects: ret,
      page: res.data.project_list.page
    }
  } else {
    for (const project of res.data.project_list) {
      ret.push(new Project(project))
    }
    return {
      projects: ret
    }
  }
}

export const addProjectTags = (data) =>
  request.post(`/v2/tags`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const getTagsByProject = (project_id) =>
  request.get(`/v2/tags?project_id=${project_id}`)
export const getTagsByName = (params, config) =>
  request.get(`/v2/tags`, { params: { ...params }, ...config })
export const getTagsByProjectOrTagName = (project_id, tag_name) =>
  request.get(`/v2/tags?project_id=${project_id}&tag_name=${tag_name}`)
export const deleteProjectTags = (tag_id) => request.delete(`/v2/tags/${tag_id}`)
export const updateProjectTags = (tag_id, data) =>
  request.put(`/v2/tags/${tag_id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const postIssueListDownload = (project_id, data) =>
  request.post(`/v2/project/${project_id}/download/execute`, data)
export const getIssueListDownload = (project_id) =>
  request.get(`/v2/project/${project_id}/download/is_exist`)
export const patchIssueListDownload = (project_id) =>
  request.patch(
    `/v2/project/${project_id}/download`,
    {},
    { responseType: 'blob' }
  )
export const getIssueListLockStatus = () =>
  request.get('/v2/lock', { params: { name: 'download_pj_issues' }})
export const getRootProjectId = (project_id) => request.get(`/v2/project/${project_id}/root_project`)
export const getHasSon = (project_id) => request.get(`/v2/project/${project_id}/has_son`)
export const getProjectRelation = (project_id) => request.get(`/v2/project/${project_id}/relation`)

export const forceDeleteProject = (project_id) => 
  request.delete(`/v2/project/${project_id}?force_delete_project=true`)
export const syncProject = (project_id) => 
  request.patch(`/v2/sync_projects/${project_id}`)
