import request from '@/utils/request'

export function getRancherCatalogs() {
  return request({
    url: '/rancher/catalogs',
    method: 'get'
  })
}

export function createRancherCatalogs(data) {
  return request({
    url: `/rancher/catalogs`,
    method: 'post',
    data
  })
}

export function refreshRancherCatalogs() {
  return request({
    url: `/rancher/catalogs_refresh`,
    method: 'post'
  })
}
