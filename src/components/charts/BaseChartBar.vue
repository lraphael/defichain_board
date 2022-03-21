<template>
  <bar-chart
    v-bind="barChartProps"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { BarChart, useBarChart } from 'vue-chart-3'
import { Chart, registerables, ChartData } from 'chart.js'

Chart.register(...registerables)

export default defineComponent({
  name: 'BaseChartBar',
  components: {
    BarChart
  },
  setup () {
    const chartData = computed<ChartData<'bar'>>(() => ({
      labels: ['2020', '2021', '2022'],
      datasets: [
        {
          label: '',
          data: [50000, 55000, 60000],
          backgroundColor: [
            '#77CEFF',
            '#0079AF',
            '#123E6B',
            '#97B0C4',
            '#A5C8ED'
          ]
        }
      ]
    })
    )

    const { barChartProps } = useBarChart({
      chartData: chartData,
      options: {
        plugins: {
          legend: false
        }
      }
    })

    return {
      barChartProps
    }
  }
})
</script>
