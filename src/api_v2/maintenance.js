import request from '@/plugins/axios'

export const getSystemSecrets = () => request.get(`/v2/maintenance/secretes_into_rc_all`)
export const addSystemSecret = (data) => request.post(`/v2/maintenance/secretes_into_rc_all`, data)
export const deleteSystemSecret = (secret_name) => request.delete(`/v2/maintenance/secretes_into_rc_all/${secret_name}`)
export const getSystemRegistries = () => request.get(`/v2/maintenance/registry_into_rc_all`)
export const addSystemRegistry = (data) => request.post(`/v2/maintenance/registry_into_rc_all`, data)
export const deleteSystemRegistry = (registry_name) =>
  request.delete(`/v2/maintenance/registry_into_rc_all/${registry_name}`)
