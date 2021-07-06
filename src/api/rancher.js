import request from '@/utils/request'

export const getRancherCatalogs = () => request.get('/rancher/catalogs')
export const createRancherCatalogs = (data) => request.post(`/rancher/catalogs`, data)
export const refreshRancherCatalogs = () => request.post(`/rancher/catalogs_refresh`)
