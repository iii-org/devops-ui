const Mock = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    'work_num|2000-5000': 2000,
    'work_type|1': ['Feature', 'Bug', 'Document'],
    'priority|1': ['Urgent', 'High', 'Normal', 'Low'],
    'status|1': ['Assigned', 'Active', 'Solved', 'Responsed', 'Finished'],
    project: '@word(3,5)',
    work_name: '@word(5, 10)',
    work_start_at: '@date',
    work_end_at: '@date',
    'last_test_result|1': ['Successful', 'Failed'],
    pageviews: '@integer(300, 5000)'
  }]
})

module.exports = [
  {
    url: '/devops-ui/worklist/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  }
]
