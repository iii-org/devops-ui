<template>
  <div>
    <div ref="editor" style="text-align:left"></div>
  </div>
</template>

<script>
import E from 'wangeditor'

export default {
  name: 'editor',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editor: ''
    }
  },
  watch: {
    content(val) {
      this.editor.txt.html(`<pre>${val}</pre>`)
    }
  },
  mounted() {
    this.editor = new E(this.$refs.editor)
    this.editor.customConfig.onchange = html => {
      const new_html = html.replace(/^<pre>|<\/pre>*/g, '') //remove before and after pre & p tag
      this.$emit('get-editor-data', new_html)
    }
    this.editor.customConfig.lang = {
      设置标题: 'title',
      字号: 'size',
      字体: 'style',
      文字颜色: 'font color',
      背景色: 'bg color',
      正文: 'p',
      链接文字: 'link text',
      链接: 'link',
      上传图片: 'upload image',
      上传: 'upload',
      创建: 'init'
      // 还可自定添加更多
    }
    this.editor.create()
    this.editor.txt.html(`<pre>${this.content}</pre>`)
  },
  methods: {
    onUpdate() {
      return this.editor.txt.text()
    }
  }
}
</script>

<style scoped></style>
