import request from '@/utils/request'

export const getRancherCatalogs = () => request.get('/v2/rancher/catalogs')
export const createRancherCatalogs = (data) => request.post(`/v2/rancher/catalogs`, data)
export const refreshRancherCatalogs = () => request.post(`/v2/rancher/catalogs_refresh`)
