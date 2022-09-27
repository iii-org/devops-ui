import request from '@/utils/request'

export const getSystemServerList = () => request.get(`/monitoring/services_list`)
export const getSystemServerStatus = () => request.get(`/monitoring/alive`)
export const getServerStatus = (server) => request.get(`/monitoring/${server}/alive`)
export const getHarborUsage = () => request.get(`/monitoring/harbor/usage`)
export const setReadMessage = (user_id, msg_ids) => request.post(`/notification_message_reply/${user_id}`, msg_ids)
export const getMessageList = (params) => request.get(`/notification_message_list`, { params })
export const getMessageListAdmin = (params) => request.get(`/notification_message_list/admin`, { params })
export const createMessage = (params) => request.post(`/notification_message`, params)
export const deleteMessage = (msg_id) => request.delete(`/notification_message/${msg_id}`)
export const closeMessage = (msg_id) => request.post(`/notification_message/${msg_id}/close`)
