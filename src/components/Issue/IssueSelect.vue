<template>
  <el-select
    v-model="issue_ids"
    v-loading="isLoading"
    style="width: 100%"
    :placeholder="$t('Issue.SearchNameOrAssignee')"
    clearable
    filterable
    remote
    multiple
    value-key="issueIds"
    :remote-method="getSearchIssue"
    @focus="getSearchIssue()"
    @change="changeIssueIds()"
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
        >
          <el-popover
            placement="left"
            width="250"
            trigger="hover"
          >
            <el-card>
              <template slot="header">
                <Tracker :name="$t(`Issue.${item.tracker.name}`)" :type="item.tracker.name" />
                #{{ item.id }} - {{ item.name }}
              </template>
              <strong>{{ $t('Issue.Description') }}:</strong>
              <p>{{ item.description }}</p>
            </el-card>
            <div slot="reference">
              <span
                style="float: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; "
              >
                <strong>#<span v-html="highLight(item.id.toString())" /></strong> -
                <span v-html="highLight(item.name)" />
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px"
                    v-html="highLight((item.assigned_to)?item.assigned_to.name:null)"
              />
            </div>
          </el-popover>
        </el-option>
      </template>
    </el-option-group>
  </el-select>
</template>

<script>
import Tracker from '@/components/Issue/Tracker'

export default {
  name: 'IssueSelect',
  components: { Tracker },
  props: {
    commitId: {
      type: String,
      default: ''
    },
    parent: {
      type: Object,
      default: () => ({})
    },
    issueIds: {
      type: Array,
      default: () => []
    },
    issueList: {
      type: Array,
      default: () => []
    },
    issueQuery: {
      type: String,
      default: ''
    },
    issueLoading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isLoading: this.issueLoading,
      issue_ids: this.issueIds
    }
  },
  computed: {
    highLight() {
      return function (value) {
        if (!value) return ''
        if (!this.issueQuery) return value
        const reg = new RegExp(this.issueQuery, 'gi')
        return value.replace(reg, (str) => `<span class=\'bg-yellow-200 text-danger p-1\'><strong>${str}</strong></span>`)
      }
    }
  },
  watch: {
    'issueLoading'(value) {
      this.isLoading = value
    },
    'issueIds'(value) {
      if (value) {
        this.issue_ids = this.issueIds
      }
    },
    'issue_ids'(value) {
      if (!value && !this.issueQuery) {
        this.getSearchIssue()
      }
    }
  },
  methods: {
    async getSearchIssue(query) {
      const commitId = this.commitId
      const parent = this.parent
      this.$emit('update', query, commitId, parent)
    },
    changeIssueIds() {
      const { commitId, issue_ids } = this
      this.$emit('change', { commitId, issue_ids })
    }
  }
}
</script>
