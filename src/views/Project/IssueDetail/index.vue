<template>
  <div class="app-container">
    <el-card
      v-loading="isLoading"
      :element-loading-text="$t('Loading')"
      :body-style="{ 'min-height': '80vh' }"
    >
      <el-row slot="header">
        <el-row
          type="flex"
          align="bottom"
          justify="space-between"
        >
          <el-row>
            <el-col class="text-xl mr-3">
              <el-button
                v-if="!isInDialog"
                type="text"
                size="medium"
                icon="el-icon-arrow-left"
                class="previous linkTextColor"
                @click="handleBackPage"
              >
                {{ $t('general.Back') }}
              </el-button>
              <template v-if="tracker">
                <Tracker
                  :name="$t(`Issue.${tracker}`)"
                  :type="tracker"
                />
              </template>
              <template v-else>{{ $t('Issue.Issue') }}</template>
              #{{ issueId }} -
              <IssueTitle
                ref="IssueTitle"
                v-model="form.name"
                :old-value="originForm.name"
                :issue-id="issueId"
                :is-button-disabled="isButtonDisabled"
              />
              <span
                v-if="!isLoading && issueId"
                class="text-base mr-3"
              >
                {{ $t('Issue.AddBy', { user: author, created_date: formatTime(created_date) }) }}
              </span>
              <el-tooltip class="item" :content="$t('general.CopyUrl')" placement="bottom">
                <el-button
                  class="el-icon-copy-document"
                  circle
                  @click="copyUrl"
                />
              </el-tooltip>
            </el-col>
          </el-row>
          <el-col
            :span="6"
            class="text-right"
          >
            <el-button
              v-if="!isFromBoard"
              size="medium"
              :type="isButtonDisabled ? 'info' : 'danger'"
              plain
              :disabled="isButtonDisabled"
              @click="handleDelete('Delete', false)"
            >{{ $t('general.Delete') }}
            </el-button>
            <el-button
              size="medium"
              :class="isButtonDisabled ? 'buttonInfo' : 'buttonPrimary'"
              :disabled="isButtonDisabled"
              @click="handleSave"
            >{{ $t('general.Save') }}
            </el-button>
          </el-col>
        </el-row>
      </el-row>
      <el-row :gutter="20">
        <el-col
          ref="mainIssueWrapper"
          :span="24"
          :md="16"
        >
          <el-row>
            <el-col :span="24">
              <IssueToolbar
                :is-button-disabled="isButtonDisabled"
                :issue-link="issue_link"
                :issue-id="issueId"
                :issue-name="issueName"
                :issue-tracker="formTrackerName"
                :row="form"
                :project-id="form.project_id"
                @is-loading="showLoading"
                @related-collection="toggleDialogVisible"
                @updateFamilyData="getIssueFamilyData(issue)"
              />
            </el-col>
          </el-row>
          <el-row
            ref="mainIssue"
            :gutter="10"
            :class="scrollClass"
            @scroll.native="onScrollIssue"
          >
            <el-col
              ref="IssueDescription"
              :span="24"
              class="mb-3"
            >
              <IssueDescription
                v-model="form.description"
                :old-value="originForm.description"
                :issue-id="issueId"
                :is-button-disabled="isButtonDisabled"
              />
              <IssueFiles
                v-if="files.length > 0"
                :is-button-disabled="isButtonDisabled"
                :issue-file.sync="files"
              />
              <IssueCollection
                v-if="test_files.length > 0"
                :is-button-disabled="isButtonDisabled"
                :issue-test.sync="test_files"
                @update="updateTestCollection"
              />
              <el-collapse
                v-if="countRelationIssue > 0"
                v-model="relationVisible"
                v-loading="isLoadingFamily"
                accordion
              >
                <el-collapse-item :name="1">
                  <div slot="title">
                    {{ $t('Issue.RelatedIssue') + '(' + countRelationIssue + ')' }}
                    <el-button
                      size="mini"
                      :class="isOpenMatrix ? 'buttonInfo' : 'buttonPrimary'"
                      icon="el-icon-data-line"
                      :disabled="isOpenMatrix"
                      @click.native.stop="toggleIssueMatrixDialog"
                    >
                      {{ $t('Issue.TraceabilityMatrix') }}
                    </el-button>
                  </div>
                  <ExpandSection
                    :issue="$data"
                    :family="countRelationIssue > 0"
                    :popup="true"
                    :is-button-disabled="isButtonDisabled"
                    :reload="relationVisible"
                    @update-list="getIssueFamilyData(issue)"
                    @on-context-menu="onContextMenu"
                    @popup-dialog="onRelationIssueDialog"
                  />
                </el-collapse-item>
              </el-collapse>
            </el-col>
            <el-col
              ref="moveEditor"
              :span="24"
              class="moveEditor mb-3"
            >
              <issue-notes-editor ref="IssueNotesEditor" />
            </el-col>
            <el-col :span="24">
              <el-tabs
                ref="IssueNotesDialog"
                type="border-card"
              >
                <el-tab-pane :label="$t('Issue.History')">
                  <IssueNotesDialog
                    :height="dialogHeight"
                    :data="journals"
                    @show-parent-issue="onRelationIssueDialog"
                  />
                </el-tab-pane>
                <el-tab-pane>
                  <template #label>
                    <span>
                      <em class="ri-git-commit-line" />{{ $t('Issue.Commit') }}
                    </span>
                  </template>
                  <AdminCommitLog
                    ref="AdminCommitLog"
                    :issue-id="issueId"
                    :issue-name="form.name"
                    :get-data="getGitCommitLogData"
                    :height="dialogHeight"
                  />
                </el-tab-pane>
                <el-tab-pane :label="$t('Excalidraw.Whiteboard')">
                  <WhiteBoardTable
                    ref="WhiteBoardTable"
                    :excalidraw-data="issue.excalidraw"
                    :height="dialogHeight"
                    @update="fetchIssueLink"
                  />
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </el-col>
        <el-col
          :span="24"
          :md="8"
          class="issueOptionHeight"
        >
          <IssueForm
            ref="IssueForm"
            :is-button-disabled="isButtonDisabled"
            :issue-id="issueId"
            :issue-project="issueProject"
            :form.sync="form"
            :parent="parent"
            :relations.sync="relations"
            :children-issue="children.length"
          />
        </el-col>
      </el-row>
      <el-dialog
        :visible.sync="relationIssue.visible"
        width="90%"
        top="3vh"
        append-to-body
        destroy-on-close
        :before-close="handleRelationIssueDialogBeforeClose"
      >
        <ProjectIssueDetail
          v-if="relationIssue.visible"
          ref="children"
          :is-open-matrix="isOpenMatrix"
          :props-issue-id="relationIssue.id"
          :is-in-dialog="true"
          @update="showLoading"
          @delete="handleRelationDelete"
        />
      </el-dialog>
    </el-card>
    <el-dialog
      :visible.sync="relatedCollectionDialogVisible"
      :close-on-click-modal="false"
      width="80%"
      :show-close="false"
      append-to-body
      destroy-on-close
    >
      <RelatedCollectionDialog
        :selected-collections="test_files"
        @update="updateTestCollection"
        @close-dialog="toggleDialogVisible"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="issueMatrixDialog.visible"
      width="80%"
      top="20px"
      append-to-body
      destroy-on-close
      :title="$t('Issue.TraceabilityMatrix') + '(#' + issue.id + ' - ' + issue.name + ')'"
    >
      <IssueMatrix
        v-if="issueMatrixDialog.visible"
        :row.sync="issue"
        @update-issue="handleUpdated"
      />
    </el-dialog>
    <el-dialog
      :visible.sync="isShowDialog"
      append-to-body
      destroy-on-close
      width="30%"
    >
      <span>
        <em class="el-icon-warning" :style="getStyle('danger')" />
        {{ $t('Notify.ChangeProject') }}
      </span>
      <span slot="footer">
        <el-button @click="onCancel">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" @click="onConfirm">{{ $t('general.Confirm') }}</el-button>
      </span>
    </el-dialog>
    <ContextMenu
      ref="contextmenu"
      :visible="contextMenu.visible"
      :row="contextMenu.row"
      :filter-column-options="filterOptions"
      :selection-options="contextOptions"
      @update="getData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import {
  getIssue,
  updateIssue,
  deleteIssue,
  addIssue,
  putIssueRelation,
  deleteIssueRelation,
  getIssueGitCommitLog,
  getIssueFamily
} from '@/api/issue'
import {
  IssueForm,
  IssueNotesDialog,
  IssueNotesEditor,
  IssueFiles,
  IssueDescription,
  IssueTitle,
  IssueToolbar,
  IssueCollection,
  AdminCommitLog,
  WhiteBoardTable
} from './components'
import { UTCtoLocalTime } from '@/filters'
import {
  addProjectTags,
  getRootProjectId
} from '@/api/projects'
import { getHasSon, getProjectRelation } from '@/api_v2/projects'
import dayjs from 'dayjs'
import { Status, Tracker, ExpandSection } from '@/components/Issue'
import RelatedCollectionDialog from '@/views/Test/TestFile/components/RelatedCollectionDialog'
import { getTestFileByTestPlan, putTestPlanWithTestFile } from '@/api/qa'
import getPageTitle from '@/utils/getPageTitle'
import IssueMatrix from './components/IssueMatrix'
import ContextMenu from '@/newMixins/ContextMenu'
// import { getIssueFamily } from '@/api/issue'
import variables from '@/styles/theme/variables.scss'

const commitLimit = 10

export default {
  name: 'ProjectIssueDetail',
  components: {
    IssueCollection,
    // eslint-disable-next-line vue/no-unused-components
    Status,
    Tracker,
    IssueTitle,
    IssueDescription,
    IssueForm,
    IssueNotesDialog,
    IssueNotesEditor,
    IssueToolbar,
    IssueFiles,
    IssueMatrix,
    RelatedCollectionDialog,
    ExpandSection,
    AdminCommitLog,
    WhiteBoardTable
  },
  mixins: [ContextMenu],
  props: {
    propsIssueId: {
      type: [String, Number],
      default: null
    },
    isInDialog: {
      type: Boolean,
      default: false
    },
    isFromBoard: {
      type: Boolean,
      default: false
    },
    isOpenMatrix: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.assignedError = {
      title: this.$t('Kanban.assignedErrorTitle'),
      content: this.$t('Kanban.assignedErrorContent')
    }
    return {
      mode: 'view',
      originForm: {},
      isLoading: false,
      issueMatrixDialog: {
        visible: false
      },
      rootProjectId: '',
      issue_link: '',
      issue: {},
      issueId: null,
      issueName: '',
      author: '',
      created_date: '',
      tracker: '',
      view: {},
      form: {
        parent_id: null,
        project_id: 0,
        assigned_to_id: '',
        name: '',
        fixed_version_id: '',
        tracker_id: 0,
        status_id: 1,
        priority_id: 3,
        estimated_hours: 0,
        done_ratio: 0,
        start_date: '',
        due_date: '',
        description: ''
      },
      files: [],
      test_files: [],
      journals: [],
      requestGitLabLastTime: null,
      parent: {},
      children: [],
      tags: [],
      dialogHeight: '100%',
      editorHeight: '100px',
      issueScrollTop: 0,
      scrollClass: 'issueHeight',
      relationVisible: 0,
      relationIssue: {
        visible: false,
        id: null
      },
      relations: [],
      relatedCollectionDialogVisible: false,
      tagsString: '',
      errorMsg: [],
      showAlert: false,
      isLoadingFamily: false,
      projectRelationList: [],
      isShowDialog: false,
      storagePId: '',
      issueProject: {}
    }
  },
  beforeRouteEnter(to, from, next) {
    if (to.query.prev_page) {
      next()
    } else {
      const newTo = Object.assign({}, to, {
        query: {
          ...to.query,
          prev_page: from.fullPath
        }
      })
      next(newTo)
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges()) {
      this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
        confirmButtonText: this.$t('general.Confirm'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'warning'
      })
        .then(() => {
          this.$route.meta.subject = null
          document.title = getPageTitle(this.$route.meta)
          next()
        })
        .catch(() => {
          next(false)
        })
    } else {
      this.$route.meta.subject = null
      document.title = getPageTitle(this.$route.meta)
      next()
    }
  },
  computed: {
    ...mapGetters([
      'selectedProject',
      'userProjectList',
      'selectedProjectId',
      'test_filename',
      'userRole',
      'forceTracker',
      'enableForceTracker'
    ]),
    hasRelationIssue() {
      return Object.keys(this.parent).length > 0 || this.children.length > 0
    },
    countRelationIssue() {
      let parent = 0
      let children = 0
      let relations = 0
      if (this.parent && Object.keys(this.parent).length > 0) {
        parent = 1
      }
      if (this.children !== undefined) {
        children = this.children.length
      }
      if (this.relations !== undefined) {
        relations = this.relations.length
      }
      return parent + children + relations
    },
    formTrackerName() {
      if (!this.form.tracker_id || !this.$refs['IssueForm']) return null
      const getTrackerName = this.$refs['IssueForm'].tracker.find((item) => item.id === this.form.tracker_id)
      if (!getTrackerName) return null
      return getTrackerName.name
    },
    isButtonDisabled() {
      return this.$route.params.hasOwnProperty('disableButton')
        ? this.$route.params.disableButton
        : false
    },
    formProjectId() {
      return this.form.project_id ? this.form.project_id : this.selectedProjectId
    }
  },
  watch: {
    mode(value) {
      if (value === 'view') {
        this.editorHeight = '100px'
      } else {
        this.editorHeight = '390px'
      }
    },
    propsIssueId(val) {
      this.fetchIssueLink()
      this.$nextTick(() => this.$refs.IssueForm.$refs.form.clearValidate())
    },
    'form.project_id': {
      handler(newPId, oldPId) {
        if (this.storagePId && newPId !== this.storagePId) {
          this.isShowDialog = true
        }
      }
    }
  },
  async mounted() {
    await this.fetchIssueLink()
    await this.getRelationProjectList()
    this.storagePId = this.form.project_id
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject']),
    ...mapActions('qa', ['removeFileName']),
    async getData() {
      await this.fetchIssueLink()
      await this.getIssueFamilyData(this.issue)
    },
    async fetchIssueLink() {
      this.isLoading = true
      if (this.propsIssueId) {
        this.issueId = parseInt(this.propsIssueId)
        await this.fetchIssue()
      } else if (this.$route.params.issueId) {
        this.issueId = parseInt(this.$route.params.issueId)
        this.issueProject = this.$route.params.project
        await this.fetchIssue()
      } else {
        this.form.project_id = this.selectedProjectId
        const tracker = this.$refs['IssueForm'].tracker.find((item) => item.name === 'Test Plan')
        this.form.tracker_id = tracker.id
        if (this.test_filename) {
          this.test_files.push({ ...this.test_filename, edit: true })
          this['removeFileName']()
        }
      }
      this.isLoading = false
    },
    async fetchIssue(isOnlyUpload) {
      this.isLoading = true
      let data = {}
      try {
        const issue = await getIssue(this.issueId)
        data = issue.data
        this.$route.meta.subject = `[${this.$t('Issue.' + data.tracker.name)}] #${data.id} - ${data.name} @ ${
          data.project.name
        }`
        document.title = getPageTitle(this.$route.meta)
        if (data.hasOwnProperty('relations')) {
          const res_api = []
          for (const item of data.relations) {
            let getIssueId
            if (data.id === item.issue_id) {
              getIssueId = item.issue_to_id
            } else {
              getIssueId = item.issue_id
            }
            res_api.push(await getIssue(getIssueId))
          }
          const relation_issue = await Promise.all(res_api)
          relation_issue.forEach((issue, idx) => {
            this.$set(data.relations, idx, {
              relation_id: data.relations[idx].id,
              ...data.relations[idx],
              ...issue.data,
              name: issue.data.name
            })
          })
        }
        if (data.tracker && data.tracker.name === 'Test Plan') {
          const test_files = await getTestFileByTestPlan(this.selectedProjectId, this.issueId)
          this.$set(data, 'test_files', test_files.data)
        }
        if (isOnlyUpload) {
          this.initUploadFiles(data)
        } else {
          this.initIssueDetails(data)
        }
      } catch (e) {
        this.handleBackPage()
        // this.$message({
        //   message: this.$t('Issue.RemovedIssue'),
        //   type: 'warning'
        // })
      }
      this.isLoading = false
      return data
    },
    initUploadFiles(data) {
      const { attachments } = data
      this.files = attachments
    },
    initIssueDetails(data) {
      const {
        issue_link,
        author,
        attachments,
        created_date,
        journals,
        name,
        tracker,
        parent,
        children,
        test_files,
        relations,
        tags
      } = data
      this.issue = data
      this.issue_link = issue_link
      this.issueName = name
      this.author = author.name
      this.tracker = tracker.name
      this.files = attachments
      this.created_date = created_date
      if (journals) {
        this.journals = journals.reverse()
      } else {
        this.journals = []
      }
      this.test_files = test_files || []
      this.relations = relations || []
      this.parent = parent || {}
      this.children = children || []
      this.tags = tags || []
      this.setFormData(data)
      this.view = data
      if (
        (Object.keys(data.project).length > 0 &&
        this.selectedProjectId !== data.project.id &&
        !this.projectRelationList.includes(data.project.id)) ||
        !this.isFromBoard) {
      // Cori keeps both but remove the code from develop
      //        !this.getRelationProjectList().includes(data.project.id) &&
      //        !this.isFromBoard
      //       ( !this.projectRelationList.includes(data.project.id) || (
      //        !this.getRelationProjectList().includes(data.project.id) &&
      //        !this.isFromBoard))
      // )
        // this.onProjectChange(data.project.id)
      }
      if (this.$refs.IssueForm) {
        this.$refs.IssueForm.getClosable()
      }
      this.issueProject = data.project
    },
    async getRelationProjectList() {
      const hasSon = (await getHasSon(this.formProjectId)).has_child
      if (hasSon) {
        const projectRelation = (await getProjectRelation(this.formProjectId)).data
        this.projectRelationList.push(projectRelation[0].parent.id)
        projectRelation[0].child.forEach((item) => {
          this.projectRelationList.push(item.id)
        })
      }
    },
    onProjectChange(value) {
      if (this.isInDialog || this.isFromBoard) return
      localStorage.setItem('projectId', value)
      this.setSelectedProject(this.userProjectList.filter((elm) => elm.id === value)[0])
    },
    setIssueId() {
      if (this.propsIssueId) this.issueId = parseInt(this.propsIssueId)
      else if (this.$route.params.issueId) this.issueId = parseInt(this.$route.params.issueId)
    },
    async getRootProject(projectId) {
      const res = await getRootProjectId(projectId)
      this.rootProjectId = res.root_project_id
    },
    async getGitCommitLogData() {
      await this.getRootProject(this.formProjectId)
      this.setIssueId()
      const params = { limit: commitLimit }
      const res = await getIssueGitCommitLog(this.rootProjectId, this.issueId, params)
      res.data.forEach((item, index) => {
        item['id'] = index
        item['commit_time'] = UTCtoLocalTime(item['commit_time'])
      })
      return Promise.resolve(res.data)
    },
    setFormData(data) {
      const {
        project,
        parent,
        assigned_to,
        fixed_version,
        name,
        tracker,
        status,
        priority,
        estimated_hours,
        done_ratio,
        start_date,
        due_date,
        description
      } = data
      this.form.parent_id = parent ? parent.id : ''
      this.form.project_id = project ? project.id : ''
      this.form.assigned_to_id = assigned_to ? assigned_to.id : ''
      this.form.name = name
      this.form.fixed_version_id = fixed_version ? fixed_version.id : ''
      this.form.tracker_id = tracker.id
      this.form.status_id = status.id
      this.form.priority_id = priority.id
      this.form.estimated_hours = estimated_hours
      this.form.done_ratio = done_ratio
      this.form.start_date = start_date === null ? '' : start_date
      this.form.due_date = due_date === null ? '' : due_date
      this.form.description = description === null ? '' : description
      this.form.relation_ids = this.relations.length > 0 ? this.relations.map((item) => item.id) : []
      this.form.tags = this.tags.length > 0 ? this.tags.map((item) => item.id) : []
      this.originForm = Object.assign({}, this.form)
    },
    async handleDelete(msg, force, detail) {
      const h = this.$createElement
      const issueName = { issueName: this.issueName }
      const messageList = [h('span', null, this.$t(`Issue.${msg}Issue`, issueName))]
      if (detail) {
        messageList.push(h('ul', null,
          detail.map(issue => {
            let tags = ''
            if (issue.tags && issue.tags.length > 0) {
              tags = issue.tags.map(tag => h('el-tag', { class: { 'mx-1': true }, props: { type: 'mini' }}, tag.name))
            }
            return h('li', null, [
              h('Status', { class: { 'mx-1': true }, props: { name: this.$t(`Issue.${issue.status.name}`), size: 'mini' }}, ''),
              h('Tracker', { props: { name: this.$t(`Issue.${issue.tracker.name}`), size: 'mini' }}, ''),
              h('span', null, [
                h('span', null, `#${issue.id} - `),
                ...tags,
                h('span', null, `${issue.name} ${(Object.keys(issue.assigned_to).length > 0 ? `(${this.$t(`Issue.assigned_to`)}: ${issue.assigned_to.name}
             -  ${issue.assigned_to.login})` : '')}`)
              ])
            ])
          })
        ))
      }
      const message = h('p', null, messageList)
      const deleteRequest = await this.$confirm(message, this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }).catch(err => console.error(err))
      if (deleteRequest === 'confirm') {
        this.isLoading = true
        try {
          await this.deleteIssueAPI(force)
        } catch (err) {
          const errorRes = err.response.data
          if (errorRes && errorRes.error.code === 1013) {
            await this.handleDelete('ConfirmDelete', true, errorRes.error.details)
          } else {
            this.$message({
              title: this.$t('general.Error'),
              message: err,
              type: 'error'
            })
          }
        }
        this.isLoading = false
      }
    },
    async deleteIssueAPI(force) {
      let params = {}
      if (force) {
        params = { force: force }
      }
      await deleteIssue(this.issueId, params)
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('Notify.Deleted'),
        type: 'success'
      })
      if (this.isInDialog) {
        this.$emit('delete')
      } else {
        this.handleBackPage()
      }
    },
    async handleUpdated(issue_id) {
      this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('reset')
      this.$refs.IssueTitle.edit = false
      this.$refs.IssueDescription.edit = false
      this.test_files = []
      this.relations = []
      if (!this.issueId) {
        this.$router.push({ name: 'IssueDetail', params: { issueId: issue_id }})
      } else {
        await this.$refs.IssueForm.getClosable()
      }
      this.isLoading = false
      await this.fetchIssue()
    },
    async handleUploadUpdated() {
      await this.fetchIssue(true)
      this.isLoading = false
    },
    handleBackPage() {
      if (this.$route.query.prev_page) {
        this.$router.push(this.$route.query.prev_page)
      } else {
        this.$router.push({
          name: 'IssueList',
          params: {
            projectName: this.selectedProject.name
          }
        })
      }
    },
    showLoading(status) {
      if (status && status.hasOwnProperty('upload') && status.upload) {
        this.isLoading = status.status
        this.handleUploadUpdated()
      } else {
        this.isLoading = status.status
        this.handleUpdated()
      }
    },
    handleSave() {
      this.$refs.IssueForm.$refs.form.validate((valid) => {
        // const propParentLength = Object.keys(this.parent).length
        if (valid) {
          // const changeRequest = this.$refs.IssueForm.tracker.find((item) => (item.name === 'Change Request'))
          // if (this.form.tracker_id === changeRequest.id && propParentLength === 0) {
          //   const message = '尚未設定本變更議之原由議題單(父議題），請先行設定後再存檔'
          //   this.setWarningMessage(message)
          // } else
          const foundTracker = this.forceTracker.find((tracker) => tracker.id === this.form.tracker_id)
          if (this.enableForceTracker && foundTracker && !this.form.parent_id) {
            const tracker_name = this.$t(`Issue.${foundTracker.name}`)
            const message = this.$t('Notify.NoParentIssueWarning', { tracker_name })
            if (foundTracker.hasOwnProperty('id')) this.setWarningMessage(message)
          } else if (this.form.name && this.form.name !== '') {
            this.handleUpdateTags()
          } else {
            const message = '請輸入標題'
            this.setWarningMessage(message)
          }
        }
      })
    },
    setWarningMessage(message) {
      this.$message({
        type: 'warning',
        message
      })
    },
    async handleUpdateTags() {
      const tags = this.form.tags
      const tagsLength = tags.length
      const addTags = []
      const originTags = []
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          if (typeof tag === 'string') {
            addTags.push(tag)
          } else if (typeof tag === 'number') originTags.push(tag)
        })
      }
      if (addTags.length > 0) {
        await this.handleAddProjectTags(addTags, originTags, tagsLength)
      } else {
        this.tagsArrayToString(originTags, tagsLength)
      }
    },
    async handleAddProjectTags(addTags, originTags, tagsLength) {
      addTags.map(async (tag) => {
        const tagValue = tag.split('__')[1]
        const formData = this.getAddTagsFormData(tagValue)
        await this.addProjectTags(formData, originTags, tagsLength)
      })
    },
    async addProjectTags(formData, originTags, tagsLength) {
      await addProjectTags(formData).then(async (res) => {
        const id = res.data.tags.id
        originTags.push(id)
        this.tagsArrayToString(originTags, tagsLength)
      })
    },
    tagsArrayToString(tags, tagsLength) {
      this.tagsString = tags.length > 0 ? tags.join() : null
      if (this.tagsString === null) {
        this.form.tags = ''
      } else {
        this.form.tags = this.tagsString
      }
      if (tags.length === tagsLength) this.submitIssue()
    },
    getAddTagsFormData(tag) {
      const formData = new FormData()
      formData.delete('name')
      formData.delete('project_id')
      formData.append('name', tag)
      formData.append('project_id', this.formProjectId)
      return formData
    },
    submitIssue() {
      this.tagsString = ''
      const sendData = Object.assign({}, this.form)
      const notes = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')
      if (notes !== '') sendData['notes'] = notes
      // Object.keys(sendData).map(item => {
      //   if (sendData[item] === '' || !sendData[item]) delete sendData[item]
      // })
      const sendForm = new FormData()
      Object.keys(sendData).forEach((objKey) => {
        if ((objKey === 'start_date' || objKey === 'end_date') && !sendData[objKey]) {
          sendForm.append(objKey, '')
        } else {
          sendForm.append(objKey, sendData[objKey])
        }
      })
      if (sendData.assigned_to_id && sendData.status_id === 1) {
        const error = 'assignedError'
        this.handleErrorAlert(error)
        this.showErrorAlert(this.errorMsg)
        return
      }
      this.updateIssueForm(sendForm)
    },
    async updateIssueForm(sendForm) {
      this.isLoading = true
      const { issueId } = this
      let issueApi = null
      if (!this.issueId) {
        issueApi = addIssue(sendForm)
      } else {
        issueApi = updateIssue(issueId, sendForm)
      }
      try {
        const res = await issueApi
        let issue_id = this.issueId
        if (res.hasOwnProperty('data')) {
          if (res.data.hasOwnProperty('id')) {
            issue_id = res.data.id
          } else {
            issue_id = res.data.issue_id
          }
        }
        if (this.test_files) {
          const data = {
            issue_id: issue_id,
            test_files: this.test_files.map((item) => ({
              software_name: item.software_name,
              file_name: item.file_name
            }))
          }
          await putTestPlanWithTestFile(this.form.project_id, data)
        }
        if (this.form.relation_ids) {
          const data = {
            issue_id: issue_id,
            issue_to_ids: this.form.relation_ids
          }
          await putIssueRelation(data)
        }
        // await this.$message({
        //   title: this.$t('general.Success'),
        //   message: this.$t('Notify.Updated'),
        //   type: 'success'
        // })
        await this.handleUpdated(issue_id)
        this.$emit('update')
      } catch (e) {
        console.error(e)
      }
      this.isLoading = false
    },
    handleErrorAlert(key) {
      const { title, content } = this[key]
      this.errorMsg.push(this.getErrorAlert(title, content))
    },
    getErrorAlert(title, content) {
      const h = this.$createElement
      const message = h('li', [h('b', title), h('p', content)])
      return message
    },
    showErrorAlert(errorMsg) {
      const h = this.$createElement
      if (!this.showAlert) {
        this.showAlert = true
        this.$msgbox({ message: h('ul', errorMsg), title: this.$t('Kanban.ChangeIssueError') }).then(() => {
          this.showAlert = false
        })
      }
      this.errorMsg = []
    },
    async removeIssueRelation(child_issue_id) {
      this.isLoading = true
      try {
        await updateIssue(child_issue_id, { parent_id: '' })
        // this.$message({
        //   title: this.$t('general.Success'),
        //   message: this.$t('Notify.Updated'),
        //   type: 'success'
        // })
        await this.handleUpdated()
      } catch (err) {
        console.error(err)
      }
      this.isLoading = false
    },
    async removeRelationIssue(relation_id) {
      this.listLoading = true
      try {
        await deleteIssueRelation(relation_id)
        // this.$message({
        //   title: this.$t('general.Success'),
        //   message: this.$t('Notify.Updated'),
        //   type: 'success'
        // })
        await this.handleUpdated()
      } catch (err) {
        console.error(err)
      }
      this.listLoading = false
    },
    hasUnsavedChanges() {
      const isNotesChanged = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown') !== ''
      // const isFilesChanged = this.$refs.IssueFileUploader.uploadFileList.length > 0
      return this.isFormDataChanged() || isNotesChanged
    },
    isFormDataChanged() {
      if (Object.keys(this.originForm).length === 0) return false
      for (const key in this.form) {
        if (this.originForm[key] === null) {
          this.originForm[key] = 0
        }
        if (
          key === 'relation_ids'
            ? this.originForm[key].length !== this.form[key].length
            : this.originForm[key] !== this.form[key]
        ) {
          return true
        }
      }
      return false
    },
    handleRelationDelete() {
      this.handleUpdated()
      this.onCloseRelationIssueDialog()
    },
    handleRelationIssueDialogBeforeClose(done) {
      if (this.$refs.children.hasUnsavedChanges()) {
        this.$confirm(this.$t('Notify.UnSavedChanges'), this.$t('general.Warning'), {
          confirmButtonText: this.$t('general.Confirm'),
          cancelButtonText: this.$t('general.Cancel'),
          type: 'warning'
        })
          .then(() => {
            done()
          })
          .catch(() => {
          })
      } else {
        done()
      }
    },
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
    },
    onCloseRelationIssueDialog() {
      this.$set(this.relationIssue, 'visible', false)
      this.$set(this.relationIssue, 'id', null)
    },
    formatTime(value) {
      return dayjs(value).fromNow()
    },
    onScrollIssue() {
      this.$nextTick(() => {
        const editorHeight =
          this.$refs['IssueNotesDialog'].$el.getBoundingClientRect().top -
          this.$refs['IssueDescription'].$el.getBoundingClientRect().height
        if (this.$refs['mainIssueWrapper'].$el.children.length <= 2 && editorHeight < 0) {
          if (
            this.$refs['mainIssue'].$children[this.$refs['mainIssue'].$children.length - 2].$children[0].$options &&
            this.$refs['mainIssue'].$children[this.$refs['mainIssue'].$children.length - 2].$children[0].$options
              .name === 'IssueNotesEditor'
          ) {
            this.$refs['mainIssueWrapper'].$el.appendChild(this.$refs['moveEditor'].$el)
            this.scrollClass = 'issueHeightEditor'
          }
        } else {
          if (this.$refs['mainIssueWrapper'].$el.children.length >= 3 && editorHeight > 0) {
            this.$refs['mainIssue'].$el.insertBefore(
              this.$refs['mainIssueWrapper'].$el.getElementsByClassName('moveEditor')[0],
              this.$refs['mainIssue'].$el.children[this.$refs['mainIssue'].$el.children.length - 1]
            )
            this.scrollClass = 'issueHeight'
          }
        }
      })
    },
    async getIssueFamilyData(row) {
      try {
        this.isLoadingFamily = true
        const family = await getIssueFamily(row.id)
        const data = family.data
        this.formatIssueFamilyData(row, data)
      } catch (e) {
        //   null
        return Promise.resolve()
      } finally {
        this.isLoadingFamily = false
      }
      return Promise.resolve()
    },
    formatIssueFamilyData(row, data) {
      if (data.hasOwnProperty('parent')) {
        this.$set(row, 'parent', data.parent)
        this.$set(this, 'parent', data.parent)
      } else {
        this.originForm.parent_id = ''
        this.form.parent_id = ''
        this.$set(row, 'parent', {})
        this.$set(this, 'parent', {})
      }
      if (data.hasOwnProperty('children')) {
        this.$set(row, 'children', data.children)
        this.$set(this, 'children', data.children)
      } else {
        this.$set(row, 'children', [])
        this.$set(this, 'children', [])
      }
      if (data.hasOwnProperty('relations')) {
        this.originForm.relation_ids = data.relations.map((item) => item.id)
        this.form.relation_ids = data.relations.map((item) => item.id)
        this.$set(row, 'relations', data.relations)
        this.$set(this, 'relations', data.relations)
      } else {
        this.originForm.relation_ids = []
        this.form.relation_ids = []
        this.$set(row, 'relations', [])
        this.$set(this, 'relations', [])
      }
    },
    toggleIssueMatrixDialog() {
      this.issueMatrixDialog.visible = !this.issueMatrixDialog.visible
    },
    toggleDialogVisible(value) {
      this[value + 'DialogVisible'] = !this[value + 'DialogVisible']
    },
    updateTestCollection(value) {
      this.test_files = value
    },
    onContextMenu({ row, column, event }) {
      this.handleContextMenu(row, column, event)
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    UTCtoLocalTime(value) {
      return UTCtoLocalTime(value)
    },
    onResetPId(pId) {
      this.form.project_id = pId
    },
    onCancel() {
      this.form.project_id = this.storagePId
      this.isShowDialog = false
    },
    onConfirm() {
      this.storagePId = this.form.project_id
      this.resetForm()
      this.isShowDialog = false
    },
    resetForm() {
      this.form.tags = []
      this.form.assigned_to_id = ''
      this.form.fixed_version_id = ''
    },
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return {
        color
      }
    },
    copyUrl() {
      const message = this.$t('Notify.Copied')
      const input = document.createElement('input')
      const url = `${window.location.origin}/#/project/issues/${this.issueId}`
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      input.remove()
      this.showSuccessMessage(message)
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        message,
        type: 'success'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'src/styles/theme/variables.scss';

.issueHeight {
  height: calc(95vh - 50px - 81px - 40px - 32px);
  overflow-y: auto;
}

.issueHeightEditor {
  height: calc(95vh - 50px - 81px - 40px - 32px - 150px);
  overflow-y: auto;
}

.issueOptionHeight {
  height: calc(95vh - 50px - 81px - 40px);
  overflow-y: auto;
}

.point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;

  &.feature {
    background: $feature;
  }

  &.document {
    background: $document;
  }

  &.bug {
    background: $bug;
  }

  &.research {
    background: $research;
  }
}

.el-tag {
  &--secondary {
    background-color: $secondary;
    border-color: $secondary;
  }
}

.previous {
  font-size: 0.75em;
}
</style>
