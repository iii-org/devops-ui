import request from '@/utils/request'
import Project from '@/data/project'

export const getActivityLog = (activity_id) => request.get(`/devops-ui/projects/activity/log/${activity_id}`)
export const postStarProject = (project_id) => request.post(`/project/${project_id}/star`)
export const deleteStarProject = (project_id) => request.delete(`/project/${project_id}/star`)
export const addNewProject = (data = { name: '', disabled: false, description: '' }) => request.post(`/project`, data)
export const getProjectTest = (pId) => request.get(`/project/${pId}/test_summary`)
export const getProjectCommitTestSummary = (pId, commit_id) => request.get(`/project/${pId}/test_summary/${commit_id}`)
export const getProjectInfos = (pId) => request.get(`/project/${pId}`)
export const updateProjectInfos = (pId, data) => request.patch(`/project/${pId}`, data)
export const editProject = (pId, data = { name: '', disabled: false, description: '' }) => request.put(`/project/${pId}`, data)
export const deleteProject = (pId) => request.delete(`/project/${pId}`)
export const getProjectAssignable = (pId) => request.get(`/project/${pId}/user/list?exclude=0`) // exclude=0 : 輸出參與此project的使用者列表
export const getNotInProject = (pId) => request.get(`/project/${pId}/user/list?exclude=1`) // exclude=1 : 輸出無參與此project的使用者列表
export const getProjectIssueProgress = (pId, params = {}) => request.get(`/project/${pId}/issues_progress`, { params })
export const getProjectIssueStatistics = (pId, params = {}) => request.get(`/project/${pId}/issues_statistics`, { params })
export const getProjectUserList = (pId) => request.get(`/project/${pId}/user/list`)
export const getProjectVersion = (pId, params) => request.get(`/project/${pId}/version/list`, { params })
export const getProjectIssueListByTree = (pId) => request.get(`/project/${pId}/issues_by_tree`)
export const getProjectIssueListByStatus = (pId) => request.get(`/project/${pId}/issues_by_status`)
export const addProjectVersion = (pId, data = { name: '', due_date: '', description: '', status: '' }) => request.post(`/project/${pId}/version`, data)
export const editProjectVersion = (pId, vId, data = { name: '', due_date: '', description: '', status: '' }) => request.put(`/project/${pId}/version/${vId}`, data)
export const deleteProjectVersion = (pId, vId) => request.delete(`/project/${pId}/version/${vId}`)
export const getProjectIssueList = (pId, params, config) => request.get('/project/' + pId + '/issues', { params: { ...params }, ...config })
export const getProjectIssueListByVersion = (pId, params) => request.get(`/project/${pId}/issues`, { params })
export const addProjectMember = (pId, data = { user_id: '' }) => request.post(`/project/${pId}/member`, data)
export const deleteProjectMember = (pId, user_id) => request.delete(`/project/${pId}/member/${user_id}`)
export const getProjectFileList = (pId) => request.get(`/project/${pId}/file`)
export const deleteProjectFile = (file_id) => request.delete(`/file/${file_id}`)
export const getPipelineDefaultBranch = (rId) => request.get(`/project/${rId}/pipeline/default_branch`)
export const editPipelineDefaultBranch = (rId, data) => request.put(`/project/${rId}/pipeline/default_branch`, data)
export const updateUnalteredPipelineBranch = (rId, data) => request.post(`/pipelines/${rId}/pipelines`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getPipelineBranch = (rId, params) => request.get(`/project/${rId}/pipeline/branches`, { params })
export const editPipelineBranch = (rId, data) => request.put(`/project/${rId}/pipeline/branches`, data)
export const runPipelineByBranch = (rId, data) => request.post(`/pipelines/${rId}/pipelines?action=run`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getParticipateProject = (user_id) => request.get(`/projects_by_user/${user_id}`)
export const downloadProjectFile = (params = { id: '', filename: '', project_id: '' }) => request.get(`/download`, { params, responseType: 'arraybuffer' })
export const uploadProjectFile = (pId, data) => request.post(`/project/${pId}/file`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getCalculateProjectList = (project_ids) =>
  request.get(`/project/list/caculate?project_ids=${project_ids}`)
export const updateCalculateProjectList = () =>
  request.post(`/project/sync_project_issue_calculate`)
export const getMyProjectList = async (simple, params) => {
  if (!params) params = {}
  if (simple) params['simple'] = simple
  const res = await request.get('/project/list', { params })
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
export const getTestReport = (reportId) => request.get(`/checkmarx/report/${reportId}`, { responseType: 'blob' })
export const addProjectTags = (data) => request.post(`/tags`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
export const getTagsByProject = (pId) => request.get(`/tags?project_id=${pId}`)
export const getTagsByName = (params, config) => request.get(`/tags`, { params: { ...params }, ...config })
export const getTagsByProjectOrTagName = (pId, tag_name) => request.get(`/tags?project_id=${pId}&tag_name=${tag_name}`)
export const deleteProjectTags = (tag_id) => request.delete(`/tags/${tag_id}`)
export const updateProjectTags = (tag_id, data) => request.put(`/tags/${tag_id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }})

export const postIssueListDownload = (project_id, data) => request.post(`/project/${project_id}/download/execute`, data)
export const getIssueListDownload = (project_id) => request.get(`/project/${project_id}/download/is_exist`)
export const patchIssueListDownload = (project_id) => request.patch(`/project/${project_id}/download`, {}, { responseType: 'blob' })
export const getIssueListLockStatus = () => request.get('/lock', { params: { name: 'download_pj_issues' }})
export const getRootProjectId = (project_id) => request.get(`/project/${project_id}/root_project`)
export const getCommitRelation = (commit_id) => request.get(`/issue/relation?commit_id=${commit_id}`)
export const patchCommitRelation = (params) => request.patch(`/issue/relation`, { ...params })
