const fs = require('fs')
const resolveConfig = require('tailwindcss/resolveConfig')
const prettier = require('prettier')
const path = require('path')
// bring in the Tailwind config
const tailwindConfig = require('../tailwind.config.js')

const { theme } = resolveConfig(tailwindConfig)
const themeStr = JSON.stringify(theme)
const js = `
const theme  = ${themeStr}
export default theme
`

try {
  // write the file to src/theme.js after
  // having prettier format the string for us
  fs.writeFileSync(
    path.resolve(process.cwd(), './src/theme.js'),
    prettier.format(js, { parser: 'babel' }),
    'utf-8'
  )
} catch (err) {
  // uh-oh, something happened here!
  console.log(err.message)
}
