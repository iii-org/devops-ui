<template>
  <el-card
    v-loading="isLoading"
    :element-loading-text="$t('Loading')"
    class="mb-3"
    shadow="never"
  >
    <div class="flex justify-between h-8">
      <span class="flex items-center font-semibold">
        <em class="el-icon-circle-check mx-1" />
        {{ $t('Dashboard.TestStatus') }}
      </span>
      <el-button
        type="text"
        icon="el-icon-refresh"
        size="mini"
        :disabled="Object.keys(projectTestObj).length === 0"
        @click="updateProjectTestList()"
      >
        {{ $t('general.Refresh') }}
      </el-button>
    </div>
    <el-empty
      v-if="Object.keys(projectTestObj).length === 0"
      :description="$t('general.NoData')"
      :image-size="100"
    />
    <el-row
      v-else
      :gutter="10"
      class="mt-3"
    >
      <el-col
        v-for="result in testResultList"
        :key="result.Software"
        class="mb-2"
        :span="12"
      >
        <el-card>
          <div class="flex justify-between items-center mb-1">
            <span class="text-xl text-blue-600 font-semibold capitalize">{{ result.Software }}</span>
            <em
              class="el-icon-right cursor-pointer"
              @click="handleClick(result.Software)"
            />
          </div>
          <el-tooltip
            placement="right"
            :open-delay="200"
            :content="result.runAt | UTCtoLocalTime"
          >
            <span class="text-sm">
              <em class="mr-1 ri-time-line" />
              <span>{{ result.runAt | relativeTime }}</span>
            </span>
          </el-tooltip>
          <div class="mt-3">
            <span
              v-if="Object.keys(result.informationText).length === 0"
              class="text-gray-400"
            >
              {{ $t('general.NoData') }}
            </span>
            <div
              v-for="item in result.informationText"
              :key="item.status"
              class="flex justify-between mb-1"
            >
              <span class="text-sm">{{ item.status }}</span>
              <span class="text-title">{{ item.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import {
  postmanFormatter,
  checkmarxFormatter,
  webinspectFormatter,
  sonarqubeFormatter,
  sideexFormatter,
  zapFormatter
} from './formatter'

export default {
  name: 'TestStatusCard',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    projectTestObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      testResultList: []
    }
  },
  watch: {
    projectTestObj(val) {
      this.testResultList = this.handleTestRes(val)
    },
    '$i18n.locale'() {
      this.testResultList = this.handleTestRes(this.projectTestObj)
    }
  },
  methods: {
    handleTestRes(testResult) {
      const result = []
      const keys = Object.keys(testResult)
      const mapFormatter = {
        postman: postmanFormatter,
        checkmarx: checkmarxFormatter,
        webinspect: webinspectFormatter,
        sonarqube: sonarqubeFormatter,
        sideex: sideexFormatter,
        zap: zapFormatter
      }
      keys.forEach((key) => {
        result.push(mapFormatter[key](testResult[key]))
      })
      return result
    },
    handleClick(target) {
      this.$router.push({ name: target })
    },
    updateProjectTestList() {
      this.$emit('update')
    }
  }
}
</script>
