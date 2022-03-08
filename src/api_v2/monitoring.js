import request from '@/plugins/axios'

export const getSystemServerStatus = () => request.get(`/v2/monitoring/alive`)
export const getRancherStatus = () => request.get(`/v2/monitoring/rancher/alive`)
export const getK8sStatus = () => request.get(`/v2/monitoring/k8s/alive`)
export const getRedmineStatus = () => request.get(`/v2/monitoring/redmine/alive`)
export const getGitlabStatus = () => request.get(`/v2/monitoring/gitlab/alive`)
export const getHarborStatus = () => request.get(`/v2/monitoring/harbor/alive`)
export const getSonarqubeStatus = () => request.get(`/v2/monitoring/sonarqube/alive`)
