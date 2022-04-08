<template>
  <el-dialog
    title="Create Message"
    :show-close="false"
    :visible.sync="showDialog"
    :close-on-click-modal="false"
    width="50%"
    @closed="onDialogClosed"
  >
    <el-form ref="createMessage" :model="form" :rules="rules" label-position="top" size="medium">
      <el-row :gutter="10">
        <el-col :span="24" :sm="16" :xl="6">
          <el-col :span="24">
            <el-form-item label="Title" prop="title">
              <el-input 
                v-model="form.title" 
                :placeholder="$t('general.PleaseInput') + ' Title'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Content" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :autosize="{ minRows: 6, maxRows: 6}"
                :placeholder="$t('general.PleaseInput') + ' Message Content'"
              />
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24" :sm="8" :xl="6">
          <el-col :span="24">
            <el-form-item label="Group Receiver" prop="type_ids">
              <el-select v-model="form.type_ids" multiple style="width: 100%">
                <el-option v-for="item in groupReceiver" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type_ids.includes(2)" :span="24">
            <el-form-item label="Project" prop="project_ids">
              <el-select v-model="form.project_ids" multiple style="width: 100%">
                <el-option v-for="item in alertList" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type_ids.includes(3)" :span="24">
            <el-form-item label="User" prop="user_ids">
              <el-select v-model="form.user_ids" multiple style="width: 100%">
                <el-option v-for="item in alertList" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type_ids.includes(4)" :span="24">
            <el-form-item label="Role" prop="role_ids">
              <el-select v-model="form.role_ids" multiple style="width: 100%">
                <el-option v-for="item in alertList" :key="item.id" :label="item.label" :value="item.id">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Alert Level" prop="alert_level">
              <el-select v-model="form.alert_level" style="width: 100%">
                <el-option v-for="item in alertList" :key="item.id" :label="item.label" :value="item.id">
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
      <el-button class="buttonPrimary" :loading="isLoading" @click="onSend">Send</el-button>
    </span>
  </el-dialog>
</template>

<script>
const formTemplate = () => ({
  title: '',
  content: '',
  type_ids: [],
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
    }
  },
  data() {
    return {
      form: formTemplate(),
      showDialog: false,
      isLoading: false,
      rules: {
        title: [
          { required: true, message: this.$t('general.PleaseInput') + ' Title', trigger: 'blur' }
        ],
        content: [
          { required: true, message: this.$t('general.PleaseInput') + ' Message Content', content: 'blur' }
        ],
        type_ids: [
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
    groupReceiver() {
      return [
        { id: 2, label: 'Project' },
        { id: 3, label: 'User' },
        { id: 4, label: 'Role' },
        { id: 1, label: 'All' }
      ]
    }
  },
  watch: {
    'form.type_ids'() {
      if (this.form.type_ids.length > 1 && this.form.type_ids.includes(1)) {
        this.form.type_ids = [1]
      }
    }
  },
  methods: {
    onDialogClosed() {
      this.showDialog = false
      this.$nextTick(() => {
        this.$refs.createMessage.resetFields()
        this.form = formTemplate()
      })
    },
    onSend() {
      this.$refs.createMessage.validate(async (valid) => {
        if (!valid) return
      })
    }
  }
}
</script>
