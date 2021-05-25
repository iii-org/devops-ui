<template>
  <el-row>
    <el-row ref="dialog" class="dialog_wrapper" :style="{height:height}">
      <dialog-content v-for="(item,idx) in data" :key="idx" :note="item" :right="filterAuthor(item)" @show-parent-issue="showParentIssue" />
    </el-row>
  </el-row>
</template>

<script>
import DialogContent from '@/views/Project/IssueDetail/components/widget/DialogContent'
import { mapGetters } from 'vuex'

export default {
  name: 'IssueNotes',
  components: { DialogContent },
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
  computed: {
    ...mapGetters(['userId']),
    filteredIssueNotes() {
      return this.data.filter(note => note.notes !== '')
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
