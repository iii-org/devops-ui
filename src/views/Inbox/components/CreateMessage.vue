<template>
  <el-dialog
    :title="isEdit ? $t('Inbox.EditMessage') : $t('Inbox.CreateMessage')"
    :show-close="false"
    :visible.sync="showDialog"
    :close-on-click-modal="false"
    width="50%"
    @closed="onDialogClosed"
  >
    <el-form ref="createMessage" :model="form" :rules="rules" label-position="top" size="medium">
      <el-row :gutter="10">
        <el-col :span="24" :sm="16">
          <el-col :span="24">
            <el-form-item :label="$t('Inbox.Title')" prop="title">
              <el-input 
                v-model="form.title" 
                :placeholder="$t('general.PleaseInput') + $t('Inbox.Title')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('Inbox.MessageContent')" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :autosize="{ minRows: 6, maxRows: 6}"
                :placeholder="$t('general.PleaseInput') + $t('Inbox.MessageContent')"
              />
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24" :sm="8">
          <el-col>
            <el-radio-group v-model="messageType" size="mini">
              <el-radio-button label="Public">{{ $t('Inbox.Public') }}</el-radio-button>
              <el-radio-button label="Private">{{ $t('Inbox.Private') }}</el-radio-button>
            </el-radio-group>
          </el-col>
          <el-col v-if="messageType === 'Private'" :span="24">
            <el-form-item :label="$t('Inbox.GroupReceiverTitle')" prop="type_id">
              <el-select v-model="form.type_id" style="width: 100%">
                <el-option v-for="item in groupReceiver" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type_id === 2 || form.type_id === 5" :span="24">
            <el-form-item :label="$t('Inbox.GroupReceiver.Project')" prop="project_ids">
              <el-select v-model="form.project_ids" multiple collapse-tags style="width: 100%">
                <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id">
                  {{ item.name }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type_id === 3" :span="24">
            <el-form-item :label="$t('Inbox.GroupReceiver.User')" prop="user_ids">
              <el-select v-model="form.user_ids" multiple collapse-tags style="width: 100%">
                <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id">
                  {{ item.name }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type_id === 4" :span="24">
            <el-form-item :label="$t('Inbox.GroupReceiver.Role')" prop="role_ids">
              <el-select v-model="form.role_ids" multiple style="width: 100%">
                <el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id">
                  {{ item.name }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('Inbox.AlertLevel')" prop="alert_level">
              <el-select v-model="form.alert_level" style="width: 100%">
                <el-option v-for="item in filteredAlert" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="buttonSecondaryReverse" :disabled="isLoading" @click="onDialogClosed">{{ $t('general.Cancel') }}</el-button>
      <el-button class="buttonPrimary" :loading="isLoading" @click="onSend">{{ $t('Inbox.Send') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getAllUser } from '@/api/user'
import { createMessage, deleteMessage } from '@/api/monitoring'

const formTemplate = () => ({
  title: '',
  content: '',
  type_id: '',
  project_ids: [],
  user_ids: [],
  role_ids: [],
  alert_level: 1
})

export default {
  name: 'CreateMessage',
  props: {
    alertList: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    messageData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: formTemplate(),
      showDialog: false,
      isLoading: false,
      messageType: 'Public',
      projectList: [],
      userList: [],
      rules: {
        title: [
          { required: true, message: this.$t('general.PleaseInput') + ' Title', trigger: 'blur' }
        ],
        content: [
          { required: true, message: this.$t('general.PleaseInput') + ' Message Content', content: 'blur' }
        ],
        type_id: [
          { required: true, message: this.$t('general.PleaseInput') + ' Group Receiver', trigger: 'blur' }
        ],
        project_ids: [
          { required: true, message: 'Please Specify Project', trigger: 'blur' }
        ],
        user_ids: [
          { required: true, message: 'Please Specify User', trigger: 'blur' }
        ],
        role_ids: [
          { required: true, message: 'Please Specify Role', trigger: 'blur' }
        ],
        alert_level: [
          { required: true, message: this.$t('general.PleaseInput') + ' Alert Level', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['projectOptions', 'roleList']),
    groupReceiver() {
      return [
        { id: 2, label: this.$t('Inbox.GroupReceiver.Project') },
        { id: 3, label: this.$t('Inbox.GroupReceiver.User') },
        { id: 4, label: this.$t('Inbox.GroupReceiver.Role') },
        { id: 5, label: this.$t('Inbox.GroupReceiver.ProjectOwner') }
      ]
    },
    filteredAlert() {
      return this.alertList.slice(0, 3)
    }
  },
  watch: {
    messageType(value) {
      if (value === 'Public') {
        this.form.type_id = 1
      } else if (this.isEdit && this.messageData.types[0].type_id !== 1) {
        this.form.type_id = this.messageData.types[0].type_id
      } else {
        this.form.type_id = ''
      }
      if (this.$refs.createMessage) this.$refs.createMessage.clearValidate()
    },
    'form.type_id'() {
      if (this.$refs.createMessage) this.$refs.createMessage.clearValidate()
    },
    isEdit() {
      this.assignMessageData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.projectList = this.projectOptions.filter(obj => {
        return obj.is_lock !== true && obj.disabled !== true
      })
      const res = await getAllUser()
      this.userList = res
    },
    assignMessageData() {
      if (this.isEdit) {
        this.form.title = this.messageData.title
        this.form.content = this.messageData.message
        this.form.type_id = this.messageData.types[0].type_id
        if (this.form.type_id !== 1) {
          this.messageType = 'Private'
          if (this.form.type_id === 2 || this.form.type_id === 5) {
            this.form.project_ids = this.messageData.types[0].type_parameter.project_ids
          } else if (this.form.type_id === 3) {
            this.form.user_ids = this.messageData.types[0].type_parameter.user_ids
          } else if (this.form.type_id === 4) {
            this.form.role_ids = this.messageData.types[0].type_parameter.role_ids
          }
        } else {
          this.form.type_id = ''
        }
        this.form.alert_level = this.messageData.alert_level.id
      }
    },
    onDialogClosed() {
      this.showDialog = false
      this.messageType = 'Public'
      this.$refs.createMessage.clearValidate()
      this.$nextTick(() => {
        this.$refs.createMessage.resetFields()
        this.form = formTemplate()
        this.$emit('edit')
      })
    },
    async onSend() {
      this.$refs.createMessage.validate(async (valid) => {
        if (!valid) return
        this.isLoading = true
        if (this.form.type_id.length === 0) this.form.type_id = 1
        const sendData = {}
        sendData.title = this.form.title
        sendData.message = this.form.content
        sendData.type_ids = JSON.stringify(Array.from(this.form.type_id.toString(), Number))
        sendData.alert_level = this.form.alert_level.toString()
        if (this.form.type_id !== 1) {
          if (this.form.type_id === 2 || this.form.type_id === 5) {
            sendData.type_parameters = JSON.stringify({ project_ids: this.form.project_ids })
          } else if (this.form.type_id === 3) {
            sendData.type_parameters = JSON.stringify({ user_ids: this.form.user_ids })
          } else if (this.form.type_id === 4) {
            sendData.type_parameters = JSON.stringify({ role_ids: this.form.role_ids })
          }
        }
        await createMessage(sendData)
          .then(async () => {
            if (this.isEdit) await deleteMessage(this.messageData.id)
            const message = this.isEdit ? this.$t('Notify.Updated') : this.$t('Notify.Created')
            this.$message({
              message: message,
              type: 'success'
            })
            this.$emit('load-data')
            this.onDialogClosed()
            this.isLoading = false
          })
          .catch((err) => {
            console.log(err)
            this.isLoading = false
          })
      })
    }
  }
}
</script>
