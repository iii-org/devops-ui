module.exports = {
  mode: 'jit', // just-in-time mode: https://tailwindcss.com/docs/just-in-time-mode
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
    extend: {
      minWidth: {
        '300': '300px'
      },
      colors: {
        custom: {
          black: '#606206'
        },
        success: '#67c23a',
        danger: '#f56c6c',
        warning: '#e6a23c',
        slow: '#56b1e8',
        light: '#c1c3c5',
        info: '#606260',
        secondary: '#3ecbbc',
        active: '#409eff',
        assigned: '#f56c6c',
        closed: '#909399',
        solved: '#3ecbbc',
        inProgress: '#e6a23c',
        finished: '#67c23a',
        feature: '#66d7ff',
        document: '#5388ff',
        bug: '#fea859',
        research: '#a0da2c'
      },
      backgroundColor: theme => ({
        ...theme('colors')
      })
    }
  },
  variants: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
