module.exports = {
  mode: 'jit',
  purge: {
    enabled: true,
    content: ['./public/**/*.html', './src/**/*.vue'],
    options: {
      safelist: {
        standard: [/^el-/],
        deep: [/^el-/]
      }
    }
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
