<template>
  <div>
    <el-table
      v-if="excalidrawData.length !== 0"
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
            @click="handleEdit(scope.row,true)"
          >
            {{ scope.row.name }}
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
    <NoData v-else />
    <EditBoardDialog
      ref="EditBoardDialog"
      @update="fetchData"
    />
  </div>
</template>

<script>
import EditBoardDialog from '@/views/WhiteBoard/components/EditBoardDialog'
import NoData from './widget/NoData'

export default {
  name: 'WhiteBoardTable',
  components: { EditBoardDialog, NoData },
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
      this.$refs.EditBoardDialog.isCollapse = ['1']
      this.$refs.EditBoardDialog.row = row
      this.$nextTick(() => {
        this.$refs.EditBoardDialog.dialogVisible = true
      })
    }
  }
}
</script>
