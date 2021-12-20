<template>
  <el-col
    v-loading="listLoading"
    class="inner"
    :style="{height:height}"
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
              <template v-if="commitLink">
                <a :href="commit.web_url" class="link" target="_blank">
                  <em class="ri-git-commit-line" />{{ firstEightCommitId(commit.commit_id) }}
                </a> : 
              </template>
              {{ commit.author_name }} @ {{ commit.pj_name }}
            </p>
          </el-card>
        </el-timeline-item>
      </transition-group>
    </template>
    <no-data v-else />
  </el-col>
</template>

<script>
import NoData from './widget/NoData'
export default {
  name: 'AdminCommitLog',
  components: { NoData },
  props: {
    data: {
      type: Function,
      default: () => []
    },
    commitLink: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: '250px'
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
      return function (commit) {
        return commit.slice(0, 8)
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.inner {
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

  .link {
    color: blue;
    &:hover {
      text-decoration: underline;
    }
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
