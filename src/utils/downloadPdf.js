/**
 *! Download pdf by selecting dom and converting to canvas, and can be used like this.$pdf(dom, file_info) to download pdf
 * @param dom - dom selected in components
 * @param file_name - pdf file name
 */

import Vue from 'vue'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

const PDF = {}

PDF.install = function(Vue, options) {
  Vue.prototype.$pdf = function(dom, fileName) {
    html2canvas(dom).then(canvas => {
      // const [A4Width, A4Height] = [595, 841] // a4
      // const { width: CanvasWidth, height: CanvasHeight } = canvas
      // const PdfWidth = A4Width
      // const PdfHeight = (A4Width / CanvasWidth) * CanvasHeight
      // const jpeg = canvas.toDataURL('image/jpeg', 1.0)
      // const doc = new JsPDF('', 'pt', 'a4')
      // doc.addImage(jpeg, 'JPEG', 0, 0, PdfWidth, PdfHeight)
      // doc.save(fullFileName)

      const time = new Date()
      const timeNow = time.toLocaleString()
      const fullFileName = `${fileName}_${timeNow}`

      var imgData = canvas.toDataURL('image/jpeg')
      var imgWidth = 595
      var pageHeight = 841
      var imgHeight = canvas.height * (imgWidth / canvas.width)
      var heightLeft = imgHeight
      var doc = new JsPDF('p', 'pt', 'a4')
      var position = 0

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
