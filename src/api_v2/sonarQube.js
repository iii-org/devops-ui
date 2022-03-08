import request from '@/plugins/axios'

export const getSonarQubeData = (project_name) => request.get(`/v2/sonarqube/${project_name}`)
