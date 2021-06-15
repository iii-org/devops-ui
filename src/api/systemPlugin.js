import request from '@/utils/request'

export const getPlugins = () => request.get(`/plugins`)
export const getPluginDetails = plugin_id => request.get(`/plugins/${plugin_id}`)
export const updatePlugin = (plugin_id, data) => request.put(`/plugins/${plugin_id}`, data)
export const addPlugin = () => request.post(`/plugins`)
