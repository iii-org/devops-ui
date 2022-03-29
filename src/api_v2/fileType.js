import request from '@/utils/request'

export const getFileNameList = () => request.get(`/v2/system_parameter/upload_file_type/names`)
export const getUploadFileType = () => request.get(`/v2/system_parameter/upload_file_type`)
export const addUploadFileType = (data) => request.post(`/v2/system_parameter/upload_file_type`, data)
export const editUploadFileType = (type_id, data) => request.patch(`/v2/system_parameter/upload_file_type/${type_id}`, data)
export const deleteUploadFileType = (type_id) => request.delete(`/v2/system_parameter/upload_file_type/${type_id}`)
