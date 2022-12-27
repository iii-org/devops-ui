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
        :class="Object.keys(projectTestObj).length === 0 ? '' : 'linkTextColor'"
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
            <span class="text-xl linkTextColor font-semibold capitalize">{{ result.Software }}</span>
            <em
              class="el-icon-right cursor-pointer"
              @click="handleClick(result.Software)"
            />
          </div>
          <el-tooltip
            placement="right"
            :open-delay="200"
            :content="getLocalTime(result.runAt)"
          >
            <span class="text-sm">
              <em class="mr-1 ri-time-line" />
              <span>{{ getRelativeTime(result.runAt) }}</span>
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
  zapFormatter,
  cmasFormatter,
  clairFormatter
} from './formatter'
import { getLocalTime, getRelativeTime } from '@/utils/handleTime'

export default {
  name: 'TestStatusCard',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    projectTestObj: {
      type: Object,
      default: () => ({})
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
        zap: zapFormatter,
        cmas: cmasFormatter,
        harbor: clairFormatter
      }
      keys.forEach((key) => {
        result.push(mapFormatter[key](testResult[key]))
      })
      return result
    },
    handleClick(target) {
      this.$router.push({ name: `${target.charAt(0).toUpperCase()}${target.slice(1)}` })
    },
    updateProjectTestList() {
      this.$emit('update')
    },
    getLocalTime(time) {
      return getLocalTime(time)
    },
    getRelativeTime(time) {
      return getRelativeTime(time)
    }
  }
}
</script>
