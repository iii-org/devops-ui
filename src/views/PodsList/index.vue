<script>
import { mapGetters } from 'vuex'
import ProjectListSelector from '@/components/ProjectListSelector'
import Pagination from '@/components/Pagination'
import { getPodList, deletePod, getPodLog } from '@/api/projectResource'
import PodLog from './components/PodLog'
import MixinElTable from '@/components/MixinElTable'

export default {
  name: 'PodsList',
  components: { ProjectListSelector, Pagination, PodLog },
  mixins: [MixinElTable],
  data: () => ({
    podList: [],
    listLoading: true,
    dialogVisible: false,
    listQuery: {
      page: 1,
      limit: 10
    },
    listTotal: 0,
    searchData: '',

    podLogDialogVisible: false,
    logData: '',
    focusPodName: '',
    focusContainerName: ''
  }),
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.podList.filter(data => {
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
      await getPodList(this.projectSelectedId).then(res => {
        this.podList = res.data
      })
      this.listLoading = false
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    // handleEdit(podName) {
    //   this.dialogVisible = true
    // },
    async handleDelete(pId, podName) {
      this.listLoading = true
      try {
        await deletePod(pId, podName)
        this.fetchData()
      } catch (error) {
        console.error(error)
      }
      this.listLoading = false
    },
    handleLogClick(pName, cName) {
      this.listLoading = true
      this.focusPodName = pName
      this.focusContainerName = cName
      getPodLog(this.projectSelectedId, pName, {
        container_name: cName
      })
        .then(res => {
          this.logData = res.data
          this.showPodLogDialog(true)
        })
        .catch(err => {
          console.error(err)
        })
        .then(() => {
          this.listLoading = false
        })
    },
    showPodLogDialog(visible) {
      this.podLogDialogVisible = visible
    },
    getStateType(state) {
      switch (state) {
        case 'pending':
          return 'slow'
        case 'running':
          return 'success'
        case 'succeeded':
          return 'success'
        case 'failed':
          return 'danger'
        case 'unknown':
          return 'warning'
        default:
          return 'slow'
      }
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
        :placeholder="$t('ProjectUsage.SearchPods')"
        style="width: 250px; float: right"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>
    <el-divider />
    <el-table v-loading="listLoading" :data="pagedData" :element-loading-text="$t('Loading')" border fit highlight-current-row height="100%" row-class-name="el-table-row">
      <el-table-column label="Pods" align="center" prop="name" min-width="200" show-overflow-tooltip />
      <el-table-column label="Created time" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.created_time | YMDHms }}
        </template>
      </el-table-column>
      <el-table-column label="Container" align="center" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-for="item in scope.row.containers" :key="item.name" class="my-3">
            {{ item.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Image" align="center" min-width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-for="item in scope.row.containers" :key="item.image" class="my-3">
            {{ item.image }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Restart" align="center" width="100">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.containers" :key="item.name + idx" class="my-3">
            {{ item.restart }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="State" align="center" width="140">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.containers" :key="item + idx" class="my-3">
            <el-tag v-if="item.state" :type="getStateType(item.state)" size="medium" effect="dark">{{ item.state }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="time" align="center" width="220">
        <template slot-scope="scope">
          <div v-for="(item, idx) in scope.row.containers" :key="item.time + idx" class="my-3">
            {{ item.time | YMDHms }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" width="180">
        <template slot-scope="scope">
          <div class="d-flex align-center">
            <div>
              <div v-for="container in scope.row.containers" :key="container.name" class="my-1">
                <el-button size="mini" type="primary" @click="handleLogClick(scope.row.name, container.name)">
                  log
                </el-button>
              </div>
            </div>

            <div>
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
            </div>
          </div>
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
    <pod-log
      :is-loading="listLoading"
      :dialog-visible.sync="podLogDialogVisible"
      :log-message="logData"
      :container-name="focusContainerName"
      @hideDialog="showPodLogDialog(false)"
      @refresh="handleLogClick(focusPodName, focusContainerName)"
    />
  </div>
</template>
