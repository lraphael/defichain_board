<template>
  <div class="row q-gutter-md q-pa-xs">
    <div class="q-pa-md">
      <q-card>
        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>
                  <q-icon>
                    <q-icon name="mdi-github" />
                  </q-icon>
                  Source
                </q-item-label>
                <q-item-label caption>
                  <a
                    href="https://github.com/lraphael/defichain_board"
                    target="_blank"
                  >
                    https://github.com/lraphael/defichain_board
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Jellyfish</q-item-label>
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
            <q-item>
              <q-item-section>
                <q-item-label>Quasar</q-item-label>
                <q-item-label caption>
                  <a
                    href="https://quasar.dev/"
                    target="_blank"
                  >
                    https://quasar.dev/
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>VueJS</q-item-label>
                <q-item-label caption>
                  <a
                    href="https://vuejs.org/"
                    target="_blank"
                  >
                    https://vuejs.org/
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>
                  Inspired by <a
                    href="https://www.krypto-sprungbrett.com/stock-token-apr/"
                    target="_blank"
                  >
                    Krypto Sprungbrett
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreditsView'
})
</script>
