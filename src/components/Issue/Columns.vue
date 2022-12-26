<template>
  <el-popover
    placement="bottom"
    trigger="click"
  >
    <el-form class="display-column">
      <el-form-item
        v-for="item in columnsOptions"
        :key="item.field"
      >
        <el-checkbox
          :label="item.display"
          :value="getCheckColumnValue(item.field)"
          @change="onCheckColumnChange(item.field)"
        >
          {{ item.display }}
        </el-checkbox>
      </el-form-item>
    </el-form>
    <el-button
      slot="reference"
      icon="el-icon-s-operation"
      type="text"
      class="headerTextColor"
    >
      {{ $t('Milestone.Display') }}
      <em class="el-icon-arrow-down el-icon--right" />
    </el-button>
  </el-popover>
</template>

<script>
import { mapGetters } from 'vuex'
import { putIssueFieldDisplay } from '@/api/issue'
export default {
  name: 'Columns',
  props: {
    columnsOptions: {
      type: Array,
      default: () => []
    },
    displayFields: {
      type: Array,
      default: () => []
    },
    filterValue: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'issue_list'
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    getCheckColumnValue(value) {
      if (this.displayFields.length <= 0) return true
      return this.displayFields.includes(value)
    },
    async onCheckColumnChange(value) {
      let fields = this.displayFields
      if (fields.includes(value)) {
        const columnIndex = fields.findIndex(item => item === value)
        fields.splice(columnIndex, 1)
      } else {
        fields.push(value)
      }
      if (fields.length <= 0) {
        fields = this.columnsOptions.map(item => item.field)
      }
      const res = await putIssueFieldDisplay({
        project_id: this.filterValue.project || this.selectedProjectId,
        display_fields: fields,
        type: this.type
      })
      this.$emit('update:displayFields', res.data)
      // this.displayFields = res.data
      // this.$nextTick(() => { this.$refs['issueList'].doLayout() })
    }
  }
}
</script>

<style lang="scss" scoped>
.display-column {
  .el-form-item {
    margin: 0;
  }
}
</style>
