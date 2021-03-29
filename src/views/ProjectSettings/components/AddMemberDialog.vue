<template>
  <el-dialog
    :title="$t(`Member.AddMember`)"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="50%"
    @closed="onDialogClosed"
  >
    <el-form ref="memberForm" :model="form" :rules="formRules" label-position="top">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item :label="$t('general.Name')" prop="id">
            <el-select
              v-model="form.id"
              :placeholder="$t('Member.SelectMember')"
              :style="{ width: '100%' }"
              filterable
              :filter-method="filterMethod"
              @visible-change="handleVisibleChange"
            >
              <el-option
                v-for="user in filteredUserList"
                :key="user.id"
                :label="user.name"
                :value="user.id"
                class="d-flex justify-space-between align-center"
              >
                <span>{{ user.name }}</span>
                <span :style="{ color: '#8492a6', 'font-size': '13px' }">{{ user.login }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('Member.Role')" prop="role_name">
            <el-input v-model="focusRoleName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
      <el-button type="primary" :loading="btnConfirmLoading" @click="handleAddConfirm">
        {{ $t('general.Confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addProjectMember, getNotInProject } from '@/api/projects'
import { mapGetters } from 'vuex'
import i18n from '@/lang'

const formTemplate = {
  id: ''
}

export default {
  name: 'AddMemberDialog',
  data: () => ({
    dialogVisible: false,
    form: formTemplate,
    formRules: {
      id: [{ required: true, message: i18n.t('RuleMsg.PleaseInput') + i18n.t('RuleMsg.Member'), trigger: 'change' }]
    },
    assignableUserList: [],
    isLoading: false,
    btnConfirmLoading: false,
    selectorQuery: '',
    focusRoleName: ''
  }),
  computed: {
    ...mapGetters(['selectedProject']),
    selectedProjectId() {
      return this.selectedProject.id
    },
    filteredUserList() {
      return this.assignableUserList.filter(user => {
        const keyword = this.selectorQuery
        return keyword === '' || user.name.includes(keyword) || user.login.includes(keyword)
      })
    }
  },
  watch: {
    'form.id'(val) {
      if (val) {
        const idx = this.assignableUserList.findIndex(item => item.id === val)
        this.focusRoleName = this.assignableUserList[idx].role_name
      }
    },
    selectedProjectId() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const res = await getNotInProject(this.selectedProjectId)
        this.assignableUserList = res.data.user_list.map(user => ({
          id: user.id,
          name: user.name,
          login: user.login,
          role_name: user.role_name
        }))
      } catch (error) {
        console.error(error)
      }
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['memberForm'].resetFields()
        this.form = formTemplate
        this.focusRoleName = ''
      })
    },
    filterMethod(selectorQuery) {
      this.selectorQuery = selectorQuery
    },
    handleVisibleChange(status) {
      if (status) this.selectorQuery = ''
    },
    async handleAddConfirm() {
      this.$refs.memberForm.validate(async valid => {
        if (valid) {
          this.btnConfirmLoading = true
          await addProjectMember(this.selectedProjectId, { user_id: this.form.id })
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Added'),
            type: 'success'
          })
          this.fetchData()
          this.$emit('update')
          this.btnConfirmLoading = false
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>
