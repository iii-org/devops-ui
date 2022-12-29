/**
 *! Download pdf by selecting dom and converting to canvas, and can be used like this.$pdf(dom, file_info) to download pdf
 * @param dom - dom selected in components
 * @param file_name - pdf file name
 */

import Vue from 'vue'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

const PDF = {}

PDF.install = function(options) {
  Vue.prototype.$pdf = function(dom, fileName) {
    html2canvas(dom).then(canvas => {
      const time = new Date()
      const timeNow = time.toLocaleString()
      const fullFileName = `${fileName}_${timeNow}`

      const imgData = canvas.toDataURL('image/jpeg')
      const imgWidth = 595
      const pageHeight = 841
      const imgHeight = canvas.height * (imgWidth / canvas.width)
      let heightLeft = imgHeight
      const doc = new JsPDF('p', 'pt', 'a4')
      let position = 0

      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      doc.save(fullFileName)
    })
  }
}

Vue.use(PDF)

export default { PDF }
