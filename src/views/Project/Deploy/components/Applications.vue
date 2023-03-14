<template>
  <el-table
    v-loading="isLoading||listLoading"
    :data="listData"
    :element-loading-text="$t('Loading')"
    style="margin: 0 auto; width: 90%;"
    size="mini"
    fit
  >
    <el-table-column
      align="center"
      :label="$t('general.Index')"
      width="80"
      type="index"
    />
    <el-table-column
      align="center"
      :label="$t('Deploy.Name')"
      min-width="150"
      prop="name"
    />
    <el-table-column
      align="center"
      :label="$t('Deploy.Status')"
      min-width="150"
      prop="status"
    >
      <template slot-scope="{row}">
        <el-popover
          v-if="row.error_message"
          placement="bottom"
          width="300"
          trigger="hover"
          :content="row.error_message"
        >
          <em
            slot="reference"
            class="el-icon-error"
            :style="getStyle('danger')"
          />
        </el-popover>
        <template v-else>
          <template v-if="!row.disabled">
            <span class="text-sm">
              {{ row.status }}
            </span>
            <Status :id="row.status_id" />
          </template>
          <template v-else>
            {{ $t('Deploy.Stopped') }}
            <Status :id="0" />
          </template>
        </template>
      </template>
    </el-table-column>
    <el-table-column
      prop="total_pods"
      align="center"
      min-width="150"
      :label="$t('Deploy.Pod')"
    >
      <template slot-scope="{row}">
        <el-progress
          :percentage="calcPercentage(row.deployment)"
          :status="format(row.deployment)"
        />
        <span v-if="isPodNumberNotNull(row.deployment)">
          {{ row.deployment.available_pod_number }} / {{ row.deployment.total_pod_number }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      :label="$t('general.Actions')"
      width="240"
    >
      <template slot-scope="{row}">
        <el-dropdown
          v-if="row.status_id !== 9"
          split-button
          size="small"
          :type="row.disabled ? 'warning' : 'success'"
          @click="handleServiceStatus(row)"
        >
          <em :class="row.disabled| getActionIcon" />
          {{ getActionText(row.disabled) }}
          <el-dropdown-menu slot="dropdown">
            <template v-if="row.public_endpoint">
              <el-dropdown-item
                type="danger"
                icon="el-icon-copy-document"
                @click.native="copyUrl(row.public_endpoint)"
              >
                {{ $t('Deploy.CopyApplicationIP') }}
              </el-dropdown-item>
              <el-dropdown-item
                type="danger"
                icon="el-icon-link"
                @click.native="toEndpoint(row.public_endpoint)"
              >
                {{ $t('Deploy.LinkToApplication') }}
              </el-dropdown-item>
              <el-dropdown-item>
                <el-divider class="m-0" />
              </el-dropdown-item>
            </template>
            <el-dropdown-item
              size="mini"
              icon="el-icon-refresh-right"
              @click.native="handleRedeploy(row.id)"
            >
              {{ $t('Deploy.Redeploy') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import Status from './Status'
import {
  patchService,
  patchServiceRedeploy
} from '@/api/deploy'
import variables from '@/styles/theme/variables.scss'

export default {
  name: 'Applications',
  components: { Status },
  filters: {
    getActionIcon(value) {
      return value ? 'el-icon-video-play' : 'el-icon-video-pause'
    }
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    listData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listLoading: false
    }
  },
  computed: {
    isPodNumberNotNull() {
      return function(deployment) {
        const { available_pod_number, total_pod_number } = deployment
        return available_pod_number !== null && total_pod_number !== null
      }
    },
    format() {
      return function (deployment) {
        const { available_pod_number, total_pod_number } = deployment
        if (available_pod_number && total_pod_number) {
          return available_pod_number / total_pod_number === 1 ? 'success' : 'warning'
        }
      }
    },
    calcPercentage() {
      return function (deployment) {
        const { available_pod_number, total_pod_number } = deployment
        if (available_pod_number && total_pod_number) {
          return (available_pod_number / total_pod_number) * 100
        }
      }
    }
  },
  methods: {
    getStyle(colorCode) {
      const color = variables[`${colorCode}`]
      return { color }
    },
    getActionText(value) {
      return value ? this.$t('Deploy.Start') : this.$t('Deploy.Stop')
    },
    showSuccessMessage(message) {
      this.$message({
        title: this.$t('general.Success'),
        type: 'success',
        message
      })
    },
    async handleServiceStatus(row) {
      this.listLoading = true
      try {
        await patchService(row.id, { disabled: !row.disabled })
        this.showSuccessMessage(this.$t('Notify.Updated'))
      } catch (e) {
        console.error(e)
      }
      await this.$emit('loadData')
      this.listLoading = false
    },
    async handleRedeploy(id) {
      this.listLoading = true
      try {
        await patchServiceRedeploy(id)
        this.showSuccessMessage(this.$t('Notify.Updated'))
      } catch (e) {
        console.error(e)
      }
      await this.$emit('loadData')
      this.listLoading = false
    },
    toEndpoint(url) {
      window.open(url, '_blank')
    },
    copyUrl(text) {
      this.$copyText(text).then(() => {
        this.showSuccessMessage(this.$t('Notify.Copied'))
      })
    }
  }
}
</script>
