import request from '@/utils/request'

export const getDevopsVersion = () => request.get(`/v2/devops_version/check`)
export const updateDevopsVersion = () => request.patch(`/v2/devops_version/update`)
export const getDevopsApiServerVersion = () => request.get(`/v2/devops_version`)
export const updateSystemInfoReport = () => request.put(`/v2/system_info_report`)
