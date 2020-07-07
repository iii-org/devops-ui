const Mock = require('mockjs')

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    'author': '@name()',
    'mockUnit|1': function() {
      return "@pick(['day ago', 'mins ago', 'hours ago'])"
    },
    'mockNum|1-24': 24,
    'commit_id': '@guid(8)',
    'commit_time'() {
      return this.mockNum + ' ' + this.mockUnit
    },
    'commit_message': '@sentence(1,2)'
  }]
})

module.exports = [
  {
    url: '/devops-ui/commitList/[A-Za-z0-9]',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        message: 'success',
        data: {
          total: items.length,
          items: items
        }
      }
    }
  }
]
