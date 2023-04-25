<template>
  <div>
    <el-button
      ref="btn"
      type="text"
      icon="el-icon-close"
      style="margin-right: 10px;"
      @click="$emit('close')"
    />
    <el-tabs ref="tabs" type="border-card">
      <el-tab-pane :label="$t('general.AddNewSubIssue')">
        <QuickAddIssue
          :project-id="parentData.project.id"
          :visible="true"
          :parent="parentData"
          :is-table="true"
          :show-close="false"
          :sub-issue="true"
          @close="$emit('close')"
          @update="$emit('update')"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('general.AddExistingIssue')">
        <el-row>
          <el-col :span="20">
            <SettingRelationIssue
              :key="reloadSettingRelation"
              ref="settingRelationIssue"
              :row.sync="parentData"
              :target="'Children'"
              :show-parent="false"
              @loading="isLoading = $event"
            />
          </el-col>
          <el-col :span="4">
            <el-button
              type="success"
              :loading="isLoading"
              style="padding: 9px 8px; margin-top: 44px; margin-left: 10px;"
              icon="el-icon-check"
              size="small"
              @click="onSaveCheckRelationIssue"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import QuickAddIssue from '@/views/MyWork/components/QuickAddIssue'
import SettingRelationIssue from '@/views/Project/IssueList/components/SettingRelationIssue'
import { updateIssue } from '@/api/issue'

export default {
  name: 'AddSubIssue',
  components: { QuickAddIssue, SettingRelationIssue },
  props: {
    parentData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isLoading: false,
      reloadSettingRelation: 0
    }
  },
  mounted() {
    const scrollBar = this.$refs.tabs.$el.querySelector('.el-tabs__nav-scroll')
    scrollBar.appendChild(this.$refs.btn.$el)
  },
  methods: {
    onSaveCheckRelationIssue() {
      this.$refs.settingRelationIssue.$refs.issueForm.validate((valid) => {
        if (valid) {
          this.onSaveRelationIssue()
        }
      })
    },
    getFormData(data) {
      const formData = new FormData()
      Object.keys(data).forEach((item) => {
        formData.append(item, data[item])
      })
      return formData
    },
    async onSaveRelationIssue() {
      this.isLoading = true
      try {
        const getSettingRelationIssue = this.$refs['settingRelationIssue']
        const updateApi = []
        if (getSettingRelationIssue.target === 'Parent') {
          const formData = this.getFormData({ parent_id: getSettingRelationIssue.form.parent_id })
          updateApi.push(
            updateIssue(getSettingRelationIssue.row.id, formData)
          )
        } else if (getSettingRelationIssue.target === 'Children') {
          const appendFormData = this.getFormData({ parent_id: getSettingRelationIssue.row.id })
          const removeFormData = this.getFormData({ parent_id: '' })
          getSettingRelationIssue.children['append'].forEach((item) => {
            updateApi.push(updateIssue(item, appendFormData))
          })
          getSettingRelationIssue.children['remove'].forEach((item) => {
            updateApi.push(updateIssue(item, removeFormData))
          })
        }
        await Promise.all(updateApi)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
        this.$emit('update')
      } catch (e) {
        console.error(e)
      }
      this.reloadSettingRelation++
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-tabs__nav-scroll {
  display: flex;
  justify-content: space-between;
}
</style>
