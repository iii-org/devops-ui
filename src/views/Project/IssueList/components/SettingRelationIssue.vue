<template>
  <el-form ref="issueForm" v-loading="isLoading" :model="form" :rules="issueFormRules">
    <el-form-item v-if="target==='Parent'" :label="$t('Issue.ParentIssue')" prop="parent_id">
      <el-select
        v-model="form.parent_id"
        style="width: 100%"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        clearable
        filterable
        remote
        :remote-method="getSearchIssue"
        :loading="issueLoading"
      >
        <el-option-group
          v-for="group in issueList"
          :key="group.name"
          :label="group.name"
        >
          <el-option
            v-for="item in group.options"
            :key="item.id"
            :label="'#' + item.id +' - '+item.name"
            :value="item.id"
          >
            <el-popover
              placement="left"
              width="250"
              trigger="hover"
            >
              <el-card>
                <template slot="header">
                  <tracker :name="item.tracker.name" />
                  #{{ item.id }} - {{ item.name }}
                </template>
                <b>{{ $t('Issue.Description') }}:</b>
                <p>{{ item.description }}</p>
              </el-card>
              <div slot="reference">
                <span
                  style="float: left; width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
                >
                  <b>#<span v-html="highLight(item.id.toString())" /></b> -
                  <span v-html="highLight(item.name)" />
                </span>
                <span style="float: right; color: #8492a6; font-size: 13px"
                      v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
                />
              </div>
            </el-popover>
          </el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-form-item v-else-if="target==='Children'" :label="$t('Issue.ParentIssue')">
      <p>
        <status :name="row.status.name" size="mini" />
        <tracker :name="row.tracker.name" />
        #{{ row.id }} - {{ row.name }}
        <span v-if="row.hasOwnProperty('assigned_to')&&Object.keys(row.assigned_to).length>1">
          ({{ $t('Issue.Assignee') }}: {{ row.assigned_to.name }} - {{ row.assigned_to.login }})</span>
      </p>
    </el-form-item>
    <el-form-item v-if="target==='Parent'" :label="$t('Issue.ChildrenIssue')">
      <p>
        <status :name="row.status.name" size="mini" />
        <tracker :name="row.tracker.name" />
        #{{ row.id }} - {{ row.name }}
        <span v-if="row.hasOwnProperty('assigned_to')&&Object.keys(row.assigned_to).length>1">
          ({{ $t('Issue.Assignee') }}: {{ row.assigned_to.name }} - {{ row.assigned_to.login }})</span>
      </p>
    </el-form-item>
    <el-form-item v-else :label="$t('Issue.ChildrenIssue')" prop="children_id">
      <el-select
        v-model="form.children_id"
        style="width: 100%"
        :placeholder="$t('Issue.SearchNameOrAssignee')"
        clearable
        filterable
        remote
        multiple
        :remote-method="getSearchIssue"
        :loading="issueLoading"
      >
        <el-option-group
          v-for="group in issueList"
          :key="group.name"
          :label="group.name"
        >
          <el-option
            v-for="item in group.options"
            :key="item.id"
            :label="'#' + item.id +' - '+item.name"
            :value="item.id"
          >
            <el-popover
              placement="left"
              width="250"
              trigger="hover"
            >
              <el-card>
                <template slot="header">
                  <tracker :name="item.tracker.name" />
                  #{{ item.id }} - {{ item.name }}
                </template>
                <b>{{ $t('Issue.Description') }}:</b>
                <p>{{ item.description }}</p>
              </el-card>
              <div slot="reference">
                <span
                  style="float: left; width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
                >
                  <b>#<span v-html="highLight(item.id.toString())" /></b> -
                  <span v-html="highLight(item.name)" />
                </span>
                <span style="float: right; color: #8492a6; font-size: 13px"
                      v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
                />
              </div>
            </el-popover>
          </el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    <el-alert v-if="children['append'].length>0||children['remove'].length>0">
      <h3>{{ $t('Issue.CheckChildrenIssueStatus') }}</h3>
      <div v-if="children['append'].length>0">
        {{ $t('general.Add') }}:
        <ul>
          <li v-for="item in children['append']" :key="item">
            <template v-if="issueFamily[item]">
              <b><tracker :name="issueFamily[item].tracker.name" /> #{{ issueFamily[item].id }} - {{ issueFamily[item].subject }}</b> ({{ $t('Issue.OriginalParentIssue') }}:
              <template v-if="issueFamily[item].hasOwnProperty('parent')">
                <tracker :name="issueFamily[item].parent.tracker.name" />
                #{{ issueFamily[item].parent.id }} - {{ issueFamily[item].parent.name }}
                <span v-if="issueFamily[item].parent.hasOwnProperty('assigned_to')&&Object.keys(issueFamily[item].parent.assigned_to).length>1">
                  ({{ $t('Issue.Assignee') }}: {{ issueFamily[item].parent.assigned_to.name }} - {{ issueFamily[item].parent.assigned_to.login }})</span>
              </template>
              <template v-else>
                {{ $t('Issue.NoParentIssue') }}
              </template>)
            </template>
          </li>
        </ul>
      </div>
      <div v-if="children['remove'].length>0">{{ $t('general.Delete') }}:
        <ul>
          <li v-for="item in children['remove']" :key="item">
            <s>
              <template v-if="issueFamily[item]">
                <tracker :name="issueFamily[item].tracker.name" />
                #{{ issueFamily[item].id }} - {{ issueFamily[item].subject }}
                <span v-if="issueFamily[item].hasOwnProperty('assigned_to')&&Object.keys(issueFamily[item].assigned_to).length>1">
                  ({{ $t('Issue.Assignee') }}: {{ issueFamily[item].assigned_to.name }} - {{ issueFamily[item].assigned_to.login }})</span>
              </template>
            </s>
          </li>
        </ul>
      </div>
    </el-alert>
  </el-form>

</template>

<script>
import { getIssue, getIssueFamily } from '@/api/issue'
import { getProjectIssueList } from '@/api/projects'
import { mapGetters } from 'vuex'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'

export default {
  name: 'SettingRelationIssue',
  components: {
    Tracker,
    Status
  },
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    target: {
      type: String,
      default: 'Parent'
    }
  },
  data() {
    const validateParentId = (rule, value, callback) => {
      if (value === this.row.id) {
        callback(new Error('The parent issue is the same issue.'))
      } else {
        callback()
      }
    }
    const validateChildrenId = (rule, value, callback) => {
      if (value.includes(this.row.id)) {
        callback(new Error('The Children issue has the same issue in list.'))
      } else {
        callback()
      }
    }
    return {
      issueFormRules: {
        parent_id: [{ validator: validateParentId, trigger: 'blur' }],
        children_id: [{ validator: validateChildrenId, trigger: 'blur' }]
      },
      isLoading: false,
      form: {
        parent_id: null,
        children: []
      },
      children: { append: [], remove: [], merge: [] },
      issueLoading: false,
      issueList: [],
      loadingRelation: {},
      issueFamily: {}
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    issueFamily: {
      deep: true,
      handler(value) {
        if (Object.keys(value).length <= 1) { this.getSearchIssue() }
      }
    },
    'form.children_id': {
      deep: true,
      handler() {
        this.childrenIssueDifferent()
      }
    },
    children: {
      deep: true,
      handler(value) {
        value['append'].forEach((item) => {
          this.getIssueFamilyData(item)
        })
        value['remove'].forEach((item) => {
          this.getIssueFamilyData(item)
        })
      }
    }
  },
  async mounted() {
    this.isLoading = true
    await this.getIssueFamilyData(this.row.id)
    if (this.issueFamily[this.row.id].hasOwnProperty('parent')) {
      this.form.parent_id = this.issueFamily[this.row.id].parent.id
    }
    if (this.issueFamily[this.row.id].hasOwnProperty('children')) {
      this.form.children_id = this.issueFamily[this.row.id].children.map((item) => (item.id))
    }
    await this.getSearchIssue()
    this.isLoading = false
  },
  methods: {
    async getIssueFamilyData(id) {
      try {
        await this.$set(this.loadingRelation, id, true)
        let issue = await getIssue(id)
        let family = await getIssueFamily(id)
        issue = issue.data
        family = family.data
        await this.$set(this.issueFamily, id, { ...issue, ...family })
        await this.$set(this.loadingRelation, id, false)
      } catch (e) {
        //   null
      }
    },
    childrenIssueDifferent() {
      let oldSetting = []
      if (this.issueFamily[this.row.id] && this.issueFamily[this.row.id].hasOwnProperty('children')) {
        oldSetting = this.issueFamily[this.row.id].children.map((item) => (item.id))
      }
      const newSetting = this.form.children_id
      const result = [...oldSetting, ...newSetting]
      const merge = [...new Set(result)]
      const append = [...merge.filter((item) => (!oldSetting.includes(item)))]
      const remove = [...merge.filter((item) => (!this.form.children_id.includes(item)))]
      return this.$set(this, 'children', { append: append, remove: remove, merge: merge })
    },
    originalIssue() {
      if (this.target === 'Parent') {
        if (!this.issueFamily[this.row.id] || !this.issueFamily[this.row.id].hasOwnProperty('parent')) return {}
        return { name: this.$t('Issue.OriginalSetting'), options: [this.issueFamily[this.row.id].parent] }
      } else if (this.target === 'Children') {
        if (!this.issueFamily[this.row.id] || !this.issueFamily[this.row.id].hasOwnProperty('children')) return {}
        return { name: this.$t('Issue.OriginalSetting'), options: this.issueFamily[this.row.id].children }
      }
    },
    async getSearchIssue(query) {
      const params = {
        selection: true,
        status: 'open'
      }
      this.issueList = []
      if (query !== '' && query) {
        params['search'] = query
        this.issueQuery = query
        this.issueLoading = true
      } else {
        params['offset'] = 0
        params['limit'] = 5
        this.issueQuery = null
      }
      const res = await getProjectIssueList(this.row.project.id, params)
      let queryList = res.data.issue_list
      let key = 'Issue.LastResult'
      if (this.issueQuery) {
        queryList = res.data
        key = 'Issue.Result'
      }
      const original = this.originalIssue()
      this.issueList = [original, { name: this.$t(key), options: queryList }]
      this.issueLoading = false
    },
    highLight: function (value) {
      if (!value) return ''
      if (!this.issueQuery) return value
      const reg = new RegExp(this.issueQuery, 'gi')
      return value.replace(reg, function (str) {
        return '<span class=\'bg-yellow-200 text-danger p-1\'><strong>' + str + '</strong></span>'
      })
    }
  }
}
</script>

<style scoped>

</style>
