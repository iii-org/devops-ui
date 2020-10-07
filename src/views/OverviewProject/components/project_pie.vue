<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    theData: {
      type: Object,
      default() {
        return { total_issue: 0, unfinish_number: 0 }
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    theData(value) {
      this.$nextTick(() => {
        const CONFIG_DATA = [
          { value: value.unfinish_number, name: 'Ongoing' },
          { value: value.total_issue - value.unfinish_number, name: 'Done' }
        ]
        this.initChart(CONFIG_DATA)
      })
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart(data) {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        legend: {
          orient: 'vertical',
          right: 10,
          selectedMode: false,
          data: ['Ongoing', 'Done']
        },
        series: [
          {
            name: 'ASSIGN ISSUE PROJECT',
            type: 'pie',
            radius: [75, 95],
            center: ['50%', '38%'],
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'center',
                formatter: function(d) {
                  return '{number|' + Math.round(d.percent) + '%}\n{title|' + d.name + '}'
                },
                rich: {
                  number: {
                    color: '#2EC6C8',
                    fontSize: '36',
                    fontWeight: 'bold'
                  },
                  title: {
                    color: '#000000',
                    fontSize: '11',
                    padding: [0,0,5,0]
                  }
                }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '36',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              {value: 560, name: 'Done', label: {normal: {show: true}, emphasis: { show: true }}}, //預設中間顯示
              {value: 335, name: 'Ongoing'}
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })

      let options = this.chart.getOption();
      this.chart.on('mouseover', function(e) {
        options.series[0].data[0].label = {
          show: false
        };

        this.setOption(options, true);
      });

      this.chart.on('mouseout', function(e) {
        options.series[0].data[0].label = {
          show: true
        };

        this.setOption(options, true);
      });
    } // end initchart
  }
}
</script>
