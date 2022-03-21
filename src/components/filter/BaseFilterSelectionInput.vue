<template>
  <span>
    <q-input
      v-model="localValue"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, Ref, inject, watch } from 'vue'

export type Item = {
  label: string
  value: string
}

export default defineComponent({
  name: 'BaseFilterSelectionInput',
  props: {
    field: { type: String, required: true }
  },
  emits: ['applyFilterAndClose', 'confirm'],
  setup (props) {
    const filterData = inject('filterData') as Ref<any[]>
    const currentFilterData = computed(() => {
      return filterData.value.find((item: { field: string }) => item.field === props.field)
    })
    const localValue = ref<string>('')

    onMounted(() => {
      if (currentFilterData.value && currentFilterData.value.values) {
        localValue.value = currentFilterData.value.values
      }
    })

    let updateDelayTimer: ReturnType<typeof setTimeout> | null = null
    watch(localValue, (value: string) => {
      if (updateDelayTimer) {
        clearTimeout(updateDelayTimer)
      }
      updateDelayTimer = setTimeout(() => {
        currentFilterData.value.values = value
      }, 200)
    })

    return {
      localValue
    }
  }
})
</script>

<style scoped>
.line-break {
  white-space: normal;
}
</style>
