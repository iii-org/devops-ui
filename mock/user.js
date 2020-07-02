const Mock = require('mockjs')

const mock_user_login = Mock.mock({
  'data': {
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1OTM3MDE1NDgsIm5iZiI6MTU5MzcwMTU0OCwianRpIjoiZDdkZjljYjMtNjM0My00ZmU3LWI5ZTMtZjJmMjAzNTIxZjg0IiwiZXhwIjoxNTkzNzg3OTQ4LCJpZGVudGl0eSI6ImJlY2t5IiwiZnJlc2giOmZhbHNlLCJ0eXBlIjoiYWNjZXNzIn0.g6NHCRdfsaoD_RjRi_B0jGVTLjEJgxQNFiGvHF98q6I'
  }
})

const mock_user_info = Mock.mock({
  'data': {
    "name": "nathan",
    "email": "nathan@iii.org.tw",
    "phone": "0933333666",
    "group": {
      "name": "admin"
    },
    "role": {
      "nname": "admin"
    }
  }
})

module.exports = [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      return {
        message: 'success',
        data: mock_user_login.data
      }
    }
  },

  // get user info
  {
    url: '/user/info',
    type: 'get',
    response: config => {
      return {
        code: 20000,
        message: 'success',
        data: mock_user_info.data
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
