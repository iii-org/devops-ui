import request from '@/utils/request'

export const getSbomList = (project_id, params) => request.get(`/v2/sbom/${project_id}/list`, { params })
export const getSbomFile = (sbom_id) => request.get(`/v2/sbom/${sbom_id}/files`)
export const getSbomDownloadFile = (sbom_id, params) => request.get(`/v2/sbom/${sbom_id}/downloadreport`, { params, responseType: 'blob' })
export const getSbomRiskOverview = (sbom_id) => request.get(`/v2/sbom/${sbom_id}/riskoverview`)
export const getSbomRiskDetail = (sbom_id, params) => request.get(`/v2/sbom/${sbom_id}/riskdetail`, { params })
