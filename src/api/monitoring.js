import request from '@/utils/request'

export const getSystemServerStatus = () => request.get(`/monitoring/alive`)
export const getRancherStatus = () => request.get(`/monitoring/rancher/alive`)
export const getK8sStatus = () => request.get(`/monitoring/k8s/alive`)
export const getRedmineStatus = () => request.get(`/monitoring/redmine/alive`)
export const getGitlabStatus = () => request.get(`/monitoring/gitlab/alive`)
export const getHarborStatus = () => request.get(`/monitoring/harbor/alive`)
export const getSonarqubeStatus = () => request.get(`/monitoring/sonarqube/alive`)
