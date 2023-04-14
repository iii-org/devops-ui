import request from '@/utils/request'

export const getPluginPod = (project_id, plugin_name) => request.get(`/project/${project_id}/plugin?plugin_name=${plugin_name}`)
