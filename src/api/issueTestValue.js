import request from '@/utils/request'

export const getTestValueType = () => request.get(`/testValues/support_types`)
export const getTestValueLocation = () => request.get(`/testValues/support_locations`)
export const getTestValueByItem = (item_id) => request.get(`/testValues_by_testItem/${item_id}`)
export const addTestValueByItem = (item_id, data) => request.post(`/testValues_by_testItem/${item_id}`, data)
export const deleteTestValue = (value_id) => request.delete(`/testValues/${value_id}`)
