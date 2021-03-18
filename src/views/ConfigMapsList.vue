<script>
import { deleteConfigmap, getConfigmapList } from '@/api/kubernetes'
import MixinElTableWithAProject from '@/components/MixinElTableWithAProject'

export default {
  name: 'ConfigMapsList',
  mixins: [MixinElTableWithAProject],
  data: () => ({
    editDialogVisible: false,
    configMapName: '',
    configMapData: []
  }),
  methods: {
    async fetchData() {
      const res = await getConfigmapList(this.selectedProjectId)
      return res.data.map(configMap => ({
        name: configMap.name,
        keys: Object.keys(configMap.data),
        configMaps: Object.entries(configMap.data).map(item => ({
          key: item[0],
          value: item[1]
        }))
      }))
    },
    async handleDelete(pId, configMapName) {
      this.listLoading = true
      try {
        await deleteConfigmap(pId, configMapName)
        await this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    showEditDialog(configMapName, configMaps) {
      this.editDialogVisible = true
      this.configMapName = configMapName
      this.configMapData = configMaps.map(item => item)
    },
    closeEditDialog() {
      this.editDialogVisible = false
    }
  }
}
</script>

<template>
  <div class="table-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table
      v-loading="listLoading"
      :data="pagedData"
      :element-loading-text="$t('Loading')"
      border
      fit
      highlight-current-row
      height="100%"
    >
      <el-table-column :label="$t('general.Name')" header-align="center" prop="name">
        <template slot-scope="scope">
          <div class="font-weight-bold">{{ scope.row.name }}</div>
          <div class="text-caption">
            Keys：<span v-for="(key, keyIdx) in scope.row.keys" :key="keyIdx">
              {{ key }}
              <span v-if="keyIdx !== scope.row.keys.length - 1">/</span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="240">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-tickets"
            @click="showEditDialog(scope.row.name, scope.row.configMaps)"
          >
            {{ $t('general.Detail') }}
          </el-button>
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(selectedProjectId, scope.row.name)"
          >
            <el-button slot="reference" size="mini" type="danger">
              <i class="el-icon-delete" />
              {{ $t('general.Delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="filteredData.length"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog
      :title="`Config Map ${$t('general.Detail')} `"
      :visible.sync="editDialogVisible"
      width="80%"
      @close="closeEditDialog"
    >
      <div class="text-subtitle-1 font-weight-bold">Config Map Name</div>
      <div>{{ configMapName }}</div>
      <el-row
        v-for="(configMap, configMapIdx) in configMapData"
        :key="configMap + configMapIdx"
        :gutter="12"
        type="flex"
        class="mt-3"
      >
        <el-col :span="6">
          <div class="text-subtitle-1 font-weight-bold">key {{ configMapIdx + 1 }}</div>
          <div>{{ configMapData[configMapIdx].key }}</div>
        </el-col>
        <el-col :span="18">
          <div class="text-subtitle-1 font-weight-bold">value {{ configMapIdx + 1 }}</div>
          <div>{{ configMapData[configMapIdx].value }}</div>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeEditDialog">
          {{ $t('general.Close') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
