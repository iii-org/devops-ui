const Mock = require('mockjs')

const mock_cicd_pipelines = Mock.mock({
  'data|10': [{
    'index|+1': 1,
    'status|1': ['Succeeded', 'Failed', 'Running'],
    'total_stages|5-10': 1,
    'current_stages|0-5': 1,
    'branch|1': ['master', 'develop', 'hotfix'],
    'commit': /[a-z]\d\d\d[a-z]\d[a-z]\d/,
    commit_message: '@sentence(5, 8)',
    'trigger|1': ['nathan', 'hubert', 'peter'],
    'last_run_at': '@datetime'
  }]
})

const mock_cicd_pipeline_stages = Mock.mock({
  data: [
    {
      number: 1,
      'name': 'Clone From Codebase',
      run_at: '@datetime',
      'content|4': [{
        run_at: '@datetime',
        run_message: '@sentence(10, 20)'
      }]
    },
    {
      number: 2,
      'name': 'Build Image',
      run_at: '@datetime',
      'content|8': [{
        run_at: '@datetime',
        run_message: '@sentence(10, 20)'
      }]
    },
    {
      number: 3,
      'name': 'Upload to Registry',
      run_at: '@datetime',
      'content|4': [{
        run_at: '@datetime',
        run_message: '@sentence(10, 20)'
      }]
    },
    {
      number: 4,
      'name': 'Deploy',
      run_at: '@datetime',
      'content|2': [{
        run_at: '@datetime',
        run_message: '@sentence(10, 20)'
      }]
    }
  ]
})

module.exports = [
  {
    url: '/cicd/pipelines/[0-9]/stages',
    type: 'get',
    response: config => {
      const stages = mock_cicd_pipeline_stages.data
      return {
        message: 'success',
        total: stages.length,
        data: stages
      }
    }
  }, 

  {
    url: '/cicd/pipelines/[0-9]',
    type: 'get',
    response: config => {
      const stages = mock_cicd_pipelines.data
      return {
        message: 'success',
        data: stages[0]
      }
    }
  },

  {
    url: '/cicd/pipelines',
    type: 'get',
    response: config => {
      const pipelines = mock_cicd_pipelines.data
      return {
        message: 'success',
        total: pipelines.length,
        data: pipelines
      }
    }
  }
  
  
]
