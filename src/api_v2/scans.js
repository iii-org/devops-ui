import request from '@/utils/request'

export const getPluginPod = (project_id, plugin_name) => request.get(`/v2/project/${project_id}/plugin?plugin_name=${plugin_name}`)
