import request from '@/plugins/axios'

export const getUserRedmineMailProfile = () => request.get(`/v2/mail`)
export const editUserRedmineMailProfile = (data) => request.put(`/v2/mail`, data)
