<template>
  <q-page class="">
    <div class="q-pa-md">
      <base-table
        :rows="rows"
        :columns="columns"
        :row-key="'pair'"
        :rows-per-page="0"
        :full-heigth="false"
        class="my-sticky-header-column-table"
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
          <div>
            Autorefresh in {{ secondsToRefresh }} seconds
          </div>
        </template>
      </base-table>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch } from 'vue'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'

import BaseTable from 'src/components/BaseTable.vue'

import type { TableColumn } from 'src/components/BaseTable.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'

type Row = {
  pair: string,
  liquidity: string,
  rewardsPercent: string,
  rewardsPerBlock: string
  dexpriceDUSD: number,
  dexpricePremium: number,
  oraclePriceActive: number,
  oraclePriceNext: number,
  apr: string
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

    const client = new WhaleApiClient({
      url: 'https://ocean.defichain.com',
      timeout: 60000,
      version: 'v0',
      network: 'mainnet'
    })

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
        name: 'apr',
        label: 'APR [%]',
        field: (row: Row) => `${row.apr}%`,
        align: 'right',
        sortable: false
      }, {
        name: 'oraclePriceActive',
        label: 'Active [USD]',
        field: (row: Row) => `${Number(row.oraclePriceActive).toFixed(2)}$`,
        align: 'right',
        sortable: false
      }, {
        name: 'oraclePriceNext',
        label: 'Next [USD]',
        field: (row: Row) => `${Number(row.oraclePriceNext).toFixed(2)}$`,
        align: 'right',
        sortable: false
      }, {
        name: 'dexpriceDUSD',
        label: 'Dex Price [DUSD]',
        field: (row: Row) => {
          return `${Number(row.dexpriceDUSD).toFixed(2)} DUSD`
        },
        align: 'right',
        sortable: false
      }, {
        name: 'dexpricePremium',
        label: 'Premium [%}',
        field: (row: Row) => {
          return `${row.dexpricePremium.toFixed(2)}%`
        },
        align: 'right',
        sortable: false
      }
    ] as TableColumn[]

    const getPoolPairs = async () => {
      const res = await client.poolpairs.list()
      res.filter(r => r.displaySymbol.includes('DUSD')).forEach(r => {
        let currency = r.symbol.split('-')[0]
        if (currency === 'DUSD') {
          currency = 'DFI'
        }

        client.prices.getFeedActive(currency, 'USD', 1).then(activeFeed => {
          const oracleActive = activeFeed[0].active?.amount
          const oracleNext = activeFeed[0].next?.amount
          const dexpriceDUSD = r.displaySymbol !== 'DUSD-DFI' ? r.priceRatio.ba : r.priceRatio.ab

          rows.value.push({
            pair: r.displaySymbol,
            liquidity: Number(r.totalLiquidity.usd).toFixed(0),
            rewardsPercent: parseFloat((poolRewards as any)[r.displaySymbol]),
            rewardsPerBlock: (rewardsPerBlockDusdPairs.value * parseFloat((poolRewards as any)[r.displaySymbol]) / 100).toFixed(2),
            dexpriceDUSD: dexpriceDUSD,
            dexpricePremium: Number(dexpriceDUSD) * 100 / Number(oracleActive),
            apr: ((r.apr?.total as number) * 100).toFixed(2),
            oraclePriceActive: oracleActive,
            oraclePriceNext: oracleNext
          })
          // }
        })
      })
    }
    const getStats = async () => {
      const res = await client.stats.get()
      stats.value = res
      rewardsPerBlockDusdPairs.value = stats.value?.emission.total * stockTokenRewardPercentage.value / 100

      getPoolPairs()
    }

    getStats()

    setInterval(() => {
      secondsToRefresh.value--
    }, 1000)

    watch(secondsToRefresh, () => {
      if (secondsToRefresh.value <= 0) {
        secondsToRefresh.value = 30
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
      rewardsPerBlockDusdPairs,
      secondsToRefresh
    }
  }
})
</script>
