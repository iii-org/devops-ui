import request from '@/utils/request'

export const getRedmineMailActive = () => request.get(`/v2/mail/active`)
export const getUserRedmineMailProfile = () => request.get(`/v2/mail`)
export const editUserRedmineMailProfile = (data) => request.put(`/v2/mail`, data)
