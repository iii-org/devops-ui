<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="addTrackerOrder=!addTrackerOrder">新增檢核順序</el-button>
    <el-divider />
    <el-form v-show="addTrackerOrder" ref="trackerOrderForm" inline :model="trackerOrderForm">
      <el-form-item label="檢核模組名稱" prop="name">
        <el-input v-model="trackerOrderForm.name" />
      </el-form-item>
      <el-form-item label="檢核順序" prop="order">
        <OrderListInput v-model="trackerOrderForm.order" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAddOrderList">{{ $t('general.Add') }}</el-button>
        <el-button @click="handleCancelAdd">{{ $t('general.Cancel') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="trackerMapOptions">
      <el-table-column label="預設" prop="default" width="100px">
        <template slot-scope="{row}">
          <el-switch v-model="row.default" :disabled="row.default"
                     @change="handleSetDefault({id:row.id, default:$event})"
          />
        </template>
      </el-table-column>
      <el-table-column type="index" label="項次" width="100px" />
      <el-table-column label="檢核模組名稱" prop="name" width="150px" show-tooltip-when-overflow>
        <template slot-scope="{row}">
          <el-input v-if="row.edit" v-model="row.name" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="檢核順序" prop="order" min-width="300px">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <OrderListInput v-model="row.order" />
          </template>
          <template v-else>
            <span v-for="(item,idx) in row.order" :key="item" class="item">
              {{ idx + 1 }}.{{ $t(`Issue.${item}`) }}
            </span>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200px">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-button type="primary" size="mini" icon="el-icon-check" @click="handleSaveEditOrderList(row)">
              {{ $t('general.Save') }}
            </el-button>
            <el-button type="danger" size="mini" icon="el-icon-close" @click="handleCancelEdit(row)">
              {{ $t('general.Cancel') }}
            </el-button>
          </template>
          <template v-else-if="row.id !== -1">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleEdit(row)">{{ $t('general.Edit') }}
            </el-button>
            <el-popconfirm :confirm-button-text="$t('general.Delete')"
                           :cancel-button-text="$t('general.Cancel')"
                           icon="el-icon-info"
                           icon-color="red"
                           :title="$t('Notify.confirmDelete')"
                           @confirm="handleDeleteOrderList(row)"
            >
              <el-button v-show="!row.default" slot="reference" type="danger" size="mini" icon="el-icon-delete"
                         :disabled="row.default"
              >
                {{ $t('general.Delete') }}
              </el-button>
            </el-popconfirm>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { deleteTraceOrder, patchTraceOrder, postTraceOrder } from '@/views/Plugin/QA/api/qa'
import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'
import OrderListInput from '@/views/Plugin/QA/views/Track/TraceabilityMatrix/components/OrderListInput'

export default {
  name: 'OrderListDialog',
  components: { OrderListInput },
  props: {
    trackerMapOptions: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      addTrackerOrder: false,
      trackerOrderForm: {
        name: '',
        order: [],
        default: true
      },
      order_AppendSelector: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    async handleAddOrderList() {
      try {
        await postTraceOrder(this.selectedProjectId, this.trackerOrderForm)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Added'),
          type: 'success'
        })
      } catch (e) {
        console.log(e)
      }
      await this.$emit('update')
    },
    async handleSaveEditOrderList(row) {
      try {
        await patchTraceOrder(row.id, row)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } catch (e) {
        console.log(e)
      }
      await this.$emit('update')
    },
    async handleSetDefault(row) {
      try {
        let row_id = row.id
        let row_default = row.default
        if (row.id === -1) {
          const getOrder = this.trackerMapOptions.find(item => item.default && item.id !== -1)
          if (!getOrder) return false
          row_id = getOrder.id
          row_default = false
        }
        await patchTraceOrder(row_id, { default: row_default })
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } catch (e) {
        console.log(e)
        this.$set(row, 'default', !row.default)
      }
      await this.$emit('update')
    },
    async handleDeleteOrderList(row) {
      try {
        await deleteTraceOrder(row.id)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Deleted'),
          type: 'success'
        })
      } catch (e) {
        console.log(e)
      }
      await this.$emit('update')
    },
    handleCancelAdd() {
      this.$refs['trackerOrderForm'].resetFields()
      this.addTrackerOrder = !this.addTrackerOrder
      this.order_AppendSelector = null
    },
    handleEdit(row) {
      Object.keys(row).forEach(item => {
        this.$set(row, `Original_${item}`, cloneDeep(row[item]))
      })
      console.log(row)
      this.$set(row, 'edit', true)
    },
    handleCancelEdit(row) {
      Object.keys(row).forEach(item => {
        const checkSplit = item.split('_')
        if (checkSplit.length > 1) {
          console.log(checkSplit[1], row[item], row[checkSplit[1]], row[item])
          this.$set(row, checkSplit[1], row[item])
          this.$delete(row, item)
        }
      })
      console.log(row)
      this.$set(row, 'edit', false)
    }
  }
}
</script>

<style scoped>

</style>
