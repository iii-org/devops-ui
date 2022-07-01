<template>
  <div>
    <ToolBar>
      <span slot="toolName">Postman</span>
      <el-button slot="link" type="text" icon="el-icon-tickets" :class="!disabled ? 'linkTextColor' : ''" :disabled="disabled" @click="openPostman">
        {{ $t('TestReport.DetailReport') }}
      </el-button>
    </ToolBar>
    <el-table
      ref="table_postman"
      v-loading="listLoading"
      class="mb-10"
      :element-loading-text="$t('Loading')"
      :data="postman"
      border
      fit
    >
      <el-table-column align="center" :label="$t('DevOps.Tools')">Postman</el-table-column>
      <el-table-column align="center" :label="$t('Postman.TestPass')" prop="success" min-width="100">
        <template slot-scope="scope">
          <span v-if="scope.row && typeof(scope.row.failure) === 'number'">{{ scope.row.success }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('Postman.TestFail')" prop="failure" min-width="100">
        <template slot-scope="scope">
          <span v-if="scope.row && typeof(scope.row.failure) === 'number'">{{ scope.row.failure }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import ToolBar from '@/views/Progress/Pipelines/components/ToolBar'

export default {
  name: 'Postman',
  components: { ToolBar },
  props: {
    postman: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    disabled() {
      return this.postman[0] ? Object.keys(this.postman[0]).length === 0 : true
    }
  },
  methods: {
    openPostman() {
      const { id } = this.postman[0]
      const routeUrl = this.$router.resolve({
        name: 'PostmanTestCase', params: { id }
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
