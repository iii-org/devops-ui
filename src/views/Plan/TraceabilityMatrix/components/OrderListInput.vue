<template>
  <div>
    <el-select v-model="order_AppendSelector" :placeholder="$t('Track.SelectTracker')" filterable
               @change="handleAddOrder"
    >
      <el-option v-for="item in appendFilterTrackerList()" :key="item.id" :label="$t(`Issue.${item.name}`)"
                 :value="item.name"
      >
        <Tracker :name="$t(`Issue.${item.name}`)" :type="item.name" />
      </el-option>
    </el-select>
    <draggable v-model="value" :draggable="'.item'">
      <span v-for="(item,idx) in value" :key="item" class="item">
        {{ idx + 1 }}.
        <el-tag closable @close="handleDeleteOrder(item)">
          <Tracker :name="$t(`Issue.${item}`)" :type="item" />
        </el-tag>
      </span>
    </draggable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Tracker from '@/components/Issue/Tracker'
import draggable from 'vuedraggable'
import emitter from 'element-ui/src/mixins/emitter'

export default {
  name: 'OrderListInput',
  components: {
    Tracker,
    draggable
  },
  mixins: [emitter],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Array,
      default: () => ([])
    },
    validateEvent: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      order_AppendSelector: null
    }
  },
  computed: {
    ...mapGetters(['tracker'])
  },
  watch: {
    value(val) {
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.change', [val])
      }
    }
  },
  methods: {
    appendFilterTrackerList() {
      return this.tracker.filter(item => !this.value.includes(item.name))
    },
    handleDeleteOrder(item) {
      this.value.splice(this.value.indexOf(item), 1)
    },
    handleAddOrder(value) {
      if (value) {
        if (this.value.length < 5) {
          this.value.push(value)
        } else {
          this.$message({
            title: this.$t('general.Error'),
            message: this.$t('Track.OnlyCheckOrder'),
            type: 'error'
          })
        }
        this.$set(this.$data, 'order_AppendSelector', null)
      }
    }
  }
}
</script>

<style scoped>
.item{
  @apply cursor-move inline-block;
}
</style>
