<template>
  <div class="app-container">
    <el-card class="box-card" shadow="never" v-loading="pipelineLoading">
      <div slot="header" class="clearfix">
        <span style="font-size: 20px;font-weight: 500;">Pipeline #{{ pipeline.index }} Stages</span>
      </div>
      <div>
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <el-row :gutter="20">
              <el-col :span="6">Status</el-col>
              <el-col :span="18">
                 <el-tag v-if="pipeline.status === 'Failed'" type="danger" size="medium" effect="plain">
                    <i class="el-icon-circle-close" /> {{ pipeline.status }}
                  </el-tag>
                  <el-tag v-else-if="pipeline.status === 'Running'" size="medium" effect="plain">
                    <i class="el-icon-loading" /> {{ pipeline.status }}
                  </el-tag>
                  <el-tag v-else type="success" size="medium" effect="plain">
                    <i class="el-icon-circle-check" /> {{ pipeline.status }}
                  </el-tag>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="6">
            <el-row :gutter="20">
              <el-col :span="6">Stages</el-col>
              <el-col :span="18"><span>{{ pipeline.current_stages }}/{{ pipeline.total_stages }}</span></el-col>
            </el-row>
          </el-col>
          <el-col :span="6">
            <el-row :gutter="20">
              <el-col :span="6">Branch</el-col>
              <el-col :span="18">
                <el-col :span="18"><span>{{ pipeline.branch }}</span></el-col>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="6">
            <el-row :gutter="20">
              <el-col :span="6">Trigger</el-col>
              <el-col :span="18"><span>{{ pipeline.trigger }}</span></el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <el-row :gutter="20">
              <el-col :span="6">Commit</el-col>
              <el-col :span="18"><span>{{ pipeline.commit }}</span></el-col>
            </el-row>
          </el-col>
          <el-col :span="18">
            <el-row :gutter="20">
              <el-col :span="2">Message</el-col>
              <el-col :span="22"><span>{{ pipeline.commit_message }}</span></el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <div class="block" style="margin-top:10px">
      <el-timeline>
        <el-timeline-item
          v-loading="stagesListLoading"
          v-for="stg in stages"
          :key="stg.number"
          :timestamp="stg.run_at"
          placement="top">
          <el-card>
            <el-tag style="font-weight: 700;margin-bottom:10px">
              {{ stg.name }}
            </el-tag>
            <el-row :gutter="20" v-for="content in stg.content" :key="content">
              <el-col :span="4" style="font-weight: 500;">
                <div>{{content.run_at}}</div>
              </el-col>
              <el-col :span="20">
                <div >{{content.run_message}}</div>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script>
import { getTokenContent } from '@/utils/auth'
import { getStages, getPipeline } from '@/api/cicd'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      stages: null,
      stagesListLoading: true,
      pipeline: {},
      pipelineLoading: true
    }
  },
  mounted() {
    console.log(getTokenContent())
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // this.listLoading = true
      getStages(this.$route.params.pipeline_id).then(response => {
        this.stages = response.data
        this.stagesListLoading = false
      })
      getPipeline(this.$route.params.pipeline_id).then(response => {
        this.pipeline = response.data
        this.pipelineLoading = false
      })
    }
  }
}
</script>
