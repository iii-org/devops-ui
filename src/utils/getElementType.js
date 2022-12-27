/**
 * For status、priority、tracker to use
 */

export const getStatusTagType = (status) => {
  switch (status) {
    case 'Active':
      return '已開立'
    case 'Assigned':
      return '已分派'
    case 'Closed':
      return '已關閉'
    case 'Solved':
      return '已解決'
    case 'Responded':
      return '已回應'
    case 'Finished':
      return '已完成'
  }
}

export const getPriorityTagType = (priority) => {
  switch (priority) {
    case 'Immediate':
      return '緊急'
    case 'High':
      return '高'
    case 'Normal':
      return '一般'
    case 'Low':
      return '低'
  }
}

export const getCategoryTagType = (category) => {
  switch (category) {
    case 'Epic':
      return '需求規格'
    case 'Audit':
      return '合規需求'
    case 'Feature':
      return '功能設計'
    case 'Bug':
      return '程式錯誤'
    case 'Issue':
      return '議題'
    case 'Change Request':
      return '變更請求'
    case 'Risk':
      return '風險管理'
    case 'Test Plan':
      return '測試計畫'
    case 'Fail Management':
      return '異常管理'
  }
}
