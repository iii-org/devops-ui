/**
 *! Before using this module, you need to know:
 * 1. Binary? Blob? Arraybuffer?
 *  check https://javascript.info/binary to learn more
 *
 * 2. Binary data download only, including Blob (Binary Large Object)
 *  if you want to download file by JSON data, check @utils/downloadCsvOrExcel.js
 *
 */

/**
 * download file from binary
 * @param {string} blobParts - binary data from backend, required
 * @param {string} fileName - file name, ex: xxx.pdf, xxx.docx, required
 * @param {string} contentType - content type, optional
 */
export const downloadFileFromBinary = (blobParts, fileName, contentType) => {
  const url = contentType
    ? window.URL.createObjectURL(new Blob([blobParts]), { type: contentType })
    : window.URL.createObjectURL(new Blob([blobParts]))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
  document.body.removeChild(link)
}
