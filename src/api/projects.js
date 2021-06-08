import request from '@/utils/request'
import Project from '@/data/project'

export function getActivityLog(activity_id) {
  return request({
    url: `/devops-ui/projects/activity/log/${activity_id}`,
    method: 'get'
  })
}

export async function getMyProjectList(simple) {
  const res = await request({
    url: `/project/list${simple ? '?simple=true' : ''}`,
    method: 'get'
  })
  const ret = []
  for (const project of res.data.project_list) {
    ret.push(new Project(project))
  }
  return ret
}

export async function getMyProjectListSimple() {
  return await getMyProjectList(true)
}

export function addNewProject(data = { name: '', disabled: false, description: '' }) {
  return request({
    url: `/project`,
    method: 'POST',
    data
  })
}

export function getProjectTest(pId) {
  return request({
    url: `/project/${pId}/test_summary`,
    method: 'get'
  })
}
export function getTestReport(reportId) {
  return request({
    url: `/checkmarx/report/${reportId}`,
    responseType: 'blob',
    method: 'get'
  })
}

export function getProjectInfos(pId) {
  return request({
    url: `/project/${pId}`,
    method: 'get'
  })
}

export function updateProjectInfos(pId, data) {
  return request({
    url: `/project/${pId}`,
    method: 'PATCH',
    data
  })
}
export function editProject(pId = '80', data = { name: '', disabled: false, description: '' }) {
  return request({
    url: `/project/${pId}`,
    method: 'PUT',
    data
  })
}

export function deleteProject(pId = '80') {
  return request({
    url: `/project/${pId}`,
    method: 'DELETE'
  })
}

export function getProjectAssignable(pId) {
  // exclude=1 : 輸出無參與此project的使用者列表
  // exclude=0 : 輸出參與此project的使用者列表
  return request({
    url: `/project/${pId}/user/list?exclude=0`,
    method: 'GET'
  })
}

export function getNotInProject(pId) {
  // exclude=1 : 輸出無參與此project的使用者列表
  // exclude=0 : 輸出參與此project的使用者列表
  return request({
    url: `/project/${pId}/user/list?exclude=1`,
    method: 'GET'
  })
}

// 取得專案議題狀態 [ 0_1 單一專案概述]
export function getProjectIssueProgress(pId, params = {}) {
  return request({
    url: `/project/${pId}/issues_progress`,
    method: 'GET',
    params
  })
}

// 取得專案議題篩選條件狀態 [0.1_單一專案概述]
export function getProjectIssueStatistics(pId, params = {}) {
  return request({
    url: `/project/${pId}/issues_statistics`,
    method: 'GET',
    params
  })
}

// 專案內已分配人員 [ 0_1 單一專案概述]
export function getProjectUserList(pId) {
  return request({
    url: `/project/${pId}/user/list`,
    method: 'GET'
  })
}

// 專案內可分配版本 [2.3.1 新增議題 2.3.3.1 編輯議題］
export function getProjectVersion(pId) {
  return request({
    url: `/project/${pId}/version/list`,
    method: 'GET'
  })
}

export function getProjectIssueListByTree(pId) {
  return request({
    url: `/project/${pId}/issues_by_tree`,
    method: 'GET'
  })
}

export function getProjectIssueListByStatus(pId) {
  return request({
    url: `/project/${pId}/issues_by_status`,
    method: 'GET'
  })
}

export function getProjectIssueListByDate(pId) {
  return request({
    url: `/project/${pId}/issues_by_date`,
    method: 'GET'
  })
}

export function addProjectVersion(pId, data = { name: '', due_date: '', description: '', status: '' }) {
  return request({
    url: `/project/${pId}/version`,
    method: 'POST',
    data
  })
}

export function editProjectVersion(pId, vId, data = { name: '', due_date: '', description: '', status: '' }) {
  return request({
    url: `/project/${pId}/version/${vId}`,
    method: 'PUT',
    data
  })
}

export function deleteProjectVersion(pId, vId) {
  return request({
    url: `/project/${pId}/version/${vId}`,
    method: 'DELETE'
  })
}

export function getProjectIssueList(pId) {
  return request({
    url: `/project/${pId}/issues`,
    method: 'GET'
  })
}

// 取得project內所有issue清單 [0.5 RoadMap_Detail]
export function getProjectIssueListByVersion(pId, params) {
  return request({
    url: `/project/${pId}/issues`,
    method: 'GET',
    params
  })
}

// 建立專案內成員
export function addProjectMember(pId, data = { user_id: '' }) {
  return request({
    url: `/project/${pId}/member`,
    method: 'POST',
    data
  })
}

// 專案成員刪除
export function deleteProjectMember(pId, user_id) {
  return request({
    url: `/project/${pId}/member/${user_id}`,
    method: 'DELETE'
  })
}

// 取得檔案列表
export function getProjectFileList(pId) {
  return request({
    url: `/project/${pId}/file`,
    method: 'GET'
  })
}

// 下載檔案
export function downloadProjectFile(params = { id: '', filename: '', project_id: '' }) {
  return request({
    url: `/download`,
    method: 'GET',
    responseType: 'arraybuffer',
    params
  })
}

// 上傳檔案
export function uploadProjectFile(pId, data) {
  return request({
    url: `/project/${pId}/file`,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

export function deleteProjectFile(file_id) {
  return request({
    url: '/file/' + file_id,
    method: 'DELETE'
  })
}

export function getPipelineDefaultBranch(rId) {
  return request({
    url: `/project/${rId}/pipeline/default_branch`,
    method: 'get'
  })
}

export function editPipelineDefaultBranch(rId, data) {
  return request({
    url: `/project/${rId}/pipeline/default_branch`,
    method: 'put',
    data
  })
}

export function getPipelineBranch(rId) {
  return request({
    url: `/project/${rId}/pipeline/branches`,
    method: 'get'
  })
}

export function editPipelineBranch(rId, data) {
  return request({
    url: `/project/${rId}/pipeline/branches`,
    method: 'put',
    data
  })
}

export function getParticipateProject(user_id) {
  return request({
    url: `/projects_by_user/${user_id}`,
    method: 'get'
  })
}
