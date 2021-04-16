<template>
  <el-row v-loading="listLoading">
    <el-row class="circle hidden-sm-and-down" type="flex" justify="center" align="middle">
      <template v-if="listData.length>0">
        <el-col v-for="(item,idx) in listData" :key="idx" :xs="24" :sm="24" :md="8">
          <CircleDashboard :count="item.count" :item="$t('Dashboard.ADMIN.Overview.'+item.item)" class="pointer" :class="'circle-'+item.class"
                           @click.native="onShowDetail(item.database)"
          />
        </el-col>
      </template>
      <no-data v-else />
    </el-row>
    <div class="table hidden-md-and-up">
      <el-row v-for="(item,idx) in listData" :key="idx" :class="'table-'+item.class" align="bottom" type="flex"
              @click="onShowDetail(item.database)"
      >
        <el-col :span="12" class="text-right count">{{ item.count }}</el-col>
        <el-col :span="12">{{ item.item }}</el-col>
      </el-row>
    </div>
    <el-dialog width="80%" :visible.sync="detailDialog" :title="$t('Dashboard.ADMIN.ProjectList.NAME')">
      <admin-project-list ref="projectList" :data="getProjectListDetailData" :in-dialog="true" />
    </el-dialog>
  </el-row>
</template>

<script>
import CircleDashboard from './widget/CircleDashboard'
import AdminProjectList from './AdminProjectList'
import { getProjectListDetail } from '@/api/dashboard'
import NoData from './widget/NoData'

export default {
  name: 'AdminOverview',
  components: {
    NoData,
    AdminProjectList,
    CircleDashboard
  },
  props: {
    data: {
      type: Function,
      default: () => ([])
    }
  },
  data() {
    return {
      listLoading: false,
      listData: [],
      detailDialog: false
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.data()
      this.listLoading = false
    },
    getProjectListDetailData() {
      return getProjectListDetail()
        .then((res) => (Promise.resolve(res.data)))
    },
    onShowDetail(value) {
      this.detailDialog = true
      this.$nextTick(() => {
        this.$refs['projectList'].searchStatus = value
      })
    },
    overviewTableCellClassName({ column }) {
      if (column.property === 'count') {
        return 'count'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.circle {
  > > > .circle-primary {
    border-color: $menuActiveText;
    color: $menuActiveText;
  }

  > > > .circle-danger {
    border-color: $danger;
    color: $danger;
  }

  > > > .circle-info {
    border-color: $info-4;
    color: $info-4;
  }
}

> > > .table {
  font-size: 1.5em;

  .count {
    font-size: 2em;
    padding-right: 0.25em;
    text-align: right;
    font-weight: bolder;
  }

  .el-row {
    border-width: 5px;
    border-style: solid;
  }

  .table-primary {
    border-color: $menuActiveText;
    color: $menuActiveText;
  }

  .table-danger {
    border-color: $danger;
    color: $danger;
  }

  .table-info {
    border-color: $info-4;
    color: $info-4;
  }
}

.pointer {
  cursor: pointer;
}
</style>
