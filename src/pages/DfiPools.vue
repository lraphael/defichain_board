<template>
  <q-page class="">
    <div class="q-pa-md">
      <base-table
        :loading="loading"
        :rows="rows"
        :columns="columns"
        :row-key="'pair'"
        :rows-per-page="0"
        :full-heigth="false"
        class="my-sticky-header-column-table"
      >
        <template #body-cell-dexpriceDFI="scope">
          <td
            class="text-right"
            style="border-right-width: 1px; width: 120px;"
          >
            {{ scope.row.dexpriceDFI }} {{ scope.row.pair.split('-')[0] }}
          </td>
        </template>

        <template #body-cell-dexpriceToken="scope">
          <td
            class="text-right"
            style="border-right-width: 1px; width: 120px;"
          >
            {{ scope.row.dexpriceToken }} {{ scope.row.pair.split('-')[1] }}
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
import type { TableColumn } from 'src/components/BaseTable.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'

import { WhaleApiClient } from '@defichain/whale-api-client'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'

type Row = {
  pair: string,
  liquidity: string,
  rewardsPercent: string,
  rewardsPerBlock: string
  dexpriceDFI: number,
  dexpriceToken: number,
  apr: string
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

    const columns = [
      {
        name: 'pair',
        label: 'Pair',
        field: (row: Row) => row.pair,
        align: 'left',
        sortable: false
      }, {
        name: 'liquidity',
        label: 'Liquidity [USD]',
        field: (row: Row) => row.liquidity,
        align: 'right',
        sortable: false
      }, {
        name: 'rewardsPerBlock',
        label: 'Rewards [Block]',
        field: (row: Row) => `${row.rewardsPerBlock} DFI`,
        align: 'right',
        sortable: false
      }, {
        name: 'rewardsPercent',
        label: 'Rewards [%]',
        field: (row: Row) => `${Number(row.rewardsPercent).toFixed(2)}%`,
        align: 'right',
        sortable: false
      }, {
        name: 'dexpriceDFI',
        label: 'Dex Price [1 DFI]',
        field: (row: Row) => {
          if (row.dexpriceDFI < 0.0001) {
            return row.dexpriceDFI.toFixed(8)
          } else {
            if (row.dexpriceDFI < 10) {
              return row.dexpriceDFI.toFixed(4)
            } else {
              return row.dexpriceDFI.toFixed(2)
            }
          }
        },
        align: 'right',
        sortable: false
      }, {
        name: 'dexpriceToken',
        label: 'Dex Price [1 Token]',
        field: (row: Row) => {
          if (row.dexpriceToken < 0.0001) {
            return row.dexpriceToken.toFixed(8)
          } else {
            if (row.dexpriceToken < 10) {
              return row.dexpriceToken.toFixed(4)
            } else {
              return row.dexpriceToken.toFixed(2)
            }
          }
        },
        align: 'right',
        sortable: false
      }, {
        name: 'apr',
        label: 'APR',
        field: (row: Row) => `${row.apr}%`,
        align: 'right',
        sortable: false
      }
    ] as TableColumn[]

    const getPoolPairs = async () => {
      const res = await client.poolpairs.list()
      res.filter(r => r.displaySymbol.includes('DFI')).forEach(r => {
        rows.value.push({
          pair: r.displaySymbol,
          liquidity: Number(r.totalLiquidity.usd).toFixed(0),
          rewards: parseFloat(r.rewardPct) * 100,
          rewardsPercent: parseFloat(r.rewardPct) * 100,
          rewardsPerBlock: (rewardsPerBlockDfiPairs.value * parseFloat(r.rewardPct)).toFixed(2),
          dexprice: parseFloat(r.priceRatio.ab),
          dexpriceDFI: parseFloat(r.priceRatio.ab),
          dexpriceToken: parseFloat(r.priceRatio.ba),
          apr: ((r.apr?.total as number) * 100).toFixed(2)
        })
      })
    }

    const getStats = async () => {
      loading.value = true
      rows.value = []
      const res = await client.stats.get()
      stats.value = res
      rewardsPerBlockDfiPairs.value = stats.value?.emission.dex

      await getPoolPairs()
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
      }
    })

    return {
      rows,
      columns,
      rewardsPerBlockDfiPairs,
      secondsToRefresh,
      loading
    }
  }
})
</script>
