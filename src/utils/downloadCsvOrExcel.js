/**
 *! Before using this module, you need to know:
 * 1. there are two steps if you want to use this module for downloading CSV or EXCEL
 *  a. use xlsx.js to transform json to sheet or table to sheet
 *  b. transform the sheet to CSV or Excel
 *
 * 2. methods to get sheet
 *  a. XLSX.utils.json_to_sheet(json) --> json to sheet
 *  b. XLSX.utils.table_to_sheet(dom) --> table dom to sheet
 *
 * 3. methods to download
 *  a. this.$csv(sheet, filename) --> download CSV
 *  b. this.$excel(sheet, filename) --> download EXCEL
 *
 * if you need more methods, you can refer https://github.com/SheetJS/sheetjs
 */

import Vue from 'vue'
import XLSX from 'xlsx'

const CSV = {}
const EXCEL = {}

/**
 * string to array buffer
 * @param {String} s - string
 * @returns buf - ArrayBuffer
 */
function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
  return buf
}

/**
 * generate blob from sheet
 * @param {Object} sheet - sheet transformed by XLSX plugin, required
 * @param {String} filename_extension - file name extension, required
 * @param {String} sheetName - sheet name, optional
 */
function sheet2blob(sheet, filename_extension, sheetName) {
  sheetName = sheetName || 'sheet1'
  const workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  }
  workbook.Sheets[sheetName] = sheet // 生成excel的配置項

  const wopts = {
    bookType: filename_extension, // 要生成的檔案型別
    bookSST: false, // 是否生成Shared String Table，官方解釋是，如果開啟生成速度會下降，但在低版本IOS裝置上有更好的相容性
    type: 'binary'
  }
  const wbout = XLSX.write(workbook, wopts)
  return new Blob([s2ab(wbout)], {
    type: 'application/octet-stream'
  }) // 字串轉ArrayBuffer
}

/**
 * @param {Object} sheet - sheet transformed by XLSX plugin, required
 * @param {String} filename - file name, required
 * @param {String} filename_extension - file name extension, required
 */
function downloadFile(sheet, filename, filename_extension) {
  let url = sheet2blob(sheet, filename_extension)
  if (typeof url === 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url) // 建立blob地址
  }
  const time = new Date()
  const timeNow = time.toLocaleDateString()
  const saveName = `${filename}_${timeNow}.${filename_extension}`
  const link = document.createElement('a')
  link.href = url
  link.download = saveName
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
  document.body.removeChild(link)
}

CSV.install = function(options) {
  Vue.prototype.$csv = function(sheet, filename) {
    downloadFile(sheet, filename, 'csv')
  }
}

EXCEL.install = function(options) {
  Vue.prototype.$excel = function(sheet, filename) {
    downloadFile(sheet, filename, 'xlsx')
  }
}

Vue.use(CSV)
Vue.use(EXCEL)

export default { CSV, EXCEL }
