import request from '@/utils/request'

export const getUserRedmineMailProfile = () => request.get(`/mail`)
export const editUserRedmineMailProfile = (data) => request.put(`/mail`, data)
