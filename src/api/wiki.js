import request from '@/utils/request'

export function getWikiList(project_id) {
  return request({
    url: `/project/${project_id}/wiki`,
    method: 'get'
  })
}

export function getWikiDetail(project_id, wiki_title) {
  return request({
    url: `/project/${project_id}/wiki/${wiki_title}`,
    method: 'get'
  })
}

export function putWikiDetail(project_id, wiki_title, data = { wiki_text: '' }) {
  return request({
    url: `/project/${project_id}/wiki/${wiki_title}`,
    method: 'put',
    data
  })
}

export function deleteWiki(project_id, wiki_title) {
  return request({
    url: `/project/${project_id}/wiki/${wiki_title}`,
    method: 'delete'
  })
}
