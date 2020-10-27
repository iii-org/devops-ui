import request from '@/utils/request'

export function getTestItem() {
  // return request({
  //   url: `/testItems`,
  //   method: 'get'
  // })
  return {
    'message': 'success',
    'data': [{
      'order': 1,
      'name': '取得伺服器資訊',
      'api_method': 'GET',
      'api_path': 'serverinfo',
      'last_test_result': {
        'success': 5,
        'fail': 3
      },
      'last_test_at': "2020-09-29T10:10:25Z"
    }]
  }
}

export function getTestItemById() {
  return {
    'message': 'success',
    'data': {
      'order': 1,
      'name': '取得伺服器資訊',
      'api_method': 'GET',
      'api_path': 'serverinfo',
      'last_test_result': {
        'success': 5,
        'fail': 3
      },
      'last_test_at': "2020-09-29T10:10:25Z"
    }
  }
}

export function addTestItem(data) {
  // return request({
  //   url: `/testItems`,
  //   method: 'post',
  //   data
  // })
  return {
    'message': 'success'
  }
}