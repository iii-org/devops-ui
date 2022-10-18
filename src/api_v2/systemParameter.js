import request from '@/utils/request'

export const getSystemParameter = () => request.get(`/v2/system_parameter`)
export const updateSystemParameter = (param_id, data) => request.put(`/v2/system_parameter/${param_id}`, data)
export const runSystemParameter = (data) => request.post(`/v2/system_parameter`, data)
export const getGithubVerifyStatus = () => request.get(`/v2/system_parameter/github_verify/status`)
export const getUploadFileSize = () => request.get(`/v2/system_parameter/upload_file_size`)
export const updateUploadFileSize = (data) => request.patch(`/v2/system_parameter/upload_file_size`, data)
export const getUploadFileType = () => request.get(`/v2/system_parameter/upload_file_type/names`)
export const getUploadFileTypeList = () => request.get(`/v2/system_parameter/upload_file_type`)
export const addUploadFileType = (data) => request.post(`/v2/system_parameter/upload_file_type`, data)
export const updateUploadFileType = (type_id, data) => request.patch(`/v2/system_parameter/upload_file_type/${type_id}`, data)
export const deleteUploadFileType = (type_id) => request.delete(`/v2/system_parameter/upload_file_type/${type_id}`)
