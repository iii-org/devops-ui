import request from '@/utils/request'

export const getDevopsVersion = () => request.get(`/devops_version/check`)
export const updateDevopsVersion = () => request.patch(`/devops_version/update`)
export const getDevopsApiServerVersion = () => request.get(`/devops_version`)

