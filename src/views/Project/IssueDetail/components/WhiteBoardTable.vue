<template>
  <div>
    <el-table
      :data="excalidrawData"
      fit
    >
      <el-table-column
        type="index"
        align="center"
        :label="$t('general.Index')"
        width="100"
      />
      <el-table-column
        align="center"
        :label="$t('Excalidraw.Name')"
        prop="name"
      >
        <template slot-scope="scope">
          <el-link
            slot="reference"
            type="primary"
            style="font-size: 16px"
            @click="handleEdit(scope.row)"
          >
            {{ scope.row.name }}
          </el-link>
          <el-link
            size="small"
            :underline="false"
            @click="handleEdit(scope.row)"
          >
            <em class="ri-external-link-line" />
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('Issue.project')"
        prop="project.display"
      />
      <el-table-column
        align="center"
        :label="$t('general.Creator')"
        prop="operator.name"
      />
    </el-table>
    <EditBoardDialog
      ref="EditBoardDialog"
      @update="fetchData"
    />
  </div>
</template>

<script>
import EditBoardDialog from '@/views/WhiteBoard/components/EditBoardDialog'

export default {
  name: 'WhiteBoardTable',
  components: { EditBoardDialog },
  props: {
    excalidrawData: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '250px'
    }
  },
  data() {
    return {}
  },
  methods: {
    async fetchData() {
      this.$emit('update')
    },
    handleEdit(row) {
      this.$refs.EditBoardDialog.isCollapse = ['2']
      this.$refs.EditBoardDialog.row = row
      this.$nextTick(() => {
        this.$refs.EditBoardDialog.dialogVisible = true
      })
    }
  }
}
</script>
