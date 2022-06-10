import request from '@/utils/request'

export const getExcalidraw = (params) => request.get(`/v2/excalidraw`, { params })
export const createExcalidraw = (data) => request.post(`/v2/excalidraw`, data,
  { headers: { 'Content-Type': 'multipart/form-data' }}
)
export const updateExcalidraw = (excalidraw_id, data) => request.patch(`/v2/excalidraw/${excalidraw_id}`,
  data, { headers: { 'Content-Type': 'multipart/form-data' }}
)
export const deleteExcalidraw = (excalidraw_id) => request.delete(`/v2/excalidraw/${excalidraw_id}`)
