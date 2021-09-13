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
            <el-button @click.stop="handleTableInputCancel(scope.row)">{{ $t('general.Cancel') }}</el-button>
          </div>
          <span v-show="!scope.row.edit">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('general.Actions')">
        <template slot-scope="scope">
          <el-button type="danger" @click.stop="handleLabelDelete(scope)">{{ $t('general.Delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { BasicData } from '@/newMixins'
import { getTagsByProject } from '@/api/projects'

export default {
  name: 'LabelSettings',
  mixins: [BasicData],
  data() {
    return {
      isAddingLabel: false,
      labelName: '',
      originColumnData: {},
      form: {
        id: '',
        name: '',
        edit: false
      }
    }
  },
  methods: {
    async fetchData() {
      const res = await getTagsByProject(this.selectedProjectId)
      return this.handleRowData(res.data.tags)
    },
    handleRowData(tags) {
      tags.map(item => {
        item.edit = false
      })
      return tags
    },
    handleShowLabelInput() {
      const index = this.listData.length
      this.form.id = index
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
      this.listData.push(this.form)
      this.handleInputCancel()
    },
    handleInputCancel() {
      this.initForm()
      this.isAddingLabel = false
    },
    initForm() {
      this.form = { id: '', name: '', edit: false }
    },
    handleRowClick(row, column, event) {
      this.originColumnData = JSON.parse(JSON.stringify(row))
      row.edit = true
    },
    handleTableInputConfirm(row) {
      row.edit = false
    },
    handleTableInputCancel(row) {
      row.name = this.originColumnData.name
      row.edit = false
    },
    handleLabelDelete(scope) {
      console.log(scope.$index)
      this.listData.splice(scope.$index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-input {
  width: 300px;
}
</style>
