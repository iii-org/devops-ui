<template>
  <div class="app-container">
    <el-card v-loading="isLoading" :element-loading-text="$t('Loading')" :body-style="{ 'min-height': '80vh' }">
      <el-row slot="header">
        <el-row type="flex" align="bottom" justify="space-between">
          <el-row>
            <el-col class="text-xl mr-3">
              <el-button v-if="!isInDialog" type="text" size="medium" icon="el-icon-arrow-left" class="previous"
                         @click="handleBackPage"
              >
                {{ $t('general.Back') }}
              </el-button>
              <template v-if="tracker">
                <tracker :name="tracker" />
              </template>
              <template v-else>{{ $t('Issue.Issue') }}</template>
              #{{ issueId }} -
              <IssueTitle ref="IssueTitle" v-model="form.name" :old-value="originForm.name" :issue-id="issueId" />
              <span v-if="!isLoading&&issueId" class="text-base mr-3">
                {{ $t('Issue.AddBy', { user: author, created_date: formatTime(created_date) }) }}
              </span>
            </el-col>
          </el-row>
          <el-col :span="6" class="text-right">
            <el-button size="medium" :type="isButtonDisabled ? 'info' : 'danger'" plain :disabled="isButtonDisabled"
                       @click="handleDelete"
            >{{ $t('general.Delete') }}
            </el-button>
            <el-button size="medium" :type="isButtonDisabled ? 'info' : 'primary'" :disabled="isButtonDisabled"
                       @click="handleSave"
            >{{ $t('general.Save') }}
            </el-button>
          </el-col>
        </el-row>
      </el-row>
      <el-row :gutter="20">
        <el-col ref="mainIssueWrapper" :span="24" :md="16">
          <el-col :span="24">
            <IssueToolbar :is-button-disabled="isButtonDisabled"
                          :issue-link="issue_link"
                          :issue-id="issueId"
                          :issue-name="issueName"
                          :issue-tracker="formTrackerName"
                          @is-loading="showLoading"
                          @related-collection="toggleDialogVisible"
            />
          </el-col>
          <el-row ref="mainIssue" :gutter="10" :class="scrollClass" @scroll.native="onScrollIssue">
            <el-col :span="24" class="mb-3">
              <issue-description ref="IssueDescription" v-model="form.description" :old-value="originForm.description"
                                 :issue-id="issueId"
              />
            </el-col>
            <el-col ref="IssueFiles">
              <issue-files v-if="files.length>0" :is-button-disabled="isButtonDisabled" :issue-file.sync="files" />
            </el-col>
            <el-col ref="IssueTest">
              <issue-collection v-if="test_files.length>0" :issue-test.sync="test_files"
                                @update="updateTestCollection"
              />
            </el-col>
            <el-col ref="IssueRelation">
              <el-collapse v-if="countRelationIssue>0">
                <!--                <el-collapse-item>-->
                <!--                  <div slot="title">-->
                <!--                    {{ $t('Issue.RelatedIssue') + '(' + countRelationIssue + ')' }}-->
                <!--                    <el-button size="mini" type="primary" @click="toggleIssueMatrixDialog">-->
                <!--                      {{ $t('Issue.TraceabilityMatrix') }}-->
                <!--                    </el-button>-->
                <!--                  </div>-->
                <el-collapse-item :title="$t('Issue.RelatedIssue')+'('+countRelationIssue+')'">
                  <ul>
                    <li v-if="Object.keys(parent).length>0">
                      {{ $t('Issue.ParentIssue') }}：
                      <el-link :underline="false" @click="onRelationIssueDialog(parent.id)">
                        <status :name="parent.status.name" size="mini" />
                        <template v-if="parent.tracker">
                          <tracker :name="parent.tracker.name" />
                        </template>
                        <template v-else>{{ $t('Issue.Issue') }}</template>
                        #{{ parent.id }} -
                        <el-tag v-for="item in parent.tags" :key="item.id" size="mini" class="mr-1">{{ item.name }}</el-tag>
                        {{ parent.name }}
                        <span v-if="parent.assigned_to&&Object.keys(parent.assigned_to).length>0">
                          ({{ $t('Issue.Assignee') }}:{{ parent.assigned_to.name }}
                          - {{ parent.assigned_to.login }})</span>
                      </el-link>
                      <div class="text-right">
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @confirm="removeIssueRelation(issueId)"
                        >
                          <el-button slot="reference" :type="isButtonDisabled ? 'info' : 'danger'"
                                     :disabled="isButtonDisabled" size="mini" icon="el-icon-remove"
                          >
                            {{ $t('Issue.Unlink') }}
                          </el-button>
                        </el-popconfirm>
                      </div>
                    </li>
                    <li v-if="children.length>0">{{ $t('Issue.ChildrenIssue') }}：
                      <ol>
                        <li v-for="child in children" :key="child.id">
                          <el-link :underline="false" @click="onRelationIssueDialog(child.id)">
                            <status :name="child.status.name" size="mini" />
                            <template v-if="child.tracker">
                              <tracker :name="child.tracker.name" />
                            </template>
                            <template v-else>{{ $t('Issue.Issue') }}</template>
                            #{{ child.id }} - <el-tag v-for="item in child.tags" :key="item.id" size="mini" class="mr-1">{{ item.name }}</el-tag>
                            {{ child.name }}
                            <span v-if="child.assigned_to&&Object.keys(child.assigned_to).length>0">
                              ({{ $t('Issue.Assignee') }}:{{ child.assigned_to.name }}
                              - {{ child.assigned_to.login }})</span>
                          </el-link>
                          <div class="text-right">
                            <el-popconfirm
                              :confirm-button-text="$t('general.Remove')"
                              :cancel-button-text="$t('general.Cancel')"
                              icon="el-icon-info"
                              icon-color="red"
                              :title="$t('Issue.RemoveIssueRelation')"
                              @confirm="removeIssueRelation(child.id)"
                            >
                              <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove" :disabled="isButtonDisabled">
                                {{ $t('Issue.Unlink') }}
                              </el-button>
                            </el-popconfirm>
                          </div>
                        </li>
                      </ol>
                    </li>
                    <li v-if="relations.length>0">{{ $t('Issue.RelatedIssue') }}
                      <ol>
                        <template v-for="child in relations">
                          <li :key="child.id">
                            <el-link :underline="false" @click="onRelationIssueDialog(child.id)">
                              <status :name="child.status.name" size="mini" />
                              <template v-if="child.tracker">
                                <tracker :name="child.tracker.name" />
                              </template>
                              <template v-else>{{ $t('Issue.Issue') }}</template>
                              #{{ child.id }} - <el-tag v-for="item in child.tags" :key="item.id" size="mini" class="mr-1">{{ item.name }}</el-tag>
                              {{ child.name }}
                              <span v-if="child.assigned_to&&Object.keys(child.assigned_to).length>0">
                                ({{ $t('Issue.Assignee') }}:{{ child.assigned_to.name }}
                                - {{ child.assigned_to.login }})</span>
                            </el-link>
                            <div class="text-right">
                              <el-popconfirm
                                :confirm-button-text="$t('general.Remove')"
                                :cancel-button-text="$t('general.Cancel')"
                                icon="el-icon-info"
                                icon-color="red"
                                :title="$t('Issue.RemoveIssueRelation')"
                                @confirm="removeRelationIssue(child.relation_id)"
                              >
                                <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove" :disabled="isButtonDisabled">
                                  {{ $t('Issue.Unlink') }}
                                </el-button>
                              </el-popconfirm>
                            </div>
                          </li>
                        </template>
                      </ol>
                    </li>
                  </ul>
                </el-collapse-item>
              </el-collapse>
            </el-col>
            <el-col ref="moveEditor" :span="24" class="moveEditor mb-3">
              <issue-notes-editor ref="IssueNotesEditor" />
            </el-col>
            <el-col :span="24">
              <issue-notes-dialog ref="IssueNotesDialog" :height="dialogHeight" :data="journals"
                                  @show-parent-issue="onRelationIssueDialog"
              />
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="24" :md="8" class="issueOptionHeight">
          <issue-form ref="IssueForm" :issue-id="issueId" :form.sync="form" :parent="parent" :relations="relations"
                      :children-issue="children.length"
          />
        </el-col>
      </el-row>
      <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close
                 :before-close="handleRelationIssueDialogBeforeClose"
      >
        <QAProjectIssueDetail v-if="relationIssue.visible"
                              ref="children"
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
      <RelatedCollectionDialog :selected-collections="test_files" @update="updateTestCollection"
                               @close-dialog="toggleDialogVisible"
      />
    </el-dialog>
    <!--    <el-dialog-->
    <!--      :visible.sync="issueMatrixDialog.visible"-->
    <!--      width="80%"-->
    <!--      top="20px"-->
    <!--      append-to-body-->
    <!--      destroy-on-close-->
    <!--      :title="$t('Issue.TraceabilityMatrix')+'(#'+issue.id+' - '+ issue.name+')'"-->
    <!--    >-->
    <!--      <IssueMatrix v-if="issueMatrixDialog.visible" :row.sync="issue" @update-issue="handleUpdated" />-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { getIssue, updateIssue, deleteIssue, addIssue, putIssueRelation, deleteIssueRelation } from '@/api/issue'
import {
  IssueForm,
  IssueNotesDialog,
  IssueNotesEditor,
  IssueFiles,
  IssueDescription,
  IssueTitle,
  IssueToolbar,
  IssueCollection
} from './components'
import { addProjectTags } from '@/api/projects'
import dayjs from 'dayjs'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'
import RelatedCollectionDialog from '../../Test/TestFile/components/RelatedCollectionDialog'
import {
  getTestFileByTestPlan,
  putTestPlanWithTestFile
} from '@/views/Plugin/QA/api/qa'
import getPageTitle from '@/utils/get-page-title'
// import IssueMatrix from '@/components/Issue/IssueMatrix'

export default {
  name: 'QAProjectIssueDetail',
  components: {
    IssueCollection,
    Tracker,
    Status,
    IssueTitle,
    IssueDescription,
    IssueForm,
    IssueNotesDialog,
    IssueNotesEditor,
    IssueToolbar,
    IssueFiles,
    // IssueMatrix,
    RelatedCollectionDialog
  },
  props: {
    propsIssueId: {
      type: [String, Number],
      default: null
    },
    isInDialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mode: 'view',
      originForm: {},
      isLoading: false,
      issueMatrixDialog: {
        visible: false
      },
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
      formObj: {},
      parent: {},
      children: [],
      tags: [],
      dialogHeight: '100%',
      editorHeight: '100px',
      issueScrollTop: 0,
      scrollClass: 'issueHeight',
      relationIssue: {
        visible: false,
        id: null
      },
      relations: [],
      relatedCollectionDialogVisible: false,
      tagsString: ''
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (to.name === 'issue-detail' && from.name === 'create-test-plan') vm.formObj = { name: 'test-file' }
      else vm.formObj = from
    })
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
    ...mapGetters(['userProjectList', 'selectedProjectId', 'test_filename', 'userRole']),
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
      const getTrackerName = this.$refs['IssueForm'].tracker.find(item => item.id === this.form.tracker_id)
      if (!getTrackerName) return null
      return getTrackerName.name
    },
    isButtonDisabled() {
      return this.userRole === 'QA'
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
    propsIssueId() {
      this.fetchIssueLink()
    }
  },
  async mounted() {
    await this.fetchIssueLink()
  },
  methods: {
    ...mapActions('projects', ['setSelectedProject']),
    ...mapActions('qa', ['removeFileName']),
    async fetchIssueLink() {
      this.isLoading = true
      if (this.propsIssueId) {
        this.issueId = parseInt(this.propsIssueId)
        await this.fetchIssue()
      } else if (this.$route.params.issueId) {
        this.issueId = parseInt(this.$route.params.issueId)
        await this.fetchIssue()
      } else {
        this.form.project_id = this.selectedProjectId
        const tracker = this.$refs['IssueForm'].tracker.find(item => item.name === 'Test Plan')
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
        this.$route.meta.subject = `[${this.$t('Issue.' + data.tracker.name)}] #${data.id} - ${data.name} @ ${data.project.name}`
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
        this.$router.push(this.formObj)
        this.$message({
          message: this.$t('Issue.RemovedIssue'),
          type: 'warning'
        })
      }
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
      this.parent = (parent) || {}
      this.children = (children) || []
      this.tags = tags || []
      this.setFormData(data)
      this.view = data
      if (Object.keys(data.project).length > 0 && this.selectedProjectId !== data.project.id) {
        this.onProjectChange(data.project.id)
      }
      if (this.$refs.IssueForm) {
        this.$refs.IssueForm.getClosable()
      }
    },
    onProjectChange(value) {
      localStorage.setItem('projectId', value)
      this.setSelectedProject(this.userProjectList.filter(elm => elm.id === value)[0])
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
      this.form.relation_ids = (this.relations.length > 0) ? this.relations.map((item) => (item.id)) : []
      this.form.tags = this.tags.length > 0 ? this.tags.map(item => item.id) : []
      this.originForm = Object.assign({}, this.form)
    },
    handleDelete() {
      this.$confirm(this.$t('Issue.DeleteIssue', { issueName: this.form.name }), this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }).then(async () => {
        this.isLoading = true
        try {
          await deleteIssue(this.issueId)
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Deleted'),
            type: 'success'
          })
          if (this.isInDialog) {
            this.$emit('delete')
          } else {
            this.$router.push(this.formObj)
          }
        } catch (err) {
          this.$message({
            title: this.$t('general.Error'),
            message: err,
            type: 'error'
          })
        }
        this.isLoading = false
      })
    },
    async handleUpdated(issue_id) {
      this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('reset')
      this.$refs.IssueTitle.edit = false
      this.$refs.IssueDescription.edit = false
      this.test_files = []
      this.relations = []
      if (!this.issueId) {
        this.$router.push({ name: 'issue-detail', params: { issueId: issue_id }})
      } else {
        await this.$refs.IssueForm.getClosable()
        await this.fetchIssue()
      }
      this.isLoading = false
    },
    async handleUploadUpdated() {
      await this.fetchIssue(true)
      this.isLoading = false
    },
    handleBackPage() {
      this.$router.push(this.formObj)
    },
    showLoading(status) {
      if (status && status.hasOwnProperty('upload') && status.upload) {
        this.isLoading = status.status
        this.handleUploadUpdated()
      } else {
        this.isLoading = status
        this.handleUpdated()
      }
    },
    handleSave() {
      this.$refs.IssueForm.$refs.form.validate(valid => {
        // const propParentLength = Object.keys(this.parent).length
        if (valid) {
          // const changeRequest = this.$refs.IssueForm.tracker.find((item) => (item.name === 'Change Request'))
          // if (this.form.tracker_id === changeRequest.id && propParentLength === 0) {
          //   const message = '尚未設定本變更議之原由議題單(父議題），請先行設定後再存檔'
          //   this.setWarningMessage(message)
          // } else
          if (this.form.name && this.form.name !== '') {
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
        tags.forEach(tag => {
          if (typeof tag === 'string') addTags.push(tag)
          else if (typeof tag === 'number') originTags.push(tag)
        })
      }
      if (addTags.length > 0) await this.handleAddProjectTags(addTags, originTags, tagsLength)
      else this.tagsArrayToString(originTags, tagsLength)
    },
    async handleAddProjectTags(addTags, originTags, tagsLength) {
      addTags.map(async tag => {
        const tagValue = tag.split('__')[1]
        const formData = this.getAddTagsFormData(tagValue)
        await this.addProjectTags(formData, originTags, tagsLength)
      })
    },
    async addProjectTags(formData, originTags, tagsLength) {
      await addProjectTags(formData)
        .then(async res => {
          const id = res.data.tags.id
          originTags.push(id)
          this.tagsArrayToString(originTags, tagsLength)
        })
    },
    tagsArrayToString(tags, tagsLength) {
      this.tagsString = tags.length > 0 ? tags.join() : null
      if (this.tagsString === null) this.form.tags = ''
      else this.form.tags = this.tagsString
      if (tags.length === tagsLength) this.submitIssue()
    },
    getAddTagsFormData(tag) {
      const formData = new FormData()
      formData.delete('name')
      formData.delete('project_id')
      formData.append('name', tag)
      formData.append('project_id', this.selectedProjectId)
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
      Object.keys(sendData).forEach(objKey => {
        if ((objKey === 'start_date' || objKey === 'end_date') && !sendData[objKey]) {
          sendForm.append(objKey, '')
        } else {
          sendForm.append(objKey, sendData[objKey])
        }
      })
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
            'issue_id': issue_id,
            'test_files': this.test_files.map((item) => ({
              software_name: item.software_name,
              file_name: item.file_name
            }))
          }
          await putTestPlanWithTestFile(this.form.project_id, data)
        }
        if (this.form.relation_ids) {
          const data = {
            'issue_id': issue_id,
            'issue_to_ids': this.form.relation_ids
          }
          await putIssueRelation(data)
        }
        await this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        await this.handleUpdated(issue_id)
        this.$emit('update')
      } catch (e) {
        console.error(e)
      }
      this.isLoading = false
    },
    async removeIssueRelation(child_issue_id) {
      this.isLoading = true
      try {
        await updateIssue(child_issue_id, { parent_id: '' })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
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
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
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
        if (this.originForm[key] !== this.form[key]) {
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
        const editorHeight = this.$refs['IssueNotesDialog'].$el.getBoundingClientRect().top -
          this.$refs['IssueDescription'].$el.getBoundingClientRect().height -
          this.$refs['IssueFiles'].$el.getBoundingClientRect().height -
          this.$refs['IssueRelation'].$el.getBoundingClientRect().height
        if (this.$refs['mainIssueWrapper'].$el.children.length <= 2 && editorHeight < 0) {
          if (this.$refs['mainIssue'].$children[3].$children[0].$options && this.$refs['mainIssue'].$children[3].$children[0].$options.name === 'IssueNotesEditor') {
            this.$refs['mainIssueWrapper'].$el.appendChild(this.$refs['moveEditor'].$el)
            this.scrollClass = 'issueHeightEditor'
          }
        } else {
          if (this.$refs['mainIssueWrapper'].$el.children.length >= 3 && editorHeight > 0) {
            this.$refs['mainIssue'].$el.insertBefore(this.$refs['mainIssueWrapper'].$el.getElementsByClassName('moveEditor')[0], this.$refs['mainIssue'].$el.children[this.$refs['mainIssue'].$el.children.length - 1])
            this.scrollClass = 'issueHeight'
          }
        }
      })
    },
    toggleIssueMatrixDialog() {
      this.issueMatrixDialog.visible = !this.issueMatrixDialog.visible
    },
    toggleDialogVisible(value) {
      this[value + 'DialogVisible'] = !this[value + 'DialogVisible']
    },
    updateTestCollection(value) {
      this.test_files = value
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.issueHeight {
  height: calc(95vh - 50px - 81px - 40px - 32px);
  overflow-y: auto;
}

.issueHeightEditor {
  height: calc(95vh - 50px - 81px - 40px - 32px - 175px);
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
