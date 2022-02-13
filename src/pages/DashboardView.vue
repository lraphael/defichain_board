<template>
  <div class="row q-gutter-md q-pa-md">
    <div>
      <base-dashboard-card
        :uniq-name="'card1'"
        :style="{height: '130px', width: '180px'}"
        :loading="loading"
        @click="openURL('https://defiscan.live/')"
      >
        <template #title>
          Latest Block
        </template>

        <template #content>
          <q-list>
            <q-item clickable>
              <q-item-section>
                <q-item-label class="text-h5">
                  {{ blockHeight }}
                </q-item-label>
                <q-item-label caption>
                  {{ lastBlock }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </base-dashboard-card>
    </div>

    <div>
      <base-dashboard-card
        :uniq-name="'nextPriceBlock'"
        :style="{height: '130px', width: '180px'}"
        :loading="loading"
      >
        <template #title>
          Next Price Block
        </template>

        <template #content>
          <q-list>
            <q-item clickable>
              <q-item-section>
                <q-item-label class="text-h5">
                  {{ nextPriceBlock }}
                </q-item-label>
                <q-item-label caption>
                  {{ timeToNextPriceBlock }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </base-dashboard-card>
    </div>

    <div>
      <base-dashboard-card
        :uniq-name="'price'"
        :style="{height: '130px', width: '180px'}"
        :loading="loading"
      >
        <template #title>
          Price DFI
        </template>

        <template #content>
          <q-list>
            <q-item clickable>
              <q-item-section>
                <q-item-label class="text-h5">
                  ${{ stats?.price.usd.toLocaleString() }}
                </q-item-label>
                <q-item-label caption>
                  USD
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </base-dashboard-card>
    </div>

    <div>
      <base-dashboard-card
        :uniq-name="'price'"
        :style="{height: '130px', width: '180px'}"
        :loading="loading"
      >
        <template #title>
          Total Burned
        </template>

        <template #content>
          <q-list>
            <q-item clickable>
              <q-item-section>
                <q-item-label class="text-h6">
                  {{ (stats?.burned.total / 1000000).toFixed(2) }} M
                </q-item-label>
                <q-item-label caption>
                  DFI
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </base-dashboard-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, inject, onBeforeUnmount } from 'vue'
import { WhaleApiClient } from '@defichain/whale-api-client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import BaseDashboardCard from 'src/components/BaseDashboardCard.vue'
import { openURL } from 'quasar'
import { StatsData } from '@defichain/whale-api-client/dist/api/stats'
import type { Action } from 'src/layouts/DashboardLayout.vue'

dayjs.extend(relativeTime)

export default defineComponent({
  name: 'DashboardView',
  components: {
    BaseDashboardCard
  },
  setup () {
    const client = new WhaleApiClient({
      url: 'https://ocean.defichain.com',
      timeout: 60000,
      version: 'v0',
      network: 'mainnet'
    })
    const setFooterContent = inject('setFooterContent') as (text: string) => void

    const loading = ref(false)
    const secondsToRefresh = ref(30)
    // Stats
    const stats = ref<StatsData | null>(null)
    // Last Block
    const lastBlock = ref(null) as any
    const blockHeight = ref(null) as any
    // Next Price Block
    const nextPriceBlock = ref(null) as any
    const timeToNextPriceBlock = ref(null) as any
    const BlocksToNextPriceBlock = 120

    const updateCounter = () => {
      secondsToRefresh.value--
      setFooterContent(`Autorefresh in ${secondsToRefresh.value} seconds`)
    }

    const getStats = async () => {
      loading.value = true

      // Stats
      stats.value = await client.stats.get()

      // Latest Block
      const out = await client.blocks.list(1)
      blockHeight.value = out[0].height
      lastBlock.value = dayjs(out[0].time * 1000).fromNow()

      // Next Price Block
      const DfiDusdOracleData = await client.prices.getFeedActive('DFI', 'USD', 1)
      nextPriceBlock.value = DfiDusdOracleData[0].block.height + BlocksToNextPriceBlock
      const minutesToNextPriceBlock = (nextPriceBlock.value - blockHeight.value) / 2
      timeToNextPriceBlock.value = dayjs().add(minutesToNextPriceBlock, 'minutes').fromNow()

      secondsToRefresh.value = 30
      loading.value = false
    }

    getStats()

    const autorefresh = setInterval(() => {
      updateCounter()
    }, 1000)

    watch(secondsToRefresh, () => {
      if (secondsToRefresh.value <= 0) {
        secondsToRefresh.value = 30
        getStats()
      }
    })

    onBeforeUnmount(() => {
      clearInterval(autorefresh)
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
      lastBlock,
      blockHeight,
      openURL,
      stats,
      loading,
      nextPriceBlock,
      timeToNextPriceBlock
    }
  }
})
</script>
