<template>
  <el-dialog
    title="Test Detail"
    :visible="dialogVisible"
    width="50%"
    @close="handleClose"
  >
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in activities"
      :key="index"
      :timestamp="activity.timestamp"
      placement="top"
    >
      <el-card>
        <h4>{{ activity.name }}</h4>
        <p>{{ activity.content }}</p>
      </el-card>
    </el-timeline-item>
  </el-timeline>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">Close</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activities: [{
          name: 'Sonarqube',
          content: 'Started by GitLab push by Administrator\
                    Running as SYSTEM\
                    Building in workspace /var/jenkins_home/workspace/iii-DevOps-testing-on-Kubernetes\
                    using credential 259a24b0-5d9b-4dbc-a160-eb2f79301014',
          timestamp: '2018-04-15'
        }, {
          name: 'Unit Test',
          content: '[iii-DevOps-testing-on-Kubernetes] $ /bin/sh -xe /tmp/jenkins8594639906146602068.sh\
                    + id -u\
                    + id -g\
                    + docker run -e',
          timestamp: '2018-04-13'
        }]
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      
    },
    handleClose() {
      this.$emit('test-detail-visible', false)
    }
  }
}
</script>
<style lang="scss">
  .el-upload-dragger {
    height: 50px;
  }
</style>