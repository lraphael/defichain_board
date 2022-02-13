<template>
  <q-card class="d">
    <q-card-section
      class="bg-primary q-pt-xs"
      style="height: 40px;"
    >
      <div class="col">
        <div
          class="text-subtitle1 text-white"
        >
          <slot name="title" />
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-md">
      <div class="row justify-center">
        <q-spinner
          v-if="loading"
          color="primary"
          size="3em"
        />
        <slot
          v-else
          name="content"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseDashboardCard',
  props: {
    loading: { type: Boolean, required: false, defualt: false }
  }
})
</script>
