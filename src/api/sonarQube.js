import request from '@/utils/request'

export const getSonarQubeData = (project_name) => request.get(`/sonarqube/${project_name}`)
export const getSonarQubePod = (project_id) => request.get(`/project/${project_id}/plugin?plugin_name=sonarqube`)
