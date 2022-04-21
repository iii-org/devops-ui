<template>
  <el-form-item :label="$t('Issue.Tag')" prop="tags">
    <el-select
      v-model="form.tags"
      :placeholder="$t('Issue.NoTag')"
      style="width: 100%"
      clearable
      filterable
      remote
      multiple
      value-key="tags"
      :remote-method="getSearchTags"
      @focus="getSearchTags()"
    >
      <el-option-group
        v-for="group in tagsList"
        :key="group.name"
        :label="group.name"
      >
        <template v-for="item in group.options">
          <el-option
            :key="item.id"
            :value="item.id"
            :label="item.name"
          />
        </template>
      </el-option-group>
    </el-select>
  </el-form-item>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { getTagsByName, getTagsByProject } from '@/api/projects'

export default {
  name: 'Tags',
  props: {
    form: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tagsList: [],
      tagsString: '',
      cancelToken: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  mounted() {
    this.getSearchTags()
  },
  methods: {
    checkToken() {
      if (this.cancelToken) this.cancelToken.cancel()
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      return CancelToken.token
    },
    async getSearchTags(query) {
      const tag_name = query || null
      const tags = await this.fetchTagsData(tag_name)
      this.getTagsList(tag_name, tags, query)
    },
    async fetchTagsData(tag_name) {
      const pId = this.selectedProjectId
      const cancelToken = this.checkToken()
      const params = { project_id: pId, tag_name }
      const res = tag_name === null ? await getTagsByProject(pId) : await getTagsByName(params, { cancelToken })
      const tags = res.data.tags
      this.cancelToken = null
      return tags
    },
    getTagsList(tag_name, tags, query) {
      const tagsList = []
      const tag_sorts = tag_name === null ? ['LastResult', 'All'] : ['AddTag']
      tag_sorts.forEach(sort => {
        const list = this.getTagsLabel(tags, sort, query)
        if (list.options.length > 0) tagsList.push(list)
      })
      this.tagsList = tagsList
    },
    getTagsLabel(tags, tag_sort, query) {
      const label = {}
      const addTag = [{ id: `tag__${query}`, name: query }]
      const showTags = this.getShowTags(tag_sort, tags, addTag)
      const name = `Issue.${tag_sort}`
      label.name = this.$t(name)
      label.options = showTags
      return label
    },
    getShowTags(tag_sort, tags, addTag) {
      let showTags = null
      const last_three = -3
      // three type: 'All', 'LastResult', 'AddTag'
      switch (tag_sort) {
        case 'LastResult':
          showTags = tags.slice(last_three)
          break
        case 'AddTag':
          showTags = addTag
          break
        default:
          showTags = tags
      }
      return showTags
    }
  }
}
</script>
