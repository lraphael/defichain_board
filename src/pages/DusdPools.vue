<template>
  <q-page class="">
    <div class="q-pa-md">
      <base-table
        :key="`${sortedRows.length}-${sortBy}-${descending}`"
        class="my-sticky-header-column-table"
        :show-as-grid="showAsGrid"
        :rows="sortedRows"
        :columns="configuredOrderedColumns"
        :visible-columns="configuredVisibleColumns"
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
              v-if="countFirstEmptyColumns"
              :colspan="countFirstEmptyColumns"
              class="bg-white"
            />
            <q-th
              v-if="countOracleColumns"
              :colspan="countOracleColumns"
              class="bg-blue-2"
              style="z-index: 4;"
            >
              Oracle
            </q-th>
            <q-th
              v-if="countDexColumns"
              :colspan="countDexColumns"
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
              Rewards
            </q-th>
            <q-th
              key="apr"
              :props="props"
            >
              APR
            </q-th>
            <q-th
              key="apy"
              :props="props"
            >
              APY [Weekly]
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
  <base-table-config-dialog
    v-if="showGridConfigDialog"
    :visible="showGridConfigDialog"
    :columns="visibleColumns"
    @cancel="showGridConfigDialog=false"
    @confirm="onGridConfigConfirm"
  />
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, onBeforeUnmount, onMounted, computed } from 'vue'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'
import BaseTableConfigDialog from 'src/components/BaseTableConfigDialog.vue'
import { getConfigByKey, setConfigByKey } from 'src/composables/useUserData'
import BaseTable from 'src/components/BaseTable.vue'

import type { TableColumn, requestData } from 'src/components/BaseTable.vue'
import type { Action } from 'src/layouts/DashboardLayout.vue'
import type { ColumnType } from 'src/components/BaseTableConfigDialog.vue'

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
  components: { BaseTable, BaseTableConfigDialog },
  setup () {
    const title = 'DUSD Pools'
    const uniqName = 'DusdPools'
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
      'dTSLA-DUSD': 3.8,
      'dGME-DUSD': 2.0,
      'dBABA-DUSD': 1.28,
      'dGOOGL-DUSD': 1.19,
      'dAAPL-DUSD': 2.69,
      'dPLTR-DUSD': 1.29,
      'dARKK-DUSD': 1.37,
      'dSPY-DUSD': 6.77,
      'dQQQ-DUSD': 4.3,
      'dGLD-DUSD': 0.47,
      'dSLV-DUSD': 0.51,
      'dPDBC-DUSD': 0.42,
      'dVNQ-DUSD': 0.49,
      'dURTH-DUSD': 0.37,
      'dTLT-DUSD': 0.71,
      'dAMZN-DUSD': 2.23,
      'dNVDA-DUSD': 2.51,
      'dEEM-DUSD': 0.69,
      'dCOIN-DUSD': 1.93,
      'dMSFT-DUSD': 1.82,
      'dNFLX-DUSD': 1.37,
      'dFB-DUSD': 1.69,
      'dVOO-DUSD': 0.75,
      'dDIS-DUSD': 0.77,
      'dMCHI-DUSD': 0.63,
      'dMSTR-DUSD': 2.25,
      'dINTC-DUSD': 0.71,
      'dPYPL-DUSD': 1.08,
      'dKO-DUSD': 0.52,
      'dPG-DUSD': 0.52,
      'dBRK.B-DUSD': 0.53,
      'CS-DUSD': 0.58,
      'SAP-DUSD': 0.47,
      'GSG-DUSD': 0.49,
      'URA-DUSD': 0.8
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
        label: 'Rewards',
        field: (row: Row) => `${row.rewardsPercent.toFixed(2)}%`,
        align: 'right',
        sortable: true
      }, {
        name: 'apr',
        label: 'APR',
        field: (row: Row) => `${row.apr.toFixed(2)}%`,
        align: 'right',
        sortable: true
      }, {
        name: 'apy',
        label: 'APY [Weekly]',
        field: (row: Row) => `${(Number(Math.pow(1 + (row.apr / 100 / 52), 52) - 1) * 100).toFixed(2)}%`,
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
     * Columns order and visibility
     */
    const showGridConfigDialog = ref(false)
    const visibleColumns = ref<ColumnType[]>([])
    const configKey = `list.${uniqName}`

    onMounted(() => {
      const config = getConfigByKey(configKey)

      try {
        visibleColumns.value = config.views.default.columns
        // columns count changed
        if (visibleColumns.value.length !== columns.length) {
          // adding new columns to the correct position
          for (const [i, column] of columns.entries()) {
            if (!visibleColumns.value.find(c => c.name === column.name)) {
              const newColumn = {
                name: column.name,
                label: column.label,
                field: column.field,
                align: column.align,
                sortable: column.sortable,
                enabled: true
              }
              visibleColumns.value.splice(i, 0, newColumn)
            }
          }
        }
        if (config.views.default.sort.orderBy) {
          sortBy.value = config.views.default.sort.orderBy as string
          descending.value = config.views.default.sort.descending as boolean
        }
      } catch (error) {
        console.log(error)
        for (const column of columns) {
          visibleColumns.value.push({
            name: column.name,
            label: column.label,
            enabled: !column.hide
          })
        }
      }
    })

    const configuredVisibleColumns = computed(() => {
      return visibleColumns.value.filter(item => item.enabled).map(item => item.name)
    })

    const configuredOrderedColumns = computed(() => {
      const orderedColumns = [] as ColumnType[]
      for (const item of visibleColumns.value) {
        const foundItem = (columns as any).find((column: { name: string }) => column.name === item.name) as any
        orderedColumns.push(foundItem)
      }
      return orderedColumns
    })

    const onGridConfigConfirm = (columns: ColumnType[]) => {
      visibleColumns.value = columns
      showGridConfigDialog.value = false
      // TODO: Filter
      const newConfig = {
        views: {
          default: {
            filter: null,
            columns: columns,
            sort: {
              orderBy: sortBy.value,
              descending: descending.value
            }
          }
        }
      }
      setConfigByKey(configKey, newConfig)
    }

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
      const res = await client.poolpairs.list(100)
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
            dexpricePremium: Number(dexpriceDUSD) * 100 / Number(oracleActive) - 100,
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
      order: 3
    }, {
      name: 'showAsGrid',
      icon: 'mdi-table',
      active: true,
      hint: 'Table / Cards',
      label: 'Table / Cards',
      order: 2
    }, {
      name: 'tableSettings',
      icon: 'mdi-table-cog',
      active: true,
      hint: 'Column Settings',
      label: 'Column Setting',
      order: 1
    }]

    setMainActions(actions)

    const actionCalled = inject('actionCalled') as {
      action: string,
      event: MouseEvent
    }
    watch(actionCalled, ({ action }) => {
      switch (action) {
        case 'Refresh':
          getStats()
          break
        case 'showAsGrid':
          showAsGrid.value = !showAsGrid.value
          break
        case 'tableSettings':
          showGridConfigDialog.value = true
          break
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

    /**
     * Calculate Header Columns
     */
    const countOracleColumns = computed(() => {
      return configuredVisibleColumns.value.filter((item) => item.includes('oracle')).length
    })

    const countDexColumns = computed(() => {
      return configuredVisibleColumns.value.filter((item) => item.includes('dexprice')).length
    })

    const countFirstEmptyColumns = computed(() => {
      return configuredVisibleColumns.value.length - countOracleColumns.value - countDexColumns.value
    })

    return {
      showAsGrid,
      sortedRows,
      loading,
      rewardsPerBlockDusdPairs,
      onRequest,
      sortBy,
      descending,
      // Header
      countFirstEmptyColumns,
      countOracleColumns,
      countDexColumns,
      // Column Settings
      showGridConfigDialog,
      configuredOrderedColumns,
      visibleColumns,
      configuredVisibleColumns,
      onGridConfigConfirm

    }
  }
})
</script>
