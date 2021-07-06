import request from '@/utils/request'

export const getWikiList = (project_id) => request.get(`/project/${project_id}/wiki`)
export const getWikiDetail = (project_id, wiki_title) => request.get(`/project/${project_id}/wiki/${wiki_title}`)
export const putWikiDetail = (project_id, wiki_title, data = { wiki_text: '' }) => request.put(`/project/${project_id}/wiki/${wiki_title}`, data)
export const deleteWiki = (project_id, wiki_title) => request.delete(`/project/${project_id}/wiki/${wiki_title}`)
