import { getTagsId as GTID, newTag as NT } from '@/api/tags'

const state = {}

const mutations = {
  
}

const actions = {
  async getTagsId({ commit, rootState }, rId) {
    try {
      const response = await GTID(rId)
      const { data } = response
    } catch (error) {
      console.error(error.toString())
    }
  },
  async newTag({ dispatch }, {rId, data}) {
      try {
        const response = await NT(rId, data)
        await new Promise(resolve =>{
            setTimeout(async ()=>{
              await dispatch('getBranchesByProject', rId)
              resolve()
            }, 1000)
          })
        // console.log(response)
        return (response)
      } catch (error) {
        console.error(error.toString())
        return (error)
      }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

