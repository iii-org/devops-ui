<template>
  <div>
    <el-row type="flex" justify="space-between">
      <el-col>
        <el-button type="primary" icon="el-icon-plus" @click="addTrackerOrder=!addTrackerOrder">
          {{ $t('Track.AddCheckRule') }}
        </el-button>
      </el-col>
      <el-col class="text-right">*{{ $t('Track.OnlyCheckRule', [5]) }}</el-col>
    </el-row>
    <el-divider />
    <el-form v-show="addTrackerOrder" ref="trackerOrderForm" inline :model="trackerOrderForm"
             :rules="trackerOrderRules"
    >
      <el-form-item :label="$t('Track.CheckRule')" prop="name">
        <el-input v-model="trackerOrderForm.name" />
      </el-form-item>
      <el-form-item :label="$t('Track.CheckOrder')" prop="order">
        <OrderListInput v-model="trackerOrderForm.order" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAddOrderList">{{ $t('general.Add') }}</el-button>
        <el-button @click="handleCancelAdd">{{ $t('general.Cancel') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="trackerMapOptions">
      <el-table-column :label="$t('Track.Enable')" prop="default" width="100px">
        <template slot-scope="{row}">
          <el-switch v-model="row.default" :disabled="row.default"
                     @change="handleSetDefault({id:row.id, default:$event})"
          />
        </template>
      </el-table-column>
      <el-table-column type="index" label="ID" width="100px" />
      <el-table-column :label="$t('Track.CheckRule')" prop="name" width="150px" show-tooltip-when-overflow>
        <template slot-scope="{row}">
          <el-input v-if="row.edit" v-model="row.name" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Track.CheckOrder')" prop="order" min-width="300px">
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
      <el-table-column :label="$t('general.Actions')" min-width="200px">
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
    const _this = this
    const lengthValidator = (rule, value) => {
      return new Promise((resolve, reject) => {
        if (value.length < rule.lengthCondition[0] || value.length > rule.lengthCondition[1]) {
          return reject(_this.$t('Track.OnlyCheckOrder', [rule.lengthCondition[0], rule.lengthCondition[1]]))
        }
        return resolve()
      })
    }
    return {
      addTrackerOrder: false,
      trackerOrderForm: {
        name: '',
        order: [],
        default: true
      },
      trackerOrderRules: {
        name: [{ required: true, message: this.$t('Validation.Input', [this.$t('Track.CheckRule')]), trigger: 'blur' }],
        order: [
          { required: true, message: this.$t('Validation.Select', [this.$t('Track.CheckOrder')]), trigger: 'change' },
          { lengthCondition: [2, 5], validator: lengthValidator, trigger: 'change' }
        ]
      },
      order_AppendSelector: null
    }
  },
  computed: {
    ...mapGetters(['selectedProjectId'])
  },
  methods: {
    handleAddOrderList() {
      this.$refs['trackerOrderForm'].validate(async valid => {
        if (valid) {
          try {
            await postTraceOrder({ ...this.trackerOrderForm, project_id: this.selectedProjectId })
            this.$message({
              title: this.$t('general.Success'),
              message: this.$t('Notify.Added'),
              type: 'success'
            })
          } catch (e) {
            console.error(e)
          }
          await this.$emit('update')
          this.$refs['trackerOrderForm'].resetFields()
        }
      })
    },
    async handleSaveEditOrderList(row) {
      const lengthCondition = this.trackerOrderRules.order.find(item => item.lengthCondition)
      if (!row.name || row.name.length <= 0) {
        this.$message({
          title: this.$t('general.Error'),
          message: this.$t('Validation.Input', [this.$t('Track.CheckRule')]),
          type: 'error'
        })
      } else if (!row.order || row.order.length < lengthCondition.lengthCondition[0] || row.order.length > lengthCondition.lengthCondition[1]) {
        this.$message({
          title: this.$t('general.Error'),
          message: this.$t('Track.OnlyCheckOrder', [lengthCondition.lengthCondition[0], lengthCondition.lengthCondition[1]]),
          type: 'error'
        })
      } else {
        try {
          await patchTraceOrder(row.id, row)
          this.$message({
            title: this.$t('general.Success'),
            message: this.$t('Notify.Updated'),
            type: 'success'
          })
        } catch (e) {
          console.error(e)
        }
        await this.$emit('update')
      }
    },
    async handleSetDefault(row) {
      try {
        const data = { default: row.default }
        if (row.id === -1) {
          data['project_id'] = this.selectedProjectId
        }
        await patchTraceOrder(row.id, data)
        this.$message({
          title: this.$t('general.Success'),
          message: this.$t('Notify.Updated'),
          type: 'success'
        })
      } catch (e) {
        console.erroe(e)
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
        console.error(e)
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
      this.$set(row, 'edit', true)
    },
    handleCancelEdit(row) {
      Object.keys(row).forEach(item => {
        const checkSplit = item.split('_')
        if (checkSplit.length > 1) {
          this.$set(row, checkSplit[1], row[item])
          this.$delete(row, item)
        }
      })
      this.$set(row, 'edit', false)
    }
  }
}
</script>

<style scoped>

</style>
