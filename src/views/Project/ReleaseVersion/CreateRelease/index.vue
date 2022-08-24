<template>
  <div>
    <el-card>
      <el-steps :active="stepActive" finish-status="success" align-center>
        <el-step :title="$t('Release.IssueVersion')">
          <template v-if="stepActive === 0" slot="description">
            <span>
              {{ $t('Release.IssueVersionWarning1') }}
              <el-button type="text" size="mini" @click="$emit('toggleShowVersions')">
                {{ $t('Version.Manage') }}
              </el-button>
              {{ $t('Release.IssueVersionWarning2') }}
            </span>
          </template>
        </el-step>
        <el-step :title="$t('Release.ImageVersion')">
          <template v-if="stepActive === 1" slot="description">
            <span>
              {{ $t('Release.ImageVersionWarning') }}
            </span>
          </template>
        </el-step>
        <el-step :title="$t('Release.ReleaseVersion')">
          <template v-if="stepActive === 2" slot="description">
            <span>
              {{ $t('Release.ReleaseVersionWarning') }}
            </span>
          </template>
        </el-step>
      </el-steps>
      <section class="flex justify-center" style="margin-top: 40px;">
        <IssueVersion
          v-if="stepActive === 0"
          :release-data="releaseData"
          :is-show-versions="isShowVersions"
          @onNext="next"
          @initReleaseData="initData"
        />
        <ImageVersion
          v-else-if="stepActive === 1"
          :release-data="releaseData"
          :update-data="updateData"
          @onNext="next"
          @onBack="back"
        />
        <PackageVersion
          v-else-if="stepActive === 2"
          :release-data="releaseData"
          :update-data="updateData"
          @onBack="back"
          @initState="initState"
        />
      </section>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

/**
 * @summary for release data
 */
const releaseData = () => ({
  branch: '',
  commit: '',
  extra_image_path: '', // only for extra image path
  forced: true,
  main: '', // main version
  note: '',
  versions: []
})

/**
 * @summary for those data which is not used by releasing
 */
const updateData = () => ({
  issues: [],
  projectVersions: [],
  image: ''
})

export default {
  name: 'CreateRelease',
  components: {
    IssueVersion: () => import('./IssueVersion/index'),
    ImageVersion: () => import('./ImageVersion/index'),
    PackageVersion: () => import('./PackageVersion')
  },
  props: {
    isShowVersions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      stepActive: 0,
      releaseData: releaseData(),
      updateData: updateData()
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  watch: {
    selectedProjectId() {
      this.stepActive = 0
    }
  },
  methods: {
    setData(releaseData, updateData) {
      this.handleSetData(releaseData, 'releaseData')
      if (Object.keys(updateData).length > 0) this.handleSetData(updateData, 'updateData')
    },
    initData() {
      this.setData(releaseData(), updateData())
    },
    next(releaseData, updateData) {
      this.setData(releaseData, updateData)
      this.stepActive += 1
    },
    back(releaseData, updateData) {
      this.setData(releaseData, updateData)
      this.stepActive -= 1
    },
    initState() {
      this.$emit('initState')
    },
    handleSetData(data, key) {
      Object.keys(data).forEach((item) => {
        this[key][item] = data[item]
      })
    }
  }
}
</script>
