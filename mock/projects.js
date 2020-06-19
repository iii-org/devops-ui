const Mock = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    'project_name': '@title(2)',
    'items|0-10': 10,
    'mockUnit|1': function() {
      if (this.mockNum > 1) return "@pick(['days', 'weeks', 'months'])"
      return "@pick(['day', 'week', 'month'])"
    },
    'mockNum|1-4': 4,
    'deadline'() {
      return this.mockNum + ' ' + this.mockUnit
    },
    'brancheNum|1-100': 100,
    'last_test_at': '@datetime',
    'last_test_total|1-5': 5,
    'last_test_passed'() {
      return '@integer(1, ' + this.last_test_total + ')'
    }
  }]
})

module.exports = [
  {
    url: '/devops-ui/projects/list',
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
