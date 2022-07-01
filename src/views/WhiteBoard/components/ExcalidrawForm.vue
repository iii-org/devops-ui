<template>
  <el-form
    ref="form"
    v-loading="isLoading"
    :model="form"
    :rules="rules"
    class="custom-list"
  >
    <el-row>
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item
          :label="$t('general.Name')"
          prop="name"
        >
          <el-input
            v-model="form.name"
            :placeholder="$t('RuleMsg.PleaseInput') + $t('general.Name')"
          />
        </el-form-item>
      </el-col>
      <el-col
        :md="12"
        :span="24"
      >
        <el-form-item :label="$t('Issue.RelatedIssue')">
          <el-select
            v-model="form.issue_ids"
            style="width: 100%"
            :placeholder="$t('Issue.SearchNameOrAssignee')"
            clearable
            filterable
            remote
            multiple
            :remote-method="getIssue"
            :loading="issueLoading"
            @focus="getIssue()"
          >
            <el-option-group
              v-for="group in issueList"
              :key="group.name"
              :label="group.name"
            >
              <template v-for="item in group.options">
                <el-option
                  :key="item.id"
                  :label="'#' + item.id +' - '+item.name"
                  :value="item.id"
                />
              </template>
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectIssueList } from '@/api_v2/projects'
import axios from 'axios'

export default {
  name: 'ExcalidrawForm',
  props: {
    form: {
      type: Object,
      default: () => ({})
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      issueLoading: false,
      issueList: [],
      rules: {
        name: [
          {
            required: true,
            message: this.$t('RuleMsg.PleaseSelect') + this.$t('general.Name'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  mounted() {
    this.getIssue()
  },
  methods: {
    async getIssue(query) {
      const params = this.getSearchParams(query)
      const cancelToken = this.checkToken()
      await getProjectIssueList(this.selectedProjectId, params, { cancelToken })
        .then((res) => { this.issueList = this.getListLabels(res) })
      this.issueLoading = false
      this.cancelToken = null
    },
    getSearchParams(query) {
      const params = {
        selection: true,
        status_id: 'open'
      }
      if (query !== '' && query) {
        params['search'] = query
        this.issueQuery = query
        this.issueLoading = true
      } else {
        params['offset'] = 0
        params['limit'] = 5
        this.issueQuery = null
      }
      return params
    },
    getListLabels(res) {
      let queryList = res.data
      let key = 'Issue.Result'
      if (!this.issueQuery) {
        if (queryList && queryList.hasOwnProperty('issue_list')) {
          queryList = res.data.issue_list
        } else {
          queryList = []
        }
        key = 'Issue.LastResult'
      }
      return [{ name: this.$t(key), options: queryList }]
    },
    checkToken() {
      if (this.cancelToken) this.cancelToken.cancel()
      const CancelToken = axios.CancelToken.source()
      this.cancelToken = CancelToken
      return CancelToken.token
    }
  }
}
</script>

<style>

</style>
