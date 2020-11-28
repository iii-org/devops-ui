import request from '@/utils/request'

export function getProjectList(userId, params) {
  return request({
    url: '/projects_by_user/' + userId,
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
export function getProjectIssueStatistics(pId, params) {
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

// 專案內可分配版本　[2.3.1 新增議題　2.3.3.1 編輯議題］
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

// 取得檔案列表
export function getProjectFileList(pId) {
  return request({
    url: `/project/${pId}/file`,
    method: 'GET'
  })
}

// 下載檔案
export function downloadProjectFile(params = { 'id': '', 'filename': '' }) {
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

export function getProjectUsage(pId) {
  return {
    message: 'success',
    data: {
      cpu: { usage: 1.58, limit: 8 },
      memory: { usage: '8.34GiB', limit: '15.6GiB' },
      pods: { usage: 5, limit: 20 },
      service: { usage: 5, limit: 10 },
      secrets: { usage: 5, limit: 20 },
      images: { usage: '4.3 GiB', limit: '25 GiB' }
    }
  }
  // return request({
  //   url: `/project/${pId}`,
  //   method: 'GET'
  // })
}

export function getProjectResource(pId) {
  return {
    message: 'success',
    data: {
      resource: [
        { name: 'test-project/conarqube', artifacts: 7, pull: 15, lastModifiedTime: '2020/03/31' },
        { name: 'test-project/mongo', artifacts: 10, pull: 30, lastModifiedTime: '2020/05/31' },
        { name: 'test-project/checkmarx', artifacts: 3, pull: 9, lastModifiedTime: '2020/07/31' }
      ],
      storage: {
        name: 'test-project',
        consumption: {
          use: 1.48,
          total: 2
        }
      }
    }

  }
  // return request({
  //   url: `/project/${pId}`,
  //   method: 'GET'
  // })
}

export function getProjectArtifacts(pId) {
  return {
    message: 'success',
    data: [
      { tags: '4.6.0-jdk8-alpine', size: '139.95MB', vulnerabilities: 'Unknown (42)', digest: '7418f477', labels: ['release'], pushTime: '2020/03/31' },
      { tags: '4.7.0-jdk8-alpine', size: '141.05MB', vulnerabilities: 'Unknown (42)', digest: '6093ee35', pushTime: '2020/03/31' }
    ]
  }
  // return request({
  //   url: `/project/${pId}`,
  //   method: 'GET'
  // })
}
