import request from '@/utils/request'

export const getTestItemByCase = (case_id) => request.get(`/testItems_by_testCase/${case_id}`)
export const addTestItemByCase = (case_id, data) => request.post(`/testItems_by_testCase/${case_id}`, data)
export const updateTestItemByCase = (case_id, data) => request.put(`/testItems/${case_id}`, data)
export const deleteTestItem = (item_id) => request.delete(`/testItems/${item_id}`)
