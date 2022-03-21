<template>
  <q-page class="row">
    <div class="col-12 q-pa-xs">
      <base-dashboard-chart
        :loading="loading"
      >
        <template #title>
          APR [%]
        </template>

        <template #chart>
          <base-chart-line
            :key="`${labels.length}_${datasets.length}`"
            :labels="labels"
            :datasets="datasets"
          />
        </template>
      </base-dashboard-chart>
    </div>
  </q-page>
  <base-filter-dialog
    :visible="filterVisible"
    :title="'History'"
    @cancel="cancelFilter"
    @confirm="confirmFilter"
    @reset="resetFilter"
    @search="onSearch"
  />
</template>

<script lang="ts">
import { defineComponent, ref, provide, watch, inject, onMounted } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import dayjs from 'dayjs'

import { getColor } from 'src/composables/useColors'
import { getConfigByKey, setConfigByKey } from 'src/composables/useUserData'

import BaseDashboardChart from 'src/components/BaseDashboardChart.vue'
import BaseChartLine from 'src/components/charts/BaseChartLine.vue'
import BaseFilterDialog from 'src/components/filter/BaseFilterDialog.vue'

import type { FilterData } from 'src/components/filter/BaseFilterDialog.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'

export default defineComponent({
  name: 'HistoryPoolsApr',
  components: {
    BaseDashboardChart,
    BaseChartLine,
    BaseFilterDialog
  },
  setup () {
    const uniqName = 'historyAPY'
    const datasets = ref([]) as any
    const labels = ref([]) as any
    const queryAllFilter = ref({}) as any

    const queryListEnabled = ref(false)
    const queryVars = ref({
      symbol: null,
      createdAtGte: null
    }) as any
    const queryListPoolPairs = gql(`query
      ListPoolPairs($symbol: [String], $createdAtGte: DateTime, $createdAtLt: DateTime) {
        listPoolPairs (symbol: $symbol, createdAtGte: $createdAtGte, createdAtLt: $createdAtLt){
          symbol
          createdAt
          apr {
            total
          }
        }
      }`)
    const { onResult, refetch, loading } = useQuery(queryListPoolPairs,
      queryVars, () => ({
        enabled: queryListEnabled.value,
        fetchPolicy: 'no-cache'
      }))

    onResult(result => {
      datasets.value = []
      labels.value = []
      const datasetData = {} as any
      const lastDate = {} as any
      // get only 1 result per symbol and hour
      result.data.listPoolPairs.forEach((pool: { apr: { total: number }; createdAt: string|number|Date|dayjs.Dayjs|null|undefined, symbol: string }) => {
        if (datasetData[pool.symbol] === undefined) {
          datasetData[pool.symbol] = []
        }
        if (lastDate[pool.symbol] === undefined) {
          lastDate[pool.symbol] = null
        }
        const currentDate = dayjs(pool.createdAt).format('DD.MM.YYYY HH')
        if (lastDate === null || lastDate[pool.symbol] !== currentDate) {
          datasetData[pool.symbol].push((pool.apr.total * 100))
          if (lastDate.labelsDate !== currentDate) {
            labels.value.push(dayjs(pool.createdAt).format('DD.MM.YYYY HH:mm'))
          }
        }
        lastDate[pool.symbol] = currentDate
        lastDate.labelsDate = currentDate
      })
      const colors = getColor()
      for (const key in datasetData) {
        datasets.value.push({
          label: key,
          data: datasetData[key],
          backgroundColor: colors.next().value
        })
      }
    })

    /**
     * query avaiable Poolpairs
     */
    const poolpairChoices = ref([]) as any
    const poolpairFilter = ref<null | string>(null)
    const queryPoolpairs = gql(`query
      poolpairs {
        poolpairs
      }`)
    const { result: poolpairsResult, onError } = useQuery(queryPoolpairs,
      {
        fetchPolicy: 'no-cache'
      })

    /**
     * Filter Dialog
     */
    const filterData = ref<any[]>([])
    provide('filterData', filterData)

    filterData.value = [{
      label: 'Poolpair',
      field: 'symbol',
      type: 'select',
      choices: poolpairChoices,
      values: []
    }, {
      label: 'Date',
      field: 'createdAt',
      type: 'date',
      values: {}
    }]

    const setFilterDataValues = (key: string, values: {label: string, value: string, checked?: boolean}[] | {label: string, value: string}) => {
      const index = filterData.value.findIndex(item => item.field === key)
      if (index !== -1) {
        filterData.value[index].values = values
      }
    }
    provide('setFilterDataValues', setFilterDataValues)

    const setFilterDataDateValue = (key: string, values: { fromDate: string, toDate: string }) => {
      const index = filterData.value.findIndex(item => (item.field === key))
      if (index !== -1) {
        const item = filterData.value[index]
        if (item.type === 'date') {
          item.values = values
        }
      }
    }
    provide('setFilterDataDateValue', setFilterDataDateValue)

    const updateCheckedFilterDataValue = (key: string, currentItem: {label: string, value: string, checked: boolean}) => {
      const index = (filterData.value as FilterData).findIndex(item => item.field === key)
      if (index !== -1) {
        const item = (filterData.value as FilterData)[index]
        if (item.type === 'select') {
          const currentValue = item.values.find(i => i.value === currentItem.value)
          if (currentValue) {
            currentValue.checked = currentItem.checked
          } else {
            item.values.push(currentItem)
          }
        }
      }
    }
    provide('updateCheckedFilterDataValue', updateCheckedFilterDataValue)

    const filterVisible = ref(false)

    const cancelFilter = () => {
      filterVisible.value = false
    }

    const confirmFilter = () => {
      filterVisible.value = false
      const newConfig = {
        views: {
          default: {
            filter: filterData.value
          }
        }
      }
      // Store Settings
      setConfigByKey(configKey, newConfig)
    }

    const resetFilter = () => {
      /**
       * Reset Filter
       */
      queryAllFilter.value = {}
      filterData.value.forEach(field => {
        field.values = []
      })
    }

    const searchPoolpairOptions = () => {
      /**
       * Apply Filter Dialog Search
       */
      let choices = [] as any
      if (poolpairsResult.value.poolpairs) {
        choices = poolpairsResult.value.poolpairs.map((poolpair: string) => ({
          label: poolpair,
          value: poolpair
        }))
      }
      if (poolpairFilter.value === null) {
        poolpairChoices.value = choices
      } else {
        poolpairChoices.value = choices.filter((poolpair: { value: string }) => poolpair.value.toUpperCase().includes((poolpairFilter.value as string).toUpperCase()))
        filterData.value.find(field => field.field === 'symbol').choices = poolpairChoices.value
      }
    }

    watch(poolpairsResult, () => {
      searchPoolpairOptions()
    })

    watch(onError, (error) => {
      console.log('onError', error)
    })

    /**
     * Search Filter Dialog
     */
    const onSearch = (value: {field: string, value: string}) => {
      switch (value.field) {
        case 'symbol':
          poolpairFilter.value = value.value
          searchPoolpairOptions()
          break
      }
    }

    /**
     * Apply Filter
     */
    watch(() => filterData.value as FilterData, () => {
      const newFilter = {} as any
      if (filterData.value && filterData.value.length > 0) {
        for (const field of (filterData.value as FilterData)) {
          if (field.type === 'select') {
            switch (field.field) {
              case 'symbol':
                newFilter.symbol = field.values.filter(v => v.checked === true).map(v => v.value)
                break
            }
          } else if (field.type === 'date') {
            switch (field.field) {
              case 'createdAt':
                newFilter.createdAtLt = field.values.toDate
                newFilter.createdAtGte = field.values.fromDate
                break
            }
          }
        }
        if (newFilter.symbol && newFilter.symbol.length === 0) {
          delete newFilter.symbol
        }
        queryVars.value = { ...newFilter }
      }
    }, {
      deep: true
    })

    /**
     * Main Actions
     */
    const setMainActions = inject('setMainActions') as (actions: Action[]) => void
    const actions = [{
      name: 'Filter',
      icon: 'mdi-filter',
      active: true,
      hint: 'Filter',
      label: 'Filter',
      order: 1
    },
    {
      name: 'Refresh',
      icon: 'mdi-refresh',
      active: true,
      hint: 'Refresh',
      label: 'Refresh',
      order: 2
    }]
    setMainActions(actions)

    const actionCalled = inject('actionCalled') as {
      action: string,
      event: MouseEvent
    }
    watch(actionCalled, ({ action }) => {
      if (action === 'Filter') {
        filterVisible.value = true
      } else if (action === 'Refresh') {
        console.log('refresh')
        refetch()
      }
    })

    const configKey = `list.${uniqName}`

    onMounted(() => {
      /**
       * Load Config
       */
      const config = getConfigByKey(configKey)
      try {
        filterData.value = config?.views?.default?.filter || filterData.value
      } catch (error) {
        console.error(error)
      }
      queryListEnabled.value = true
    })

    return {
      datasets,
      labels,
      loading,
      // Filter
      filterVisible,
      cancelFilter,
      confirmFilter,
      resetFilter,
      onSearch
    }
  }
})
</script>
