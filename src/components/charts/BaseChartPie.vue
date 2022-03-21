<template>
  <pie-chart
    v-bind="pieChartProps"
  />
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { PieChart, usePieChart } from 'vue-chart-3'
import { Chart, ChartData, registerables } from 'chart.js'

Chart.register(...registerables)

export default defineComponent({
  name: 'BaseChartPie',
  components: {
    PieChart
  },
  setup () {
    const dataValues = ref([30, 40, 60])

    const testData = computed<ChartData<'pie'>>(() => ({
      labels: [],
      datasets: [
        {
          data: dataValues.value,
          backgroundColor: [
            '#77CEFF',
            '#0079AF',
            '#123E6B',
            '#97B0C4',
            '#A5C8ED'
          ]
        }
      ]
    }))

    const { pieChartProps } = usePieChart({
      chartData: testData,
      options: {
        plugins: {
          legend: false
        }
      }
    })

    return {
      pieChartProps
    }
  }
})
</script>
