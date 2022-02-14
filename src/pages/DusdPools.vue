<template>
  <q-page class="">
    <div class="q-pa-md">
      <base-table
        :key="`${sortedRows.length}-${sortBy}-${descending}`"
        class="my-sticky-header-column-table"
        :show-as-grid="showAsGrid"
        :rows="sortedRows"
        :columns="columns"
        :loading="loading"
        :row-key="'pair'"
        :rows-per-page="0"
        :full-heigth="false"
        :descending="descending"
        :sort-by="sortBy"
        @request="onRequest"
      >
        <template
          #header="props"
        >
          <q-tr :props="props">
            <q-th
              colspan="5"
              class="bg-white"
            />
            <q-th
              colspan="2"
              class="bg-blue-2"
              style="z-index: 4;"
            >
              Oracle
            </q-th>
            <q-th
              colspan="2"
              class="bg-green-2"
              style="z-index: 4;"
            >
              DEX
            </q-th>
          </q-tr>
          <q-tr :props="props">
            <q-th
              key="pair"
              :props="props"
            >
              Pair
            </q-th>
            <q-th
              key="liquidity"
              :props="props"
            >
              Liquidity [USD]
            </q-th>
            <q-th
              key="rewardsPerBlock"
              :props="props"
            >
              Rewards [Block]
            </q-th>
            <q-th
              key="rewardsPercent"
              :props="props"
            >
              Rewards [%]
            </q-th>
            <q-th
              key="apr"
              :props="props"
            >
              APR [%]
            </q-th>
            <q-th
              key="oraclePriceActive"
              :props="props"
            >
              Active [USD]
            </q-th>
            <q-th
              key="oraclePriceNext"
              :props="props"
            >
              Next [USD]
            </q-th>
            <q-th
              key="dexpriceDUSD"
              :props="props"
            >
              Price [DUSD]
            </q-th>
            <q-th
              key="dexpricePremium"
              :props="props"
            >
              Premium [%}
            </q-th>
          </q-tr>
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
            Total DUSD-Pool Rewards per Block: {{ rewardsPerBlockDusdPairs.toFixed(2) }} DFI
          </div>
          <q-space />
        </template>
      </base-table>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, onBeforeUnmount } from 'vue'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'

import BaseTable from 'src/components/BaseTable.vue'

import type { TableColumn, requestData } from 'src/components/BaseTable.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'

type Row = {
  pair: string,
  liquidity: number,
  rewardsPercent: number,
  rewardsPerBlock: number
  dexpriceDUSD: number,
  dexpricePremium: number,
  oraclePriceActive: number,
  oraclePriceNext: number,
  apr: number
}

export default defineComponent({
  name: 'DusdPools',
  components: { BaseTable },
  setup () {
    const title = 'DUSD Pools'
    const rows = ref([]) as any
    const stats = ref<StatsData | null>(null)
    const rewardsPerBlockDusdPairs = ref(0)
    const secondsToRefresh = ref(30)
    const stockTokenRewardPercentage = ref(24.68)
    const loading = ref(false)
    // sorting
    const sortBy = ref<undefined | string>('apr')
    const descending = ref(true)
    // card or table
    const showAsGrid = ref(false)

    const poolRewards = {
      'DUSD-DFI': 50,
      'dTSLA-DUSD': 7.04,
      'dQQQ-DUSD': 4.99,
      'dAAPL-DUSD': 3.68,
      'dGLD-DUSD': 0.72,
      'dPLTR-DUSD': 1.92,
      'dSLV-DUSD': 0.98,
      'dGME-DUSD': 3.08,
      'dGOOGL-DUSD': 1.69,
      'dSPY-DUSD': 7.93,
      'dARKK-DUSD': 2.16,
      'dVNQ-DUSD': 0.71,
      'dURTH-DUSD': 0.54,
      'dBABA-DUSD': 2.72,
      'dPDBC-DUSD': 0.52,
      'dTLT-DUSD': 1.02,
      'dEEM-DUSD': 1.05,
      'dAMZN-DUSD': 2.79,
      'dNVDA-DUSD': 3.68,
      'dCOIN-DUSD': 2.8
    }

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
        field: (row: Row) => `${row.rewardsPercent.toFixed(2)}%`,
        align: 'right',
        sortable: true
      }, {
        name: 'apr',
        label: 'APR [%]',
        field: (row: Row) => `${row.apr.toFixed(2)}%`,
        align: 'right',
        sortable: true
      }, {
        name: 'oraclePriceActive',
        label: 'Active [USD]',
        field: (row: Row) => `${Number(row.oraclePriceActive).toFixed(2)}$`,
        align: 'right',
        sortable: true
      }, {
        name: 'oraclePriceNext',
        label: 'Next [USD]',
        field: (row: Row) => `${Number(row.oraclePriceNext).toFixed(2)}$`,
        align: 'right',
        sortable: true
      }, {
        name: 'dexpriceDUSD',
        label: 'Dex Price [DUSD]',
        field: (row: Row) => {
          return `${Number(row.dexpriceDUSD).toFixed(2)} DUSD`
        },
        align: 'right',
        sortable: true
      }, {
        name: 'dexpricePremium',
        label: 'Premium [%}',
        field: (row: Row) => {
          return `${row.dexpricePremium.toFixed(2)}%`
        },
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
      const promises = [] as Promise<any>[]
      res.filter(r => r.displaySymbol.includes('DUSD')).forEach(r => {
        let currency = r.symbol.split('-')[0]
        if (currency === 'DUSD') {
          currency = 'DFI'
        }

        promises.push(client.prices.getFeedActive(currency, 'USD', 1).then(activeFeed => {
          const oracleActive = activeFeed[0].active?.amount
          const oracleNext = activeFeed[0].next?.amount
          const dexpriceDUSD = r.displaySymbol !== 'DUSD-DFI' ? r.priceRatio.ba : r.priceRatio.ab

          tmpRows.push({
            pair: r.displaySymbol,
            liquidity: Number(r.totalLiquidity.usd),
            rewardsPercent: parseFloat((poolRewards as any)[r.displaySymbol]),
            rewardsPerBlock: (rewardsPerBlockDusdPairs.value * parseFloat((poolRewards as any)[r.displaySymbol]) / 100),
            dexpriceDUSD: Number(dexpriceDUSD),
            dexpricePremium: Number(dexpriceDUSD) * 100 / Number(oracleActive),
            apr: ((r.apr?.total as number) * 100),
            oraclePriceActive: Number(oracleActive),
            oraclePriceNext: Number(oracleNext)
          })
        }))
      })
      Promise.all(promises).then(() => {
        rows.value = tmpRows
        applySorting()
      })
    }
    const getStats = async () => {
      loading.value = true
      const res = await client.stats.get()
      stats.value = res
      rewardsPerBlockDusdPairs.value = stats.value?.emission.total * stockTokenRewardPercentage.value / 100
      rows.value = []

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
      sortedRows,
      columns,
      loading,
      rewardsPerBlockDusdPairs,
      onRequest,
      sortBy,
      descending
    }
  }
})
</script>
