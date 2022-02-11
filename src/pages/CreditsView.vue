<template>
  <q-page class="">
    <div class="q-pa-md">
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>
              Inspired by <a href="https://www.krypto-sprungbrett.com/stock-token-apr/" target="_blank">Krypto Sprungbrett</a>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>
              External Datasources
            </q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>jellyfish</q-item-label>
            <q-item-label caption>
              <a
                href="https://jellyfish.defichain.com/"
                target="_blank"
              >
                https://jellyfish.defichain.com/
              </a>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreditsView'
})
</script>
