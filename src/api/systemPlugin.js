import request from '@/utils/request'

export const getPlugins = () => request.get(`/plugins`)
export const getPluginDetails = plugin_id => request.get(`/plugins/${plugin_id}`)
export const updatePlugin = (plugin_name, data) => request.patch(`/plugins/${plugin_name}`, data)
export const addPlugin = (plugin_name, data) => request.post(`/plugins/${plugin_name}`, data)
export const deletePlugin = plugin_id => request.delete(`/plugins/${plugin_id}`)
