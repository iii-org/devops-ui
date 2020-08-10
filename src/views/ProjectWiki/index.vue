<script>
import { mapGetters, mapActions } from 'vuex'
import WangEditor from "@/components/Wangeditor";

export default {
  components: { 
    WangEditor
  },
  data () {
    return {
      wikiContent: 'Hello DevOps',
      newWikiContent: '',
      dialogVisible: false
    }
  },
  methods: {
    emitGetEditorData(value){
      this.newWikiContent = value
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleUpdate() {
      this.dialogVisible = false
      this.wikiContent = this.newWikiContent
    }
  }
}
</script>
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button 
        class="filter-item" 
        type="primary" 
        @click="dialogVisible = true"
      >
        Edit
      </el-button>
    </div>
    <div class="wiki-container" v-html="wikiContent"></div>
    <el-dialog
      title="Edit Wiki"
      :visible="dialogVisible"
      width="70%"
      @close="handleClose"
    >
      <WangEditor 
        @get-editor-data="emitGetEditorData" 
        :wiki-content="wikiContent">
      </WangEditor>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleUpdate">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style lang="scss">
  .wiki-container {
    margin-top: 10px;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #c0c0c0;
  }
</style>