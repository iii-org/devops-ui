import request from '@/utils/request'

export const getSonarQubeData = (project_name) => request.get(`/v2/sonarqube/${project_name}`)
export const getSonarQubePod = (project_id) => request.get(`/v2/project/${project_id}/plugin?plugin_name=sonarqube`)
