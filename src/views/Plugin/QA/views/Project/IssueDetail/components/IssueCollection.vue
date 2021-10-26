<template>
  <el-row class="el-upload-list">
    <div class="text-subtitle-2 mb-2">測試檔案</div>
    <el-row v-for="(file,idx) in issueTest" :key="idx" class="el-upload-list__item is-ready">
      <el-col :span="20">
        <span :ref="'file'+idx" class="el-upload-list__item-name">
          <i class="el-icon-document" />{{ file.software_name }} - {{ file.name }} ({{ file.file_name }})
        </span>
        <el-tag v-if="file.edit" type="primary">異動未儲存</el-tag>
      </el-col>
      <el-col :span="4" class="text-right">
        <el-button :type="isButtonDisabled ? 'info' : 'danger'" :disabled="isButtonDisabled" size="mini" icon="el-icon-remove" @click="deleteIssueFile(file)">
          移除關聯
        </el-button>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>

export default {
  name: 'IssueCollection',
  props: {
    issueTest: {
      type: Array,
      default: () => []
    },
    isButtonDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false
    }
  },
  watch: {
    issueTest: {
      deep: true,
      handler() {
        this.$emit('update', this.issueTest)
      }
    }
  },
  methods: {
    deleteIssueFile(row) {
      this.removeFile(row.id)
    },
    removeFile(id) {
      const idx = this.issueTest.findIndex(item => item.id === id)
      this.issueTest.splice(idx, 1)
    }
  }
}
</script>
