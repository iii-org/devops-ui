<template>
  <el-row v-if="data.length>0">
    <el-row
      ref="dialog"
      class="dialog_wrapper"
      :style="{height:height}"
    >
      <el-radio-group
        v-model="status"
        class="flex justify-center pb-3"
        size="mini"
      >
        <el-radio-button label="all">
          全部
        </el-radio-button>
        <el-radio-button label="status">
          狀態
        </el-radio-button>
        <el-radio-button label="message">
          訊息
        </el-radio-button>
      </el-radio-group>
      <DialogContent
        v-for="(item,idx) in filteredIssueHistory"
        :key="idx"
        :note="item"
        :right="filterAuthor(item)"
        @show-parent-issue="showParentIssue"
      />
    </el-row>
  </el-row>
  <el-col v-else>
    <NoData />
  </el-col>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogContent from './widget/DialogContent'
import NoData from '@/components/NoData'

export default {
  name: 'IssueNotesDialog',
  components: { DialogContent, NoData },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '250px'
    }
  },
  data() {
    return {
      status: 'all'
    }
  },
  computed: {
    ...mapGetters(['userId']),
    filteredIssueHistory() {
      return this.data.filter((note) => {
        switch (this.status) {
          case 'all':
            return note
          case 'status':
            return note.details.length > 0 && note.notes === ''
          case 'message':
            return note.notes !== ''
        }
      })
    }
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler() {
        // this.$nextTick(() => {
        //   this.$refs['dialog'].$el.scrollTop = this.$refs['dialog'].$el.scrollHeight
        // })
      }
    }
  },
  mounted() {
    // this.$nextTick(() => {
    //   this.$refs['dialog'].$el.scrollTop = this.$refs['dialog'].$el.scrollHeight
    // })
  },
  methods: {
    filterAuthor(note) {
      return (note.user.id === this.userId)
    },
    showParentIssue(id) {
      this.$emit('show-parent-issue', id)
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog_wrapper{
  overflow-y: auto;
}
</style>
