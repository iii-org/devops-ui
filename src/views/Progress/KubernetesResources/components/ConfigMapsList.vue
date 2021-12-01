<template>
  <el-row class="app-container">
    <el-col>
      <ProjectListSelector>
        <el-input
          v-model="keyword"
          :placeholder="$t('general.SearchName')"
          prefix-icon="el-icon-search"
          style="width: 250px"
        />
      </ProjectListSelector>
      <el-divider />
      <el-table
        v-loading="listLoading"
        :data="pagedData"
        :element-loading-text="$t('Loading')"
        height="calc(100vh - 300px)"
        fit
      >
        <el-table-column :label="$t('general.Name')" header-align="center" prop="name">
          <template slot-scope="scope">
            <div class="font-bold">{{ scope.row.name }}</div>
            <div class="text-xs">
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
              :disabled="scope.row.keys === '-'"
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
              @confirm="handleDelete(selectedProjectId, scope.row.name)"
            >
              <el-button slot="reference" size="mini" type="danger">
                <em class="el-icon-delete" />
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
        <div class="text-title">Config Map Name</div>
        <div>{{ configMapName }}</div>
        <el-row
          v-for="(configMap, configMapIdx) in configMapData"
          :key="configMap + configMapIdx"
          :gutter="12"
          type="flex"
          class="mt-3"
        >
          <el-col :span="6">
            <div class="text-title">key {{ configMapIdx + 1 }}</div>
            <div>{{ configMapData[configMapIdx].key }}</div>
          </el-col>
          <el-col :span="18">
            <div class="text-title">value {{ configMapIdx + 1 }}</div>
            <div>{{ configMapData[configMapIdx].value }}</div>
          </el-col>
        </el-row>

        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="closeEditDialog">
            {{ $t('general.Close') }}
          </el-button>
        </span>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import { deleteConfigmap, getConfigmapList } from '@/api/kubernetes'
import { BasicData, SearchBar, Pagination, Table, ProjectSelector } from '@/newMixins'

export default {
  name: 'ConfigMapsList',
  mixins: [BasicData, SearchBar, Pagination, Table, ProjectSelector],
  data() {
    return {
      editDialogVisible: false,
      configMapName: '',
      configMapData: []
    }
  },
  methods: {
    async fetchData() {
      const res = await getConfigmapList(this.selectedProjectId)
      return res.data.map(configMap => {
        if (configMap.data) {
          return {
            name: configMap.name,
            keys: Object.keys(configMap.data),
            configMaps: Object.entries(configMap.data).map(item => ({
              key: item[0],
              value: item[1]
            }))
          }
        } else {
          return {
            name: configMap.name,
            keys: '-'
          }
        }
      })
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
