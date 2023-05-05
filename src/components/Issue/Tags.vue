<template>
  <el-form-item prop="tags">
    <template slot="label">
      {{ $t('Issue.Tag') }}
      <span v-if="isTagsChange">
        <el-button
          class="action"
          type="success"
          size="mini"
          icon="el-icon-check"
          @click="updateTags"
        />
        <el-button
          class="action"
          type="danger"
          size="mini"
          icon="el-icon-close"
          @click="cancelInput"
        />
      </span>
    </template>
    <el-select
      v-model="form.tags"
      style="width: 100%"
      clearable
      filterable
      remote
      multiple
      value-key="tags"
      :placeholder="tagsList && tagsList.length > 0 ? $t('RuleMsg.PleaseSelect') : $t('Issue.NoTag')"
      :loading="isLoading"
      :remote-method="getSearchTags"
      @focus="getSearchTags()"
    >
      <template v-if="tagsList && tagsList.length > 0">
        <el-option-group
          v-for="group in tagsList"
          :key="group.name"
          :label="group.name"
        >
          <el-option
            v-for="item in group.options"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          />
        </el-option-group>
      </template>
      <template v-else>
        <el-option
          v-for="item in []"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </template>
    </el-select>
  </el-form-item>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { getTagsByName, getTagsByProject } from '@/api/projects'
import { updateIssue } from '@/api/issue'

export default {
  name: 'Tags',
  props: {
    issueId: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isLoading: false,
      tag_name: '',
      tagsList: [],
      isRepeated: false,
      cancelToken: null,
      originTags: []
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    isTagsChange() {
      if (!this.form.tags) return false
      if (this.form.tags.length !== this.originTags.length) return true
      return !this.originTags.every((item) => this.form.tags.includes(item))
    }
  },
  mounted() {
    this.getSearchTags()
    const unwatch = this.$watch('form.tags', (value) => {
      this.originTags = JSON.parse(JSON.stringify(value))
      unwatch()
    })
  },
  methods: {
    checkToken() {
      if (this.cancelToken) this.cancelToken.cancel()
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      return CancelToken.token
    },
    async getSearchTags(query) {
      this.isRepeated = false
      this.tag_name = query || null
      const tags = await this.fetchTagsData(this.tag_name)
      this.getTagsList(this.tag_name, tags, query)
    },
    async fetchTagsData(tag_name) {
      this.isLoading = true
      const pId = this.form.project_id && this.form.project_id !== 0 ? this.form.project_id : this.selectedProjectId
      const cancelToken = this.checkToken()
      const params = { project_id: pId, tag_name }
      const res = tag_name === null
        ? await getTagsByProject(pId)
        : await getTagsByName(params, { cancelToken })
      const tags = res.data.tags
      this.isLoading = false
      this.cancelToken = null
      return tags
    },
    getTagsList(tag_name, tags, query) {
      const tagsList = []
      const tag_sorts = tag_name === null ? ['LastResult', 'All'] : ['AddTag', 'Result']
      tag_sorts.forEach(sort => {
        const list = this.getTagsLabel(tags, sort, query)
        if (list.options.length > 0) tagsList.push(list)
      })
      if (this.isRepeated) tagsList.shift()
      this.tagsList = tagsList
    },
    getTagsLabel(tags, tag_sort, query) {
      const label = {}
      const addTag = [{ id: `tag__${query}`, name: query }]
      const showTags = this.getShowTags(tag_sort, tags, addTag)
      if (tag_sort === 'Result') {
        this.isRepeated = showTags.map((item) => item.name).includes(this.tag_name)
      }
      const name = `Issue.${tag_sort}`
      label.name = this.$t(name)
      label.options = showTags
      return label
    },
    getShowTags(tag_sort, tags, addTag) {
      let showTags = null
      const last_three = -3
      // four type: 'All', 'LastResult', 'AddTag', 'Result'
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
    },
    async updateTags() {
      this.$emit('update:loading', true)
      const sendForm = new FormData()
      sendForm.append('tags', this.form.tags)
      await updateIssue(this.issueId, sendForm).then(() => {
        this.$emit('update')
      }).then(() => {
        this.originTags = JSON.parse(JSON.stringify(this.form.tags))
      })
      this.$emit('update:loading', false)
    },
    cancelInput() {
      this.form.tags = JSON.parse(JSON.stringify(this.originTags))
    }
  }
}
</script>

<style lang="scss" scoped>
.el-button--success{
  color: #85ce61;
  border: 1px solid #989898;
  background: none;
  -webkit-transition: all .6s ease;
  transition: all .6s ease;
  &:hover {
    color: #fff;
    border: 1px solid #67c23a;
    background: #67c23a;
  }
}

.el-button--danger{
  color: #F56C6C;
  border: 1px solid #989898;
  background: none;
  -webkit-transition: all .6s ease;
  transition: all .6s ease;
  &:hover {
    color: #fff;
    border: 1px solid #F56C6C;
    background: #F56C6C;
  }
}

.action {
  margin: 0;
  &.el-button--mini {
    padding: 5px;
  }
}
</style>
