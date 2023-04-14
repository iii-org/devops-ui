import request from '@/utils/request'

export const getSonarQubeData = (project_name) => request.get(`/sonarqube/${project_name}`)
