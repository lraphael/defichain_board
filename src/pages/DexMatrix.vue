<template>
  <q-page class="">
    <div class="q-pa-md">
      <base-table
        :rows="rows"
        :loading="loading"
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
              colspan="1"
              class="bg-white"
            />
            <q-th
              colspan="4"
              class="bg-blue-2"
              style="z-index: 4;"
            >
              DEX
            </q-th>
            <q-th
              colspan="2"
              class="bg-green-2"
              style="z-index: 4;"
            >
              Oracle
            </q-th>
          </q-tr>
          <q-tr :props="props">
            <q-th
              key="token"
              :props="props"
            />
            <q-th
              key="dfi"
              :props="props"
            >
              DFI
            </q-th>
            <q-th
              key="dusd"
              :props="props"
            >
              dUSD
            </q-th>
            <q-th
              key="dusdc"
              :props="props"
            >
              dUSDC
            </q-th>
            <q-th
              key="dusdt"
              :props="props"
            >
              dUSDT
            </q-th>
            <q-th
              key="oracleActive"
              :props="props"
            >
              Active
            </q-th>
            <q-th
              key="oracleNext"
              :props="props"
            >
              Next
            </q-th>
          </q-tr>
        </template>

        <template #bottom>
          <div />
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
import BaseTable from 'src/components/BaseTable.vue'
import type { TableColumn } from 'src/components/BaseTable.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'

import { WhaleApiClient } from '@defichain/whale-api-client'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'

type Row = {
  token: string,
  dfi: string,
  dusd: string,
  dusdc: string
  dusdt: string,
  oracleActive: string,
  oracleNext: string
}

export default defineComponent({
  name: 'DusdPools',
  components: { BaseTable },
  setup () {
    const title = 'DEX Currency Matrix'
    const rows = ref([]) as any
    const stats = ref<StatsData | null>(null)
    const rewardsPerBlockDfiPairs = ref(0)
    const secondsToRefresh = ref(30)
    const loading = ref(false)

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
        name: 'token',
        label: '',
        field: (row: Row) => row.token,
        align: 'left',
        style: 'font-weight: bold;',
        sortable: false
      }, {
        name: 'dfi',
        label: 'DFI',
        field: (row: Row) => row.dfi,
        align: 'right',
        sortable: false
      }, {
        name: 'dusd',
        label: 'DUSD',
        field: (row: Row) => row.dusd,
        align: 'right',
        sortable: false
      }, {
        name: 'dusdc',
        label: 'DUSDC',
        field: (row: Row) => row.dusdc,
        align: 'right',
        sortable: false
      }, {
        name: 'dusdt',
        label: 'DUSDT',
        field: (row: Row) => row.dusdt,
        align: 'right',
        sortable: false
      }, {
        name: 'oracleActive',
        label: 'Active',
        field: (row: Row) => row.oracleActive,
        align: 'right',
        sortable: false
      }, {
        name: 'oracleNext',
        label: 'Next',
        field: (row: Row) => row.oracleNext,
        align: 'right',
        sortable: false
      }
    ] as TableColumn[]

    const oracleData = ref({}) as any
    const poolpairs = ref({}) as any
    const blocksToNextPrice = 120

    const currencies = ['DFI', 'DUSD', 'USDC', 'USDT']

    const getOraclePrices = async () => {
      for (const currency of currencies.filter((item) => item !== 'DUSD')) {
        const activeFeed = await client.prices.getFeedActive(currency, 'USD', 1)
        oracleData.value[currency] = {
          oracleActive: activeFeed[0].active?.amount,
          oracleNext: activeFeed[0].next?.amount,
          nextPriceBlock: activeFeed[0].block.height + blocksToNextPrice
        }
      }
    }

    const generateMatrix = () => {
      rows.value = []
      for (const currency of currencies) {
        if (currency === 'DFI') {
          rows.value.push({
            token: currency,
            dfi: 1,
            dusd: Number(poolpairs.value.DUSD.dfiPrice).toFixed(4),
            dusdc: Number(poolpairs.value.USDC.dfiPrice).toFixed(4),
            dusdt: Number(poolpairs.value.USDT.dfiPrice).toFixed(4),
            oracleActive: Number(oracleData.value[currency].oracleActive).toFixed(4),
            oracleNext: Number(oracleData.value[currency].oracleNext).toFixed(4)
          })
        } else if (currency === 'DUSD') {
          rows.value.push({
            token: `d${currency}`,
            dfi: Number(poolpairs.value.DUSD.tokenPrice).toFixed(4),
            dusd: 1,
            dusdc: Number(poolpairs.value.USDC.dfiPrice / poolpairs.value.DUSD.dfiPrice).toFixed(4),
            dusdt: Number(poolpairs.value.USDT.dfiPrice / poolpairs.value.DUSD.dfiPrice).toFixed(4),
            oracleActive: 1,
            oracleNext: 1
          })
        } else if (currency === 'USDC') {
          rows.value.push({
            token: `d${currency}`,
            dfi: Number(poolpairs.value.USDC.tokenPrice).toFixed(4),
            dusd: Number(poolpairs.value.DUSD.dfiPrice / poolpairs.value.USDC.dfiPrice).toFixed(4),
            dusdc: 1,
            dusdt: Number(poolpairs.value.USDT.dfiPrice / poolpairs.value.USDC.dfiPrice).toFixed(4),
            oracleActive: Number(oracleData.value[currency].oracleActive).toFixed(4),
            oracleNext: Number(oracleData.value[currency].oracleNext).toFixed(4)
          })
        } else if (currency === 'USDT') {
          rows.value.push({
            token: `d${currency}`,
            dfi: Number(poolpairs.value.USDT.tokenPrice).toFixed(4),
            dusd: Number(poolpairs.value.DUSD.dfiPrice / poolpairs.value.USDT.dfiPrice).toFixed(4),
            dusdc: Number(poolpairs.value.USDC.dfiPrice / poolpairs.value.USDT.dfiPrice).toFixed(4),
            dusdt: 1,
            oracleActive: Number(oracleData.value[currency].oracleActive).toFixed(4),
            oracleNext: Number(oracleData.value[currency].oracleNext).toFixed(4)
          })
        }
      }
    }

    const getPoolPairs = async () => {
      const res = await client.poolpairs.list()
      const dfiPools = res.filter(poolpair => poolpair.displaySymbol.includes('-DFI'))
      for (const pool of dfiPools) {
        const token = pool.symbol.split('-')[0]
        poolpairs.value[token] = {
          dfiPrice: pool.priceRatio.ab,
          tokenPrice: pool.priceRatio.ba,
          token: token
        }
      }
    }

    const getStats = async () => {
      loading.value = true
      const res = await client.stats.get()
      stats.value = res
      rewardsPerBlockDfiPairs.value = stats.value?.emission.dex

      await getOraclePrices()
      await getPoolPairs()
      await generateMatrix()
      secondsToRefresh.value = 30
      loading.value = false
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
      loading,
      secondsToRefresh
    }
  }
})
</script>
