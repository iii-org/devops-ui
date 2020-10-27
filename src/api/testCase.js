import request from '@/utils/request'

export function getTestCase() {
  // return request({
  //   url: `/testItems`,
  //   method: 'get'
  // })
  return {
    'message': 'success',
    'data': [{
      'order': 1,
      'name': '測試第一個工作',
      'last_test_result': '[Passed] Test response'
    },{
      'order': 2,
      'name': '測試第二個工作',
      'last_test_result': '[Passed] Test response'
    }]
  }
}

export function addTestCase(data) {
  // return request({
  //   url: `/testItems`,
  //   method: 'post',
  //   data
  // })
  return {
    'message': 'success'
  }
}

export function getTestValue() {
  // return request({
  //   url: `/testItems`,
  //   method: 'get'
  // })
  return {
    'message': 'success',
    'data': [{
      'order': 1,
      'type': 'Request',
      'location': 'Body',
      'key': 'id',
      'value': '4'
    },{
      'order': 2,
      'type': 'Response',
      'location': 'Body',
      'key': 'task',
      'value': 'build an WEB'
    }]
  }
}

export function addTestValue(data) {
  // return request({
  //   url: `/testItems`,
  //   method: 'post',
  //   data
  // })
  return {
    'message': 'success'
  }
}