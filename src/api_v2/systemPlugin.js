import request from '@/utils/request'

export const getPlugins = () => request.get(`/v2/plugins`)
export const getPluginDetails = (plugin_id) => request.get(`/v2/plugins/${plugin_id}`)
export const updatePlugin = (plugin_name, data) => request.patch(`/v2/plugins/${plugin_name}`, data)
export const deletePlugin = (plugin_id) => request.delete(`/v2/plugins/${plugin_id}`)
