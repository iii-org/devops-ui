<template>
  <div class="app-container">
    <div class="flex justify-between mt-3">
      <div class="font-medium text-lg">{{ $t('ProjectSettings.Label') }}</div>
      <div>
        <el-button type="primary" :disabled="isAddingLabel" @click="handleShowLabelInput">+ {{ $t('ProjectSettings.AddCustomLabel') }}</el-button>
      </div>
    </div>
    <el-divider />
    <div v-show="isAddingLabel">
      <el-form ref="form" :model="form">
        <el-form-item>
          <span class="mr-3">{{ $t('ProjectSettings.LabelName') }}</span>
          <el-input
            v-model="form.name"
            :placeholder="$t('ProjectSettings.LabelInputPlaceholder')"
            type="text"
            class="mr-3"
          />
          <el-button type="primary" @click="handleInputSave">{{ $t('general.Save') }}</el-button>
          <el-button @click="handleInputCancel">{{ $t('general.Cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="listData"
      border
      fit
      @row-click="handleRowClick"
    >
      <el-table-column type="index" align="center" :label="$t('ProjectSettings.Index')" width="100" />
      <el-table-column align="center" :label="$t('ProjectSettings.Label')">
        <template slot-scope="scope">
          <div v-show="scope.row.edit">
            <el-input v-model="scope.row.name" type="text" />
            <el-button type="success" @click.stop="handleTableInputConfirm(scope.row)">{{ $t('general.ok') }}</el-button>
            <el-button @click.stop="handleTableInputCancel(scope)">{{ $t('general.Cancel') }}</el-button>
          </div>
          <span v-show="!scope.row.edit">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')">
        <template slot-scope="scope">
          <el-button type="danger" @click.stop="handleLabelDelete(scope.row)">{{ $t('general.Delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { BasicData } from '@/newMixins'
import { getLabelsByProject, addProjectLabels, deleteProjectLabels, updateProjectLabels } from '@/api/projects'

export default {
  name: 'LabelSettings',
  mixins: [BasicData],
  data() {
    return {
      isAddingLabel: false,
      originData: [],
      form: {
        name: ''
      }
    }
  },
  methods: {
    async fetchData() {
      const res = await getLabelsByProject(this.selectedProjectId)
      this.setOriginData(res.data.tags)
      return this.handleRowData(res.data.tags)
    },
    async addProjectLabels(formData) {
      await addProjectLabels(formData)
        .then(() => {
          this.updateTable()
          this.handleInputCancel()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async deleteProjectLabels(tag_id) {
      await deleteProjectLabels(tag_id)
        .then(() => {
          this.updateTable()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async updateProjectLabels(tag_id, data) {
      await updateProjectLabels(tag_id, data)
        .then(() => {
          this.updateTable()
        })
        .catch(err => {
          console.error(err)
        })
    },
    updateTable() {
      this.loadData()
      this.showUpdateMessage()
    },
    setOriginData(data) {
      this.originData = JSON.parse(JSON.stringify(data))
    },
    handleRowData(tags) {
      tags.map(item => { item.edit = false })
      return tags
    },
    handleShowLabelInput() {
      this.isAddingLabel = true
    },
    handleInputSave() {
      if (!this.form.name) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('ProjectSettings.LabelInputPlaceholder'),
          type: 'warning'
        })
        return
      }
      const formData = this.getFormData()
      this.addProjectLabels(formData)
    },
    getFormData() {
      const name = this.form.name
      const project_id = this.selectedProjectId
      const formData = new FormData()
      formData.delete('name')
      formData.delete('project_id')
      formData.append('name', name)
      formData.append('project_id', project_id)
      return formData
    },
    getUpdatedData(row) {
      const name = row.name
      const formData = new FormData()
      formData.delete(name)
      formData.append('name', name)
      return formData
    },
    handleInputCancel() {
      this.initForm()
      this.isAddingLabel = false
    },
    initForm() {
      this.form = { name: '' }
    },
    handleRowClick(row, column, event) {
      if (column.label === '標籤' || column.label === 'Label') {
        row.edit = true
      }
    },
    handleTableInputConfirm(row) {
      const tag_id = row.id
      const updatedData = this.getUpdatedData(row)
      this.updateProjectLabels(tag_id, updatedData)
      row.edit = false
    },
    handleTableInputCancel(scope) {
      const index = scope.$index
      scope.row.name = this.originData[index].name
      scope.row.edit = false
    },
    handleLabelDelete(row) {
      const tag_id = row.id
      this.deleteProjectLabels(tag_id)
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('ProjectSettings.LabelUpdateMessage'),
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-input {
  width: 300px;
}

>>> .el-table__row > td:nth-child(2) {
  cursor: pointer;
  &:hover {
    background: #e4ecf7;
  }
}
</style>
