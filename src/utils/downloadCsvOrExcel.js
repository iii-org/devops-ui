/**
 * Download Excel or Csv by using xlsx.js to transform json to sheet or table to sheet, and then transform the sheet to Excel or Csv finally
 * Use XLSX.utils.json_to_sheet(json) to transform json to sheet, while XLSX.utils.table_to_sheet(dom) to transform table dom to sheet
 * Use this.$csv(sheet, filename) to download csv
 * Use this.$excel(sheet, filename) to download excel
 */

import Vue from 'vue'
import XLSX from 'xlsx'

const CSV = {}
const EXCEL = {}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length)
  var view = new Uint8Array(buf)
  for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
  return buf
}

/**
 * @param {Object} sheet - sheet transformed by XLSX plugin, required
 * @param {String} filename_extension - file name extension, required
 * @param {String} sheetName - sheet name, optional
 */
function sheet2blob(sheet, filename_extension, sheetName) {
  sheetName = sheetName || 'sheet1'
  var workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  }
  workbook.Sheets[sheetName] = sheet // 生成excel的配置項

  var wopts = {
    bookType: filename_extension, // 要生成的檔案型別
    bookSST: false, // 是否生成Shared String Table，官方解釋是，如果開啟生成速度會下降，但在低版本IOS裝置上有更好的相容性
    type: 'binary'
  }
  var wbout = XLSX.write(workbook, wopts)
  var blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream'
  }) // 字串轉ArrayBuffer
  return blob
}

/**
 * @param {Object} url - url from function sheet2blob(), required
 * @param {String} filename - file name, required
 * @param {String} filename_extension - file name extension, required
 */
function openDownloadDialog(sheet, filename, filename_extension) {
  let url = sheet2blob(sheet, filename_extension)
  if (typeof url === 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url) // 建立blob地址
  }
  const time = new Date()
  const timeNow = time.toLocaleDateString()
  const saveName = `${filename}_${timeNow}.${filename_extension}`
  const aLink = document.createElement('a')
  aLink.href = url
  aLink.download = saveName || ''
  let event
  if (window.MouseEvent) event = new MouseEvent('click')
  else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}

CSV.install = function(Vue, options) {
  Vue.prototype.$csv = function(sheet, filename) {
    openDownloadDialog(sheet, filename, 'csv')
  }
}

EXCEL.install = function(Vue, options) {
  Vue.prototype.$excel = function(sheet, filename) {
    openDownloadDialog(sheet, filename, 'xlsx')
  }
}

Vue.use(CSV)
Vue.use(EXCEL)

export default { CSV, EXCEL }
