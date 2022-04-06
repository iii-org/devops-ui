import request from '@/utils/request'

export const getSystemServerStatus = () => request.get(`/monitoring/alive`)
export const getRancherStatus = () => request.get(`/monitoring/rancher/alive`)
export const getK8sStatus = () => request.get(`/monitoring/k8s/alive`)
export const getRedmineStatus = () => request.get(`/monitoring/redmine/alive`)
export const getGitlabStatus = () => request.get(`/monitoring/gitlab/alive`)
export const getHarborStatus = () => request.get(`/monitoring/harbor/alive`)
export const getHarborCapacity = () => request.get(`/monitoring/harbor/usage`)
export const getSonarqubeStatus = () => request.get(`/monitoring/sonarqube/alive`)
export const setReadMessage = (user_id, msg_ids) => request.post(`/notification_message_reply/${user_id}`, msg_ids)
export const getMessageList = (params) => request.get(`/notification_message_list`, { params })
