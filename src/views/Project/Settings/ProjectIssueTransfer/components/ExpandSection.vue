<template>
  <el-row v-if="issue.hasFamily" v-loading="issue.isLoadingFamily" class="py-3">
    <ul>
      <li v-if="issue.familyData.hasOwnProperty('parent') && Object.keys(issue.familyData.parent).length > 0">
        <b>{{ $t('Issue.ParentIssue') }}:</b>
        <el-link
          :style="{ 'font-size': '14px', cursor: 'pointer' }"
          :underline="false"
          @click="handleEdit(issue.familyData.parent.id)"
          @contextmenu.native="handleContextMenu(issue.familyData.parent, '', $event)"
        >
          <status :name="issue.familyData.parent.status.name" size="mini" />
          <tracker :name="issue.familyData.parent.tracker.name" />
          #{{ issue.familyData.parent.id }} - {{ issue.familyData.parent.name }}
          <span
            v-if="
              issue.familyData.parent.hasOwnProperty('assigned_to') &&
                Object.keys(issue.familyData.parent.assigned_to).length > 1
            "
          >
            ({{ $t('Issue.Assignee') }}: {{ issue.familyData.parent.assigned_to.name }} -
            {{ issue.familyData.parent.assigned_to.login }})
          </span>
        </el-link>
        <el-popconfirm
          :confirm-button-text="$t('general.Remove')"
          :cancel-button-text="$t('general.Cancel')"
          icon="el-icon-info"
          icon-color="red"
          :title="$t('Issue.RemoveIssueRelation')"
          @onConfirm="removeIssueRelation(issue.familyData.parent.id)"
        >
          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
            {{ $t('Issue.Unlink') }}
          </el-button>
        </el-popconfirm>
      </li>

      <li v-if="issue.familyData.hasOwnProperty('children')">
        <b>{{ $t('Issue.ChildrenIssue') }}:</b>
        <ol>
          <template v-for="child in issue.familyData.children">
            <li v-if="Object.keys(child).length > 0" :key="child.id">
              <el-link
                class="my-1"
                :style="{ 'font-size': '14px', cursor: 'pointer' }"
                :underline="false"
                @click="handleEdit(child.id)"
                @contextmenu.native="handleContextMenu(child, '', $event)"
              >
                <status :name="child.status.name" size="mini" />
                <tracker :name="child.tracker.name" />
                #{{ child.id }} - {{ child.name }}
                <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">
                  ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})
                </span>
              </el-link>
              <el-popconfirm
                :confirm-button-text="$t('general.Remove')"
                :cancel-button-text="$t('general.Cancel')"
                icon="el-icon-info"
                icon-color="red"
                :title="$t('Issue.RemoveIssueRelation')"
                @onConfirm="removeIssueRelation(child.id)"
              >
                <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">
                  {{ $t('Issue.Unlink') }}
                </el-button>
              </el-popconfirm>
            </li>
          </template>
        </ol>
      </li>
    </ul>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="updateListData"
    />
  </el-row>
</template>

<script>
import { Status, Tracker } from '@/components/Issue'
import { ContextMenu } from '@/newMixins'
import { updateIssue } from '@/api/issue'

export default {
  name: 'ExpandSection',
  components: { Status, Tracker },
  mixins: [ContextMenu],
  props: {
    issue: {
      type: Object,
      default: () => null
    }
  },
  methods: {
    removeIssueRelation(issueId) {
      this.listLoading = true
      updateIssue(issueId, { parent_id: '' })
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.updateListData()
        })
        .catch(err => {
          console.error(err)
          this.listLoading = false
        })
    },
    updateListData() {
      this.$emit('updateListData')
    }
  }
}
</script>
