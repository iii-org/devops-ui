import request from '@/utils/request'

export const getRedmineMailActive = () => request.get(`/mail/active`)
export const getUserRedmineMailProfile = () => request.get(`/mail`)
export const editUserRedmineMailProfile = (data) => request.put(`/mail`, data)
