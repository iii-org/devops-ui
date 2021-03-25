import { Doughnut, mixins } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
const { reactiveProp } = mixins

export default {
  extends: Doughnut,
  mixins: [reactiveProp],
  // props: ['options'],
  mounted() {
    this.addPlugin([ChartDataLabels])
    this.renderChart(this.chartData, this.options)
  },
  data: () => ({
    options: {
      maintainAspectRatio: false,
      legend: {
        display: true
      },
      plugins: {
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: '20'
          }
        }
      }
    }
  })
}
