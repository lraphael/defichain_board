<template>
  <base-dashboard-card
    :loading="$props.loading"
  >
    <template #title>
      <slot name="title" />
    </template>
    <template #content>
      <div style="position: relative; width: 100%; padding: 0px; cursor: 'pointer';">
        <slot name="chart" />
      </div>
    </template>
  </base-dashboard-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseDashboardCard from 'src/components/BaseDashboardCard.vue'

export default defineComponent({
  name: 'BaseDashboardChart',
  components: {
    BaseDashboardCard
  },
  props: {
    loading: { type: Boolean, required: false, defualt: false }
  }
})
</script>
