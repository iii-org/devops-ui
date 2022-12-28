/**
 *! Before using this module, you need to know:
 * 1. binary? blob? arraybuffer?
 *  check https://javascript.info/binary to learn more
 *
 * 2. PDF and DOCX download only
 *  if if you want to download CSV or EXCEL, check @utils/downloadCsvOrExcel.js
 */

/**
 * download file from binary
 * @param {string} binary - binary string from backend, required
 * @param {string} fileName - file name, ex: xxx.pdf, xxx.docx, required
 * @param {string} contentType - content type, optional
 */
export const downloadFileFromBinary = (binary, fileName, contentType) => {
  const url = window.URL.createObjectURL(new Blob([binary]), { type: contentType })
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
  document.body.removeChild(link)
}
