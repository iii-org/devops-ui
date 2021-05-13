<template>
  <el-dialog :visible="dialogVisible" width="95%" top="10vh" @close="handleClose">
    <template slot="title">
      <span class="font-weight-bold text-h6 ml-4">
        {{ $t('ProgressPipelines.TestDetail') }}
      </span>
    </template>
    <el-tabs v-model="activeStage" tab-position="left">
      <el-tab-pane
        v-for="(stage, idx) in stages"
        :key="idx"
        :name="`${idx + 1} ${stage.name}`"
        :disabled="!stage.state"
      >
        <div slot="label" class="d-flex justify-space-between align-center">
          <span class="text-right">{{ idx + 1 }} {{ stage.name }}</span>
          <el-tag
            v-if="stage.state"
            class="el-tag ml-2"
            :type="getStateTagType(stage.state)"
            size="mini"
            :effect="getStateTagEffect(stage.state)"
          >
            {{ stage.state }}
          </el-tag>
        </div>
        <el-card
          :body-style="{
            color: '#000',
            background: '#DADADA',
            lineHeight: 2
          }"
        >
          <div class="text-h6 mb-3">
            <i class="el-icon-tickets mr-2" />
            <span class="mr-3">{{ stage.name }}</span>
            <i v-if="stage.isLoading" class="el-icon-loading font-weight-bold" style="color: #F89F03" />
            <i v-else class="el-icon-check font-weight-bold" style="color: #72C040" />
          </div>
          <el-card
            v-for="(step, stepIdx) in stage.steps"
            :key="stepIdx"
            class="mb-2"
            :body-style="{
              color: '#fff',
              background: '#222',
              lineHeight: 1,
              fontSize: '14px',
              height: '45vh',
              overflow: 'auto'
            }"
            shadow="never"
          >
            <pre>{{ step.message }}</pre>
          </el-card>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer">
      <el-button @click="handleClose">{{ $t('general.Close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TestDetail',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    theData: {
      type: Array,
      default: () => []
    },
    pipelinesExecRun: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      stages: [],
      activeStage: '',
      sid: ''
    }
  },
  computed: {
    ...mapGetters(['selectedProject'])
  },
  watch: {
    theData: {
      handler(val) {
        this.stages = val.map(item => item)
        this.activeStage = `1 ${this.stages[0].name}`
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('test-detail-visible', false)
    },
    getStateTagType(state) {
      switch (state) {
        case 'Failed':
          return 'danger'
        case 'Success':
          return 'success'
        case 'Aborted':
          return 'warning'
        case 'Waiting':
          return 'slow'
        case 'Building':
          return 'success'
        case 'Skipped':
          return 'info'
        default:
          return 'info'
      }
    },
    getStateTagEffect(state) {
      switch (state) {
        case 'Building':
          return 'light'
        default:
          return 'dark'
      }
    }
  }
}
</script>
