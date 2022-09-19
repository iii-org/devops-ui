import request from '@/utils/request'

export const getSystemServerList = () => request.get(`/v2/monitoring/services_list`)
export const getSystemServerStatus = () => request.get(`/v2/monitoring/alive`)
export const getServerStatus = (server) => request.get(`/v2/monitoring/${server}/alive`)
export const getHarborUsage = () => request.get(`/v2/monitoring/harbor/usage`)
export const setReadMessage = (user_id, msg_ids) => request.post(`/v2/notification_message_reply/${user_id}`, msg_ids)
export const getMessageList = (params) => request.get(`/v2/notification_message_list`, { params })
export const getMessageListAdmin = (params) => request.get(`/v2/notification_message_list/admin`, { params })
export const createMessage = (params) => request.post(`/v2/notification_message`, params)
export const deleteMessage = (msg_id) => request.delete(`/v2/notification_message/${msg_id}`)
export const closeMessage = (msg_id) => request.post(`/v2/notification_message/${msg_id}/close`)
