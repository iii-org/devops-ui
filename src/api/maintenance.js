import request from '@/utils/request'

export const getSystemSecrets = () => request.get(`/maintenance/secretes_into_rc_all`)
export const addSystemSecret = (data) => request.post(`/maintenance/secretes_into_rc_all`, data)
export const deleteSystemSecret = (secretName) => request.delete(`/maintenance/secretes_into_rc_all/${secretName}`)
export const getSystemRegistries = () => request.get(`/maintenance/registry_into_rc_all`)
export const addSystemRegistry = (data) => request.post(`/maintenance/registry_into_rc_all`, data)
export const deleteSystemRegistry = (registryName) => request.delete(`/maintenance/registry_into_rc_all/${registryName}`)
