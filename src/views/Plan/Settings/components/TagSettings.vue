<template>
  <div class="app-container">
    <div class="flex justify-between mt-3">
      <div class="font-medium text-lg">{{ $t('ProjectSettings.Tag') }}</div>
      <div>
        <el-button
          class="buttonPrimary"
          :disabled="isAddingTag"
          @click="handleShowTagInput"
        >
          + {{ $t('ProjectSettings.AddCustomTag') }}
        </el-button>
      </div>
    </div>
    <el-divider />
    <div v-show="isAddingTag">
      <el-form ref="form" :model="form">
        <el-form-item>
          <span class="mr-3">{{ $t('ProjectSettings.TagName') }}</span>
          <el-input
            v-model="form.name"
            :placeholder="$t('ProjectSettings.TagInputPlaceholder')"
            type="text"
            class="mr-3"
          />
          <el-button class="buttonPrimary" @click="handleInputSave">
            {{ $t('general.Save') }}
          </el-button>
          <el-button class="buttonSecondaryReverse" @click="handleInputCancel">
            {{ $t('general.Cancel') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="listData"
      height="405"
      border
      fit
      @row-click="handleRowClick"
    >
      <el-table-column
        type="index"
        align="center"
        :label="$t('ProjectSettings.Index')"
        width="100"
      />
      <el-table-column align="center" :label="$t('ProjectSettings.Tag')">
        <template slot-scope="scope">
          <div v-show="scope.row.edit">
            <el-input v-model="scope.row.name" type="text" />
            <el-button class="buttonPrimary" @click.stop="handleTableInputConfirm(scope)">
              {{ $t('general.ok') }}
            </el-button>
            <el-button class="buttonSecondaryReverse" @click.stop="handleTableInputCancel(scope)">
              {{ $t('general.Cancel') }}
            </el-button>
          </div>
          <span v-show="!scope.row.edit">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')">
        <template slot-scope="scope">
          <el-tooltip
            placement="bottom"
            :content="$t('general.Delete')"
          >
            <em
              class="ri-delete-bin-2-line danger operate-button"
              @click.stop="handleTagDelete(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { BasicData } from '@/mixins'
import { getTagsByProject, addProjectTags, deleteProjectTags, updateProjectTags } from '@/api/projects'

export default {
  name: 'TagSettings',
  mixins: [BasicData],
  data() {
    return {
      isAddingTag: false,
      originData: [],
      form: {
        name: ''
      }
    }
  },
  methods: {
    async fetchData() {
      const res = await getTagsByProject(this.selectedProjectId)
      this.setOriginData(res.data.tags)
      return this.handleRowData(res.data.tags)
    },
    async addProjectTags(formData) {
      await addProjectTags(formData)
        .then(() => {
          this.updateTable()
          this.initForm()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async deleteProjectTags(tag_id) {
      await deleteProjectTags(tag_id)
        .then(() => {
          this.updateTable()
        })
        .catch(err => {
          console.error(err)
        })
    },
    async updateProjectTags(tag_id, data) {
      await updateProjectTags(tag_id, data)
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
    handleShowTagInput() {
      this.isAddingTag = true
    },
    handleInputSave() {
      if (!this.form.name) {
        this.$message({
          title: this.$t('general.Warning'),
          message: this.$t('ProjectSettings.TagInputPlaceholder'),
          type: 'warning'
        })
        return
      }
      const formData = this.getFormData()
      this.addProjectTags(formData)
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
      this.isAddingTag = false
    },
    initForm() {
      this.form = { name: '' }
    },
    handleRowClick(row, column) {
      if (column.label === '標籤' || column.label === 'Tag') {
        row.edit = true
      }
    },
    handleTableInputConfirm(scope) {
      const index = scope.$index
      const tag_id = scope.row.id
      const updatedData = this.getUpdatedData(scope.row)
      if (this.originData[index].name !== scope.row.name) this.updateProjectTags(tag_id, updatedData)
      scope.row.edit = false
    },
    handleTableInputCancel(scope) {
      const index = scope.$index
      scope.row.name = this.originData[index].name
      scope.row.edit = false
    },
    handleTagDelete(row) {
      const tag_id = row.id
      this.deleteProjectTags(tag_id)
    },
    showUpdateMessage() {
      this.$message({
        title: this.$t('general.Success'),
        message: this.$t('ProjectSettings.TagUpdateMessage'),
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
