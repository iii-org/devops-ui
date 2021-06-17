<template>
  <div class="app-container">
    <el-card v-loading="isLoading">
      <el-row slot="header">
        <el-row type="flex" align="bottom" justify="space-between">
          <el-row>
            <el-col class="text-h5 mr-3">
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
              <IssueTitle ref="IssueTitle" v-model="form.subject" />
              <span class="text-body-1 mr-3">
                {{ $t('Issue.AddBy', { user: author, created_date: formatTime(created_date) }) }}
              </span>
            </el-col>
          </el-row>
          <el-col :span="6" class="text-right">
            <el-button size="medium" type="danger" plain @click="handleDelete">{{ $t('general.Delete') }}</el-button>
            <el-button size="medium" type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
          </el-col>
        </el-row>
      </el-row>
      <el-row :gutter="20">
        <el-col ref="mainIssueWrapper" :span="24" :md="16">
          <el-col :span="24">
            <IssueToolbar :issue-link="issue_link" :issue-id="issueId" :issue-name="issueSubject"
                          @update-issue="handleUpdated"
            />
          </el-col>
          <el-row ref="mainIssue" :gutter="10" :class="scrollClass" @scroll.native="onScrollIssue">
            <el-col ref="IssueDescription" :span="24" class="mb-3">
              <issue-description v-model="form.description" />
            </el-col>
            <el-col ref="IssueFiles">
              <issue-files v-if="files.length>0" :issue-file.sync="files" />
            </el-col>
            <el-col ref="IssueRelation">
              <el-collapse v-if="countRelationIssue>0">
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
                        #{{ parent.id }} - {{ parent.name }}
                        <span v-if="parent.assigned_to&&Object.keys(parent.assigned_to).length>0">({{ $t('Issue.Assignee') }}:{{ parent.assigned_to.name }} - {{ parent.assigned_to.login }})</span>
                      </el-link>
                      <div class="text-right">
                        <el-popconfirm
                          :confirm-button-text="$t('general.Remove')"
                          :cancel-button-text="$t('general.Cancel')"
                          icon="el-icon-info"
                          icon-color="red"
                          :title="$t('Issue.RemoveIssueRelation')"
                          @onConfirm="removeIssueRelation(issueId)"
                        >
                          <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">{{ $t('Issue.Unlink') }}</el-button>
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
                            #{{ child.id }} - {{ child.subject }}
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
                              @onConfirm="removeIssueRelation(child.id)"
                            >
                              <el-button slot="reference" type="danger" size="mini" icon="el-icon-remove">{{ $t('Issue.Unlink') }}</el-button>
                            </el-popconfirm>
                          </div>
                        </li>
                      </ol>
                    </li>
                  </ul>
                </el-collapse-item>
              </el-collapse>
            </el-col>
            <el-col ref="moveEditor" :span="24" class="moveEditor mb-3">
              <issue-notes-editor ref="IssueNotesEditor" height="125px" />
            </el-col>
            <el-col :span="24">
              <issue-notes-dialog ref="IssueNotesDialog" :height="dialogHeight" :data="journals" @show-parent-issue="onRelationIssueDialog" />
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="24" :md="8" class="issueOptionHeight">
          <issue-form ref="IssueForm" :issue-id="issueId" :form.sync="form" :parent="parent" :children-issue="children.length" @isLoading="showLoading" />
        </el-col>
      </el-row>
      <el-dialog :visible.sync="relationIssue.visible" width="90%" top="3vh" append-to-body destroy-on-close>
        <ProjectIssueDetail ref="children" :props-issue-id="relationIssue.id" :is-in-dialog="true" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getIssue, updateIssue, deleteIssue } from '@/api/issue'
import {
  IssueForm,
  IssueNotesDialog,
  IssueNotesEditor,
  IssueFiles,
  IssueDescription,
  IssueTitle,
  IssueToolbar
} from './components'
import dayjs from 'dayjs'
import Tracker from '@/components/Issue/Tracker'
import Status from '@/components/Issue/Status'

export default {
  name: 'ProjectIssueDetail',
  components: {
    Tracker,
    Status,
    IssueTitle,
    IssueDescription,
    IssueForm,
    IssueNotesDialog,
    IssueNotesEditor,
    IssueToolbar,
    IssueFiles
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
      issue_link: '',
      issueId: null,
      issueSubject: '',
      author: '',
      created_date: '',
      tracker: '',
      view: {},
      form: {
        parent_id: null,
        project_id: 0,
        assigned_to_id: -1,
        subject: '',
        fixed_version_id: '',
        tracker_id: -1,
        status_id: 1,
        priority_id: 3,
        estimated_hours: 0,
        done_ratio: 0,
        start_date: '',
        due_date: '',
        description: ''
      },
      files: [],
      journals: [],
      formObj: {},
      parent: {},
      children: [],
      dialogHeight: '100%',
      editorHeight: '100px',
      issueScrollTop: 0,
      scrollClass: 'issueHeight',
      relationIssue: {
        visible: false,
        id: null
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.formObj = from
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
          next()
        })
        .catch(() => {
          next(false)
        })
    } else {
      next()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId']),
    hasRelationIssue() {
      return Object.keys(this.parent).length > 0 || this.children.length > 0
    },
    countRelationIssue() {
      let parent = 0
      let children = 0
      if (this.parent && Object.keys(this.parent).length > 0) {
        parent = 1
      }
      if (this.children !== undefined) {
        children = this.children.length
      }
      return parent + children
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
    async fetchIssueLink() {
      this.isLoading = true
      this.issueId = parseInt(this.$route.params.issueId)
      if (this.propsIssueId) {
        this.issueId = parseInt(this.propsIssueId)
      }
      await this.fetchIssue()
      this.isLoading = false
    },
    async fetchIssue() {
      const _this = this
      this.isLoading = true
      return getIssue(this.issueId)
        .then(res => {
          _this.initIssueDetails(res.data)
        })
        .catch(() => {
          this.$router.push(this.formObj)
          this.$message({
            message: this.$t('Issue.RemovedIssue'),
            type: 'warning'
          })
          this.isLoading = false
        })
    },
    initIssueDetails(data) {
      const { issue_link, author, attachments, created_date, journals, subject, tracker, parent, children } = data
      this.issue_link = issue_link
      this.issueSubject = subject
      this.author = author.name
      this.tracker = tracker.name
      this.files = attachments
      this.created_date = created_date
      this.journals = journals.reverse()
      this.parent = (parent) || []
      this.children = (children) || []
      this.setFormData(data)
      this.view = data
    },
    setFormData(data) {
      const {
        parent,
        assigned_to,
        fixed_version,
        subject,
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
      this.form.project_id = this.selectedProjectId
      this.form.assigned_to_id = assigned_to ? assigned_to.id : ''
      this.form.subject = subject
      this.form.fixed_version_id = fixed_version ? fixed_version.id : ''
      this.form.tracker_id = tracker.id
      this.form.status_id = status.id
      this.form.priority_id = priority.id
      this.form.estimated_hours = estimated_hours
      this.form.done_ratio = done_ratio
      this.form.start_date = start_date === null ? '' : start_date
      this.form.due_date = due_date === null ? '' : due_date
      this.form.description = description === null ? '' : description
      this.originForm = Object.assign({}, this.form)
    },
    handleDelete() {
      this.$confirm(this.$t('Issue.DeleteIssue', { issueName: this.form.subject }), this.$t('general.Delete'), {
        confirmButtonText: this.$t('general.Delete'),
        cancelButtonText: this.$t('general.Cancel'),
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }).then(async () => {
        this.isLoading = true
        await deleteIssue(this.issueId)
          .then(() => {
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Deleted'),
              type: 'success'
            })
            this.$router.push(this.formObj)
          })
          .catch(err => {
            this.$message({
              title: this.$t('general.Error'),
              message: err,
              type: 'error'
            })
          })
        this.isLoading = false
      })
    },
    async handleUpdated() {
      this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('reset')
      this.$refs.IssueTitle.edit = false
      this.$refs.IssueDescription.edit = false
      await this.$refs.IssueForm.getClosable()
      await this.fetchIssue()
      this.isLoading = false
    },
    handleBackPage() {
      this.$router.push(this.formObj)
    },
    showLoading(status) {
      this.isLoading = status
    },
    handleSave() {
      this.$refs.IssueForm.$refs.form.validate(valid => {
        if (valid) this.editIssue()
      })
    },
    editIssue() {
      const sendData = Object.assign({}, this.form)
      const notes = this.$refs.IssueNotesEditor.$refs.mdEditor.invoke('getMarkdown')
      if (notes !== '') sendData['notes'] = notes
      // Object.keys(sendData).map(item => {
      //   if (sendData[item] === '' || !sendData[item]) delete sendData[item]
      // })
      const sendForm = new FormData()
      Object.keys(sendData).forEach(objKey => {
        sendForm.append(objKey, sendData[objKey])
      })
      this.updateIssueForm(sendForm)
    },
    updateIssueForm(sendForm) {
      this.isLoading = true
      const { issueId } = this
      updateIssue(issueId, sendForm)
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleUpdated()
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
    },
    removeIssueRelation(child_issue_id) {
      this.isLoading = true
      updateIssue(child_issue_id, { parent_id: '' })
        .then(() => {
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
          this.handleUpdated()
        })
        .catch(err => {
          console.error(err)
          this.isLoading = false
        })
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
    onRelationIssueDialog(id) {
      this.$set(this.relationIssue, 'visible', true)
      this.$set(this.relationIssue, 'id', id)
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
          if (this.$refs['mainIssue'].$children[3].$children[0].$options.name === 'IssueNotesEditor') {
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
