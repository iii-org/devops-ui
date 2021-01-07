<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getSecretList, deleteSecret } from '@/api/projectResource'

export default {
  name: 'SecretList',
  components: { ProjectListSelector, Pagination },
  data: () => ({
    secretList: [],
    listLoading: true,
    // dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.secretList.filter(data => {
        if (this.searchData === '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    projectSelectedId(projectId) {
      this.fetchData()
      this.listQuery.page = 1
      this.searchData = ''
    },
    searchData() {
      this.listQuery.page = 1
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.listLoading = true
      await getSecretList(this.projectSelectedId).then(res => {
        this.secretList = res.data.map(item => {
          return {
            name: item
          }
        })
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    // handleEdit(secretName) {
    //   this.dialogVisible = true
    // },
    async handleDelete(pId, secretName) {
      this.listLoading = true
      try {
        await deleteSecret(pId, secretName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    }
  }
}
</script>

<template>
  <div class="app-container">
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

    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column label="Name" align="center" prop="name" />
      <el-table-column :label="$t('general.Actions')" align="center" min-width="100">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="primary" @click="handleEdit(scope.row.name)">
              <i class="el-icon-edit" />
              {{ $t('general.Edit') }}
            </el-button> -->
          <el-popconfirm
            confirm-button-text="Delete"
            cancel-button-text="Cancel"
            icon="el-icon-info"
            icon-color="red"
            title="Are you sure?"
            @onConfirm="handleDelete(projectSelectedId, scope.row.name)"
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
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />
  </div>
</template>
