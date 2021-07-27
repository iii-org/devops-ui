<template>
  <el-row v-show="visible">
    <el-form ref="issueForm" inline :model="form" :rules="formRules">
      <el-form-item prop="tracker_id">
        <el-select v-model="form.tracker_id">
          <el-option v-for="track in tracker" :key="track.id" :label="$t('Issue.'+track.name)" :value="track.id">
            <tracker :name="track.name" />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="subject">
        <el-input v-model="form.subject" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">{{ $t('general.Save') }}</el-button>
        <el-button @click="advancedAddIssue">》進階設定</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
import Tracker from '@/components/Issue/Tracker'

export default {
  name: 'QuickAddIssue',
  components: { Tracker },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tracker: {
      type: Array,
      default: () => ([])
    },
    projectId: {
      type: Number,
      default: 0
    },
    saveData: {
      type: Function,
      default: () => {
      }
    }
  },
  data() {
    return {
      form: {
        tracker_id: null,
        subject: null,
        status_id: 1,
        priority_id: 3
      },
      formRules: {
        subject: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        tracker_id: [{ required: true, message: 'Please select type', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleSave() {
      this.$refs['issueForm'].validate(async valid => {
        if (valid) {
          // deep copy & remove field with empty value
          const data = JSON.parse(JSON.stringify(this.form))
          Object.keys(data).map(item => {
            if (data[item] === '') delete data[item]
          })

          // because have file need upload so use formData object
          const form = new FormData()
          form.append('project_id', this.projectId)
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
          this.form.subject = null
          this.form.status_id = 1
          this.form.priority_id = 3
        } else {
          return false
        }
      }
      )
    },
    handleClose() {
      this.$emit('close-dialog', false)
    },
    advancedAddIssue() {
      this.$emit('add-issue', this.form)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dialog__body {
  width: 80vh;
}
</style>
