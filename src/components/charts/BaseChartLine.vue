<template>
  <line-chart
    v-bind="lineChartProps"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { LineChart, useLineChart } from 'vue-chart-3'
import { Chart, registerables, ChartData } from 'chart.js'

Chart.register(...registerables)

export default defineComponent({
  name: 'BaseChartLine',
  components: {
    LineChart
  },
  props: {
    labels: {
      type: Array,
      default: () => []
    },
    datasets: {
      type: Array,
      default: () => []
    }
  },
  setup (props) {
    const chartData = computed<ChartData<'line'>>(() => ({
      labels: props.labels as any,
      datasets: props.datasets as any
    })
    )

    const { lineChartProps } = useLineChart({
      chartData: chartData,
      options: {
        elements: {
          point: {
            radius: 1
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })

    return {
      lineChartProps
    }
  }
})
</script>
