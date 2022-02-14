<template>
  <q-page class="">
    <div class="q-pa-md">
      <base-table
        :key="`${sortedRows.length}-${sortBy}-${descending}`"
        class="my-sticky-header-column-table"
        :show-as-grid="showAsGrid"
        :loading="loading"
        :rows="sortedRows"
        :columns="columns"
        :row-key="'pair'"
        :rows-per-page="0"
        :full-heigth="false"
        :descending="descending"
        :sort-by="sortBy"
        @request="onRequest"
      >
        <template #body-cell-dexpriceDFI="scope">
          <td
            class="text-right"
            style="border-right-width: 1px; width: 120px;"
          >
            {{ displayPrice(scope.row.dexpriceDFI) }} {{ scope.row.pair.split('-')[0] }}
          </td>
        </template>

        <template #body-cell-dexpriceToken="scope">
          <td
            class="text-right"
            style="border-right-width: 1px; width: 120px;"
          >
            {{ displayPrice(scope.row.dexpriceToken) }} {{ scope.row.pair.split('-')[1] }}
          </td>
        </template>

        <template #body-cell-liquidity="scope">
          <td
            class="text-right"
            style="border-right-width: 1px; width: 120px;"
          >
            {{ parseInt(scope.row.liquidity).toLocaleString() }}$
          </td>
        </template>

        <template #bottom>
          <div>
            Total DFI-Pool Rewards per Block: {{ rewardsPerBlockDfiPairs.toFixed(2) }} DFI
          </div>
          <q-space />
        </template>
      </base-table>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, onBeforeUnmount } from 'vue'
import BaseTable from 'src/components/BaseTable.vue'
import type { TableColumn, requestData } from 'src/components/BaseTable.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'

import { WhaleApiClient } from '@defichain/whale-api-client'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'

type Row = {
  pair: string,
  liquidity: number,
  rewardsPercent: number,
  rewardsPerBlock: number
  dexpriceDFI: number,
  dexpriceToken: number,
  apr: number
}

export default defineComponent({
  name: 'DfiPools',
  components: { BaseTable },
  setup () {
    const title = 'DFI Pools'
    const rows = ref([]) as any
    const stats = ref<StatsData | null>(null)
    const rewardsPerBlockDfiPairs = ref(0)
    const secondsToRefresh = ref(30)
    const loading = ref(false)
    // sorting
    const sortBy = ref<undefined | string>('liquidity')
    const descending = ref(true)
    // card or table
    const showAsGrid = ref(false)

    const setFooterContent = inject('setFooterContent') as (text: string) => void

    const client = new WhaleApiClient({
      url: 'https://ocean.defichain.com',
      timeout: 60000,
      version: 'v0',
      network: 'mainnet'
    })

    const updateCounter = () => {
      secondsToRefresh.value--
      setFooterContent(`Autorefresh in ${secondsToRefresh.value} seconds`)
    }

    const setMainTitle = inject('setMainTitle') as (title: string, subTitle?: string) => void
    setMainTitle(title)

    const displayPrice = (price: number) => {
      if (price < 0.0001) {
        return price.toFixed(8)
      } else {
        if (price < 10) {
          return price.toFixed(4)
        } else {
          return price.toFixed(2)
        }
      }
    }

    const columns = [
      {
        name: 'pair',
        label: 'Pair',
        field: (row: Row) => row.pair,
        align: 'left',
        sortable: true
      }, {
        name: 'liquidity',
        label: 'Liquidity [USD]',
        field: (row: Row) => row.liquidity.toLocaleString(),
        align: 'right',
        sortable: true
      }, {
        name: 'rewardsPerBlock',
        label: 'Rewards [Block]',
        field: (row: Row) => `${row.rewardsPerBlock.toFixed(2)} DFI`,
        align: 'right',
        sortable: true
      }, {
        name: 'rewardsPercent',
        label: 'Rewards [%]',
        field: (row: Row) => `${Number(row.rewardsPercent).toFixed(2)}%`,
        align: 'right',
        sortable: true
      }, {
        name: 'dexpriceDFI',
        label: 'Dex Price [1 DFI]',
        field: (row: Row) => {
          return displayPrice(row.dexpriceDFI)
        },
        align: 'right',
        sortable: true
      }, {
        name: 'dexpriceToken',
        label: 'Dex Price [1 Token]',
        field: (row: Row) => {
          return displayPrice(row.dexpriceToken)
        },
        align: 'right',
        sortable: true
      }, {
        name: 'apr',
        label: 'APR',
        field: (row: Row) => `${row.apr.toFixed(2)}%`,
        align: 'right',
        sortable: true
      }
    ] as TableColumn[]

    /**
     * Sorting
     */
    const sortedRows = ref([]) as any
    const applySorting = () => {
      if (!sortBy.value) {
        sortedRows.value = rows.value
        return
      }
      sortedRows.value = rows.value.sort((a: { [x: string]: number }, b: { [x: string]: number }) => {
        if (sortBy.value) {
          if (descending.value) {
            return a[sortBy.value] < b[sortBy.value] ? 1 : -1
          } else {
            return a[sortBy.value] > b[sortBy.value] ? 1 : -1
          }
        } else {
          return null
        }
      })
    }

    const getPoolPairs = async () => {
      const res = await client.poolpairs.list()
      const tmpRows = [] as Row[]
      res.filter(r => r.displaySymbol.includes('DFI')).forEach(r => {
        tmpRows.push({
          pair: r.displaySymbol,
          liquidity: Number(r.totalLiquidity.usd),
          rewardsPercent: parseFloat(r.rewardPct) * 100,
          rewardsPerBlock: (rewardsPerBlockDfiPairs.value * parseFloat(r.rewardPct)),
          dexpriceDFI: parseFloat(r.priceRatio.ab),
          dexpriceToken: parseFloat(r.priceRatio.ba),
          apr: ((r.apr?.total as number) * 100)
        })
      })
      rows.value = tmpRows
    }

    const getStats = async () => {
      loading.value = true
      rows.value = []
      const res = await client.stats.get()
      stats.value = res
      rewardsPerBlockDfiPairs.value = stats.value?.emission.dex

      await getPoolPairs()
      applySorting()
      secondsToRefresh.value = 30
      loading.value = false
    }

    getStats()

    const autorefresh = setInterval(() => {
      updateCounter()
    }, 1000)

    onBeforeUnmount(() => {
      clearInterval(autorefresh)
    })

    watch(secondsToRefresh, () => {
      if (secondsToRefresh.value <= 0) {
        secondsToRefresh.value = 30
        updateCounter()
        rows.value = []
        getStats()
      }
    })

    const setMainActions = inject('setMainActions') as (actions: Action[]) => void
    const actions = [{
      name: 'Refresh',
      icon: 'mdi-refresh',
      active: true,
      hint: 'Refresh',
      label: 'Refresh',
      order: 2
    }, {
      name: 'showAsGrid',
      icon: 'mdi-table',
      active: true,
      hint: 'Table / Cards',
      label: 'Table / Cards',
      order: 1
    }]
    setMainActions(actions)

    const actionCalled = inject('actionCalled') as {
      action: string,
      event: MouseEvent
    }
    watch(actionCalled, ({ action }) => {
      if (action === 'Refresh') {
        getStats()
      } else if (action === 'showAsGrid') {
        showAsGrid.value = !showAsGrid.value
      }
    })

    const onRequest = (data: requestData) => {
      // Sorting
      console.log('onRequest')
      if (data.pagination.sortBy) {
        if (data.pagination.descending !== undefined) {
          descending.value = data.pagination.descending
        }
        sortBy.value = data.pagination.sortBy
        applySorting()
      }
    }

    return {
      showAsGrid,
      displayPrice,
      sortedRows,
      descending,
      sortBy,
      columns,
      rewardsPerBlockDfiPairs,
      onRequest,
      loading
    }
  }
})
</script>
