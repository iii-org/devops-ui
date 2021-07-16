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
    minWidth: {
      '0': '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      'full': '100%'
    },
    extend: {
      minWidth: {
        '300': '300px'
      },
      colors: {
        danger: '#f56c6c',
        custom: {
          black: '#606206'
        }
      }
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
