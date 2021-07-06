import request from '@/utils/request'

export const getList = (params) => request.get(`/devops-ui/worklist/list`, { params })
