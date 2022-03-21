<template>
  <base-widget-date-input
    :label="'From'"
    :field="$props.field"
    :value="fromDate"
    @update:model-value="onUpdateFromDate"
  />
  <base-widget-date-input
    :label="'To'"
    :field="$props.field"
    :value="toDate"
    @update:model-value="onUpdateToDate"
  />
</template>

<script lang="ts">
import { defineComponent, inject, computed, Ref, ref, onMounted } from 'vue'

import BaseWidgetDateInput from 'src/components/BaseWidgetDateInput.vue'

export default defineComponent({
  name: 'BaseFilterSelectionDateRange',
  components: {
    'base-widget-date-input': BaseWidgetDateInput
  },
  props: {
    field: { type: String, required: true }
  },
  setup (props) {
    const fromDate = ref<null | string>(null)
    const toDate = ref<null | string>(null)

    const filterData = inject('filterData') as Ref<any[]>
    const setFilterDataDateValue = inject('setFilterDataDateValue') as (key: string, values: { fromDate: string, toDate: string }) => void

    const filterOption = computed(() => {
      if (filterData && filterData.value.length > 0 && props.field) {
        return filterData.value.find(item => item.field === props.field)
      }
      return null
    })

    onMounted(() => {
      if (filterOption.value?.values.fromDate) {
        fromDate.value = filterOption.value.values.fromDate
      }
      if (filterOption.value?.values.toDate) {
        toDate.value = filterOption.value.values.toDate
      }
    })

    const onUpdate = (data: { value: string, field: string, name: 'fromDate' | 'toDate' }) => {
      const filter = { fromDate: '', toDate: '' }
      if (filterOption.value?.values.fromDate) {
        filter.fromDate = filterOption.value.values.fromDate
      }
      if (filterOption.value?.values.toDate) {
        filter.toDate = filterOption.value.values.toDate
      }
      filter[data.name] = data.value
      fromDate.value = filter.fromDate
      toDate.value = filter.toDate
      setFilterDataDateValue(props.field, filter)
    }

    return {
      fromDate,
      toDate,
      onUpdateFromDate: (value: string) => onUpdate({ value: value, field: props.field, name: 'fromDate' }),
      onUpdateToDate: (value: string) => onUpdate({ value: value, field: props.field, name: 'toDate' })
    }
  }
})
</script>
