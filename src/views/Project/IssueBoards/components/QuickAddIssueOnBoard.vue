<template>
  <el-row>
    <el-col>
      <el-form ref="issueForm" :model="form" :rules="formRules">
        <el-form-item prop="tracker_id">
          <el-select
            v-model="form.tracker_id"
            :placeholder="$t('Issue.SelectType')"
            style="width: 100%"
          >
            <el-option
              v-for="option in tracker"
              :key="option.id"
              :label="$t('Issue.' + option.name)"
              :value="option.id"
            >
              <tracker :name="option.name" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-model="form.name" :placeholder="$t('Issue.name')" />
        </el-form-item>
        <el-form-item prop="assigned_to_id">
          <el-select
            v-model="form.assigned_to_id"
            style="width: 100%"
            clearable
            :placeholder="$t('Issue.SelectMember')"
            filterable
          >
            <el-option v-for="item in assigned_to"
                       :key="item.login"
                       :class="item.class"
                       :label="item.name+' ('+item.login+')'"
                       :value="item.id"
            >
              {{ item.name }} ({{ item.login }})
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
          <el-button @click="advancedAddIssue">》進階設定</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-dialog
      :title="$t('Issue.AddIssue')"
      :visible.sync="addTopicDialogVisible"
      width="50%"
      top="5px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      @close="handleClose"
    >
      <AddIssue ref="AddIssue"
                :project-id="selectedProjectId"
                :parent-id="parentId"
                :prefill="form"
                :save-data="saveData"
                import-from="board"
                @loading="loadingUpdate"
                @add-topic-visible="handleCloseDialog"
      />
      <span slot="footer" class="dialog-footer">
        <el-button id="dialog-btn-cancel" @click="handleAdvancedClose">{{ $t('general.Cancel') }}</el-button>
        <el-button id="dialog-btn-confirm" :loading="LoadingConfirm" type="primary"
                   @click="handleAdvancedSave"
        >
          {{ $t('general.Confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import Tracker from '@/components/Issue/Tracker'
import { getProjectAssignable } from '@/api/projects'
import { mapGetters } from 'vuex'
import AddIssue from '@/components/Issue/AddIssue'

export default {
  name: 'QuickAddIssueOnBoard',
  components: { AddIssue, Tracker },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: 0
    },
    saveData: {
      type: Function,
      default: () => {
      }
    },
    boardObject: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const validateAssignedTo = (rule, value, callback) => {
      if ((!value || value === '') && (this.form.status_id >= 2)) {
        callback(new Error('This Status need a assignee.'))
      } else {
        callback()
      }
    }
    return {
      addTopicDialogVisible: false,
      LoadingConfirm: false,
      assigned_to: [],
      parentId: 0,
      form: {
        tracker_id: null,
        name: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      },
      advancedForm: {},
      formRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        assigned_to_id: [{ validator: validateAssignedTo, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId', 'userId', 'groupBy', 'issueFilter', 'tracker'])
  },
  watch: {
    boardObject: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    },
    groupBy: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    },
    issueFilter: {
      deep: true,
      handler() {
        this.setFilterValue()
      }
    }
  },
  mounted() {
    this.setFilterValue()
    this.fetchSelection()
  },
  methods: {
    async fetchSelection() {
      await Promise.all([
        getProjectAssignable(this.selectedProjectId)
      ]).then(res => {
        const [assigned_to] = res.map(
          item => item.data
        )
        this.assigned_to = [
          {
            name: this.$t('Issue.me'),
            login: '-Me-',
            id: this.userId,
            class: 'bg-yellow-100'
          }, ...assigned_to.user_list
        ]
      })
    },
    setFilterValue() {
      this.form = {
        tracker_id: null,
        name: null,
        assigned_to_id: null,
        status_id: 1,
        priority_id: 3
      }
      const dimensions = ['fixed_version', 'tracker']
      dimensions.forEach((item) => {
        if (this.issueFilter['board'] && this.issueFilter['board'][item] !== 'null' &&
          !!(this.issueFilter['board'][item]) && this.issueFilter['board'][item] !== '') {
          this.$set(this.form, item + '_id', this.issueFilter['board'][item])
        }
      })
      if (this.boardObject.id !== 'null' && !!(this.boardObject.id) && this.boardObject.id !== '') {
        this.$set(this.form, this.groupBy.dimension + '_id', this.boardObject.id)
      }
    },
    handleSave() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.form))
          Object.keys(data).map(item => {
            if (data[item] === '' || data[item] === 'null' || !data[item]) delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.selectedProjectId)
          // if (this.parentId) form.append('parent_id', this.parentId)
          Object.keys(data).forEach(objKey => {
            form.append(objKey, data[objKey])
          })
          // if (this.uploadFileList.length > 0) {
          //   form.append('upload_file', this.uploadFileList[0].raw, this.uploadFileList[0].raw.name)
          // }
          this.LoadingConfirm = true
          await this.saveData(form)
          this.LoadingConfirm = false
          this.setFilterValue()
          this.$emit('after-add')
        } else {
          return false
        }
      }
      )
    },
    handleClose() {
      this.$emit('close-dialog', false)
    },
    handleCloseDialog() {
      this.addTopicDialogVisible = false
    },
    handleAdvancedClose() {
      this.$refs['AddIssue'].handleClose()
      this.setFilterValue()
    },
    handleAdvancedSave() {
      this.$refs['AddIssue'].handleSave()
      this.setFilterValue()
      this.$emit('after-add')
    },
    advancedAddIssue() {
      this.addTopicDialogVisible = true
      this.parentId = 0
      this.advancedForm = this.form
    },
    loadingUpdate(value) {
      this.LoadingConfirm = value
    }
  }
}
</script>

<style lang="scss" scoped>
  .board-item {
    cursor: pointer;
    width: 95%;
    margin: 5px auto;
    background-color: #fff;
    text-align: left;
    line-height: 20px;
    padding: 5px 10px;
    box-sizing: border-box;
    border: 1px solid #e9e9e9;
    box-shadow: 1px 3px 3px 0 rgba(0, 0, 0, 0.2);
  }
</style>
