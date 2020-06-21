const Mock = require('mockjs')

const mock_issue_list = Mock.mock({
  'data|10': [{
    id: '@id',
    'issue_num|2000-5000': 2000,
    'work_type|1': ['Feature', 'Bug', 'Document'],
    'priority|1': ['Urgent', 'High', 'Normal', 'Low'],
    'status|1': ['Assigned', 'Active', 'Solved', 'Responsed', 'Finished'],
    project: '@word(3,5)',
    work_name: '@word(5, 10)',
    last_update_at: '@datetime',
    'last_test_result|1': ['Successful', 'Failed'],
    pageviews: '@integer(300, 5000)'
  }]
})

const mock_issue = Mock.mock({
  'data': {
    'issue_num|2000-5000': 2000,
    description: '@sentence(10, 20)',
    'type|1': ['Feature', 'Bug', 'Document'],
    'priority|1': ['Urgent', 'High', 'Normal', 'Low'],
    'status|1': ['Assigned', 'Active', 'Solved', 'Responsed', 'Finished'],
    project: '@word(3,5)',
    name: '@word(5, 10)',
    start_time: '@date',
    end_time: '@date',
    'custom_fields|1-10': [{
      'name': '@sentence(10, 20)',
      'create_time': '@datetime'
    }],
    last_update_at: '@datetime',
    'last_test_result|1': ['Successful', 'Failed'],
    'process|0-100': 30
  }
})

module.exports = [
  {
    url: '/issues_by_user/[A-Za-z0-9]',
    type: 'get',
    response: config => {
      const issue_list = mock_issue_list.data
      return {
        code: 20000,
        message: 'success',
        total: issue_list.length,
        data: issue_list
      }
    }
  },
  {
    url: '/issues/rd/[A-Za-z0-9]',
    type: 'get',
    response: config => {
      const issue = mock_issue.data
      return {
        code: 20000,
        message: 'success',
        data: issue
      }
    }
  }
]
