<template>
  <div>
    {{ issue }}
  </div>
  <!--  <el-row v-loading="issue.hasOwnProperty('isLoadingFamily')&&issue.isLoadingFamily">-->
  <!--    {{ issue }}-->
  <!--    <div v-if="issue.hasOwnProperty('isLoadingFamily') && issue.isLoadingFamily" class="p-5" />-->
  <!--    <ul v-else>-->
  <!--      <li v-if="issue.hasOwnProperty('parent') && Object.keys(issue.parent).length > 0">-->
  <!--        <b>{{ $t('Issue.ParentIssue') }}:</b>-->
  <!--        <el-link-->
  <!--          :style="{ 'font-size': '14px', cursor: 'pointer' }"-->
  <!--          :underline="false"-->
  <!--          @click="handleEdit(issue.parent.id)"-->
  <!--          @contextmenu.native="handleContextMenu(issue.parent, '', $event)"-->
  <!--        >-->
  <!--          <status :name="issue.parent.status.name" size="mini" />-->
  <!--          <tracker :name="issue.parent.tracker.name" />-->
  <!--          #{{ issue.parent.id }} - {{ issue.parent.name }}-->
  <!--          <span-->
  <!--            v-if="-->
  <!--              issue.parent.hasOwnProperty('assigned_to') &&-->
  <!--                Object.keys(issue.parent.assigned_to).length > 1-->
  <!--            "-->
  <!--          >-->
  <!--            ({{ $t('Issue.Assignee') }}: {{ issue.parent.assigned_to.name }} - -->
  <!--            {{ issue.parent.assigned_to.login }})-->
  <!--          </span>-->
  <!--        </el-link>-->
  <!--        <el-popconfirm-->
  <!--          :confirm-button-text="$t('general.Remove')"-->
  <!--          :cancel-button-text="$t('general.Cancel')"-->
  <!--          icon="el-icon-info"-->
  <!--          icon-color="red"-->
  <!--          :title="$t('Issue.RemoveIssueRelation')"-->
  <!--          @onConfirm="removeIssueRelation(issue.id)"-->
  <!--        >-->
  <!--          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">-->
  <!--            {{ $t('Issue.Unlink') }}-->
  <!--          </el-button>-->
  <!--        </el-popconfirm>-->
  <!--      </li>-->
  <!--      <li v-if="issue.hasOwnProperty('children') && scope.row.children.length>0">-->
  <!--        <b>{{ $t('Issue.ChildrenIssue') }}:</b>-->
  <!--        <ol>-->
  <!--          <template v-for="child in issue.children">-->
  <!--            <li v-if="Object.keys(child).length > 0" :key="child.id">-->
  <!--              <el-link-->
  <!--                :style="{ 'font-size': '14px', cursor: 'pointer' }"-->
  <!--                :underline="false"-->
  <!--                @click="handleEdit(child.id)"-->
  <!--                @contextmenu.native="handleContextMenu(child, '', $event)"-->
  <!--              >-->
  <!--                <status :name="child.status.name" size="mini" />-->
  <!--                <tracker :name="child.tracker.name" />-->
  <!--                #{{ child.id }} - {{ child.name }}-->
  <!--                <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">-->
  <!--                  ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})-->
  <!--                </span>-->
  <!--              </el-link>-->
  <!--              <el-popconfirm-->
  <!--                :confirm-button-text="$t('general.Remove')"-->
  <!--                :cancel-button-text="$t('general.Cancel')"-->
  <!--                icon="el-icon-info"-->
  <!--                icon-color="red"-->
  <!--                :title="$t('Issue.RemoveIssueRelation')"-->
  <!--                @onConfirm="removeIssueRelation(child.id)"-->
  <!--              >-->
  <!--                <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">-->
  <!--                  {{ $t('Issue.Unlink') }}-->
  <!--                </el-button>-->
  <!--              </el-popconfirm>-->
  <!--            </li>-->
  <!--          </template>-->
  <!--        </ol>-->
  <!--      </li>-->
  <!--      <li v-if="issue.hasOwnProperty('relations') && scope.row.relations.length>0">-->
  <!--        <b>{{ $t('Issue.RelatedIssue') }}:</b>-->
  <!--        <ol>-->
  <!--          <template v-for="child in issue.relations">-->
  <!--            <li v-if="Object.keys(child).length > 0" :key="child.id">-->
  <!--              <el-link-->
  <!--                :style="{ 'font-size': '14px', cursor: 'pointer' }"-->
  <!--                :underline="false"-->
  <!--                @click="handleEdit(child.id)"-->
  <!--                @contextmenu.native="handleContextMenu(child, '', $event)"-->
  <!--              >-->
  <!--                <status :name="child.status.name" size="mini" />-->
  <!--                <tracker :name="child.tracker.name" />-->
  <!--                #{{ child.id }} - {{ child.name }}-->
  <!--                <span v-if="child.hasOwnProperty('assigned_to') && Object.keys(child.assigned_to).length > 1">-->
  <!--                  ({{ $t('Issue.Assignee') }}: {{ child.assigned_to.name }} - {{ child.assigned_to.login }})-->
  <!--                </span>-->
  <!--              </el-link>-->
  <!--              <el-popconfirm-->
  <!--                :confirm-button-text="$t('general.Remove')"-->
  <!--                :cancel-button-text="$t('general.Cancel')"-->
  <!--                icon="el-icon-info"-->
  <!--                icon-color="red"-->
  <!--                :title="$t('Issue.RemoveIssueRelation')"-->
  <!--                @onConfirm="removeRelationIssue(child.relation_id)"-->
  <!--              >-->
  <!--                <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">-->
  <!--                  {{ $t('Issue.Unlink') }}-->
  <!--                </el-button>-->
  <!--              </el-popconfirm>-->
  <!--            </li>-->
  <!--          </template>-->
  <!--        </ol>-->
  <!--      </li>-->
  <!--    </ul>-->
  <!--    <ContextMenu-->
  <!--      ref="contextmenu"-->
  <!--      :visible="contextMenu.visible"-->
  <!--      :row="contextMenu.row"-->
  <!--      :filter-column-options="filterOptions"-->
  <!--      :selection-options="contextOptions"-->
  <!--      @update="updateListData"-->
  <!--    />-->
  <!--  </el-row>-->
</template>

<script>
import { Status, Tracker } from '@/components/Issue'
import { ContextMenu } from '@/newMixins'
import { deleteIssueRelation, updateIssue } from '@/api/issue'

export default {
  name: 'ExpandSection',
  components: { Status, Tracker },
  mixins: [ContextMenu],
  props: {
    issue: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    async removeIssueRelation(childIssueId) {
      this.listLoading = true
      try {
        await updateIssue(childIssueId, { parent_id: '' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.updateListData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    async removeRelationIssue(relation_id) {
      this.listLoading = true
      try {
        await deleteIssueRelation(relation_id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.updateListData()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    updateListData() {
      this.$emit('updateListData')
    },
    handleEdit(issueId) {
      this.$router.push({ name: 'issue-detail', params: { issueId }})
    }
  }
}
</script>
