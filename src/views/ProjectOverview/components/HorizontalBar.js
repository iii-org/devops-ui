import { HorizontalBar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: HorizontalBar,
  mixins: [reactiveProp],
  // props: ['options'],
  mounted() {
    this.renderChart(this.chartData, this.options)
  },
  data: () => ({
    options: {
      maintainAspectRatio: false,
      legend: {
        position: 'left',
        labels: {
          usePointStyle: true
        }
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            gridLines: {
              display: false,
              offsetGridLines: false
            }
          }
        ],
        yAxes: [
          {
            stacked: true,
            gridLines: {
              offsetGridLines: false
            }
          }
        ]
      },
      plugins: {
        datalabels: {
          color: '#fff',
          font: {
            weight: 'bold',
            size: '13'
          }
        }
      }
    }
  })
}
