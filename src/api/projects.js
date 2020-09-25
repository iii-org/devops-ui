import request from '@/utils/request'

export function getProjectList(userId, params) {
  return request({
    url: '/project/rd/' + userId,
    method: 'get',
    params
  })
}

export function getActivityLog(activity_id) {
  return request({
    url: `/devops-ui/projects/activity/log/${activity_id}`,
    method: 'get'
  })
}

export function queryProjectList() {
  return request({
    url: `/project/list`,
    method: 'get'
  })
}

export function addNewProject(data = { name: '', disabled: false, description: '' }) {
  return request({
    url: `/project`,
    method: 'POST',
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
  return request({
    url: `/project/${pId}/user/list?exclude=1`,
    method: 'GET'
  })
}

//取得專案議題狀態 [ 0_1 單一專案概述]
export function getProjectIssueProgress(pId, params = {}) {
  return request({
    url: `/project/${pId}/issues_progress`,
    method: 'GET',
    params
  })
}

//取得專案議題篩選條件狀態 [0.1_單一專案概述]
export function getProjectIssueStatistics(pId, params) {
  return request({
    url: `/project/${pId}/issues_statistics`,
    method: 'GET',
    params
  })
}

//專案內已分配人員 [ 0_1 單一專案概述]
export function getProjectUserList(pId) {
  return request({
    url: `/project/${pId}/user/list`,
    method: 'GET'
  })
}

//專案內可分配版本　[2.3.1 新增議題　2.3.3.1 編輯議題］
export function getProjectVersion(pId) {
  return request({
    url: `/project/${pId}/version/list`,
    method: 'GET'
  })
}

export function getProjectIssueList(pId) {
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
