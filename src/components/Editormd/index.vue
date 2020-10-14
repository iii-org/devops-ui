<template>
  <div :id="id"></div>
</template>
<script>
import $ from 'jquery'

export default {
  name: 'MarkdownEditor',
  data: function () {
    return {
      editor: null,
      //defaul option
      defaultOptions: {
        //width: "90%",
        height: 500,
        path: '/lib/editor.md/lib/',
        theme: 'default',
        previewTheme: 'default',
        editorTheme: 'default',
        codeFold: true,
        watch: true,
        //syncScrolling : false,
        saveHTMLToTextarea: true,
        searchReplace: true,
        htmlDecode: 'style,script,iframe|on*',
        emoji: true,
        taskList: true,
        tocm: true, // Using [TOCM]
        imageUpload: false,
        toolbarIcons: function () {
          return [
            'undo',
            'redo',
            '|',
            'bold',
            'del',
            'italic',
            'quote',
            'lowercase',
            '|',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            '|',
            'list-ul',
            'list-ol',
            'hr',
            '|',
            'preview',
            'watch',
            'fullscreen'
          ]
        },
        onchange: () => {
          if (this.editor) {
            this.$emit('get-editor-data', this.editor.getMarkdown())
          } else {
            this.$emit('get-editor-data', '')
          }
        }
      }
    }
  },
  props: {
    id: {
      type: String,
      default: 'editormd'
    },
    content: {
      type: String,
      default: ''
    },
    options: {
      type: Object
    }
  },
  watch: {
    content(val) {
      console.log('val', val)
      this.editor.setMarkdown(val)
    }
  },
  mounted() {
    const content = this.content
    let vm = this
    //load editormd
    this.requireEditor(function () {
      const options = vm.getOptions()
      options.markdown = content
      vm.editor = editormd(vm.id, options)
    })
  },
  methods: {
    requireEditor(callback) {
      let vm = this
      window.$ = window.jQuery = $
      $.getScript('/lib/editor.md/editormd.min.js', function (script) {
        callback()
      })
      $('head').append(
        $('<link rel="stylesheet" type="text/css" />').attr('href', '/lib/editor.md/css/editormd.min.css')
      )
    },
    getOptions() {
      return Object.assign(this.defaultOptions, this.options)
    }
  }
}
</script>
<style>
</style>