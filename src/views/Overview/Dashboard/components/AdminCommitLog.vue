<template>
  <el-col
    v-loading="listLoading"
    class="inner"
  >
    <template v-if="listData.length>0">
      <transition-group
        name="slide-fade"
        tag="el-timeline"
      >
        <el-timeline-item
          v-for="commit in listData"
          :key="commit.id"
          :timestamp="commit.commit_time"
          placement="top"
        >
          <el-card class="timeline-item-card">
            <h4>{{ commit.commit_title }}</h4>
            <p v-if="compareCommitContent(commit)">{{ commit.commit_message }}</p>
            <p class="author">
              {{ commit.author_name }} @ {{ commit.pj_name }}
            </p>
          </el-card>
        </el-timeline-item>
      </transition-group>
    </template>
    <NoData v-else />
  </el-col>
</template>

<script>
import NoData from './widget/NoData'

export default {
  name: 'AdminCommitLog',
  components: { NoData },
  props: {
    getData: {
      type: Function,
      default: () => []
    }
  },
  data() {
    return {
      listData: [],
      detailDialog: false,
      listLoading: false
    }
  },
  computed: {
    compareCommitContent() {
      return function (commit) {
        return commit.commit_message.trim() !== commit.commit_title
      }
    },
    firstEightCommitId() {
      return function (commitId) {
        return commitId.slice(0, 8)
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.listLoading = true
      this.listData = await this.getData()
      this.listLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.inner {
  height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}

.timeline-item-card {
  >>> .el-card__body {
    padding: 10px;
  }

  .author {
    margin-bottom: 0;
  }
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
