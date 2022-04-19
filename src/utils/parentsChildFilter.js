import { getHasSon, getProjectRelation } from '@/api_v2/projects'

const fetchHasSon = async (pId) => {
  const hasSon = await getHasSon(pId)
  return hasSon.has_child
}
const isProjectHasSon = async (filterOptions) => {
  const filterOptionsWithProject = [{
    id: filterOptions.length + 1,
    value: 'project',
    placeholder: 'Project'
  }].concat(filterOptions)
  return filterOptionsWithProject
}

const getProjectRelationData = async (project) => {
  const projectRelation = (await getProjectRelation(project.id)).data
  const projectRelationList = [
    { id: project.id, name: project.display }
  ]
  projectRelationList.push(...projectRelation[0].child)
  return projectRelationList
}

export {
  fetchHasSon,
  isProjectHasSon,
  getProjectRelationData
}
