<template>
  <q-item
    v-ripple
    style="width: 100%"
    clickable
    @click="showFilterSelection(filterOption)"
  >
    <q-item-section>{{ filterOption.label }}</q-item-section>
    <q-item-section avatar>
      <q-icon name="mdi-chevron-right" />
    </q-item-section>
  </q-item>
  <span
    v-if="filterOption?.type === 'select'"
  >
    <q-chip
      v-for="(value, index) in filterOption.values"
      :key="index"
      removable
      @remove="chipCancelClick(filterOption, value)"
    >
      {{ value.label }}
    </q-chip>
  </span>
  <span
    v-else-if="filterOption?.type === 'select-single' && filterOption.values.label"
  >
    <q-chip
      removable
      @remove="singleSelectChipCancelClick(filterOption)"
    >
      {{ filterOption.values.label }}
    </q-chip>
  </span>
  <span
    v-else-if="filterOption?.type==='date'"
  >
    <q-chip
      v-for="(value, index) in getFromToDates()"
      :key="index"
      removable
      @remove="dateChipCancelClick(value.value)"
    >
      {{ value.label }}
    </q-chip>
  </span>
  <span
    v-else-if="filterOption?.type==='input' && filterOption.values"
  >
    <q-chip
      removable
      @remove="singleSelectChipCancelClick(filterOption)"
    >
      {{ filterOption.values }}
    </q-chip>
  </span>
  <q-separator />
</template>

<script lang="ts">
import { defineComponent, inject, computed, Ref } from 'vue'

import type { FilterData } from 'src/components/filter/BaseFilterDialog.vue'

export default defineComponent({
  name: 'BaseFilterDialogListItem',
  props: {
    field: { type: String, required: true }
  },
  emits: ['showFilterSelection', 'chipCancelClick'],
  setup (props, context) {
    const filterData = inject('filterData') as Ref<any[]>
    const setFilterDataDateValue = inject('setFilterDataDateValue') as (key: string, values: { fromDate: string, toDate: string }) => void
    const filterOption = computed(() => {
      if (filterData && filterData.value.length > 0 && props.field) {
        return filterData.value.find((item: { field: string }) => item.field === props.field)
      }
      return null
    })

    const showFilterSelection = (evt: any) => {
      context.emit('showFilterSelection', evt)
    }

    const setFilterDataValues = inject('setFilterDataValues') as (field: string, values: any[] | any) => void
    const chipCancelClick = (filterOption: FilterData[0], value: {label: string, value: string}) => {
      if (filterOption.type === 'select') {
        const values = filterOption.values.filter(item => item.value !== value.value)
        setFilterDataValues(filterOption.field, values)
      }
    }

    const singleSelectChipCancelClick = (filterOption: FilterData[0]) => {
      if (filterOption.type === 'select-single') {
        setFilterDataValues(filterOption.field, {})
      } else if (filterOption.type === 'input') {
        setFilterDataValues(filterOption.field, null)
      }
    }

    const dateChipCancelClick = (key: string) => {
      const currentValues = filterOption.value.values
      currentValues[key] = null
      setFilterDataDateValue(props.field, currentValues)
    }

    const getFromToDates = () => {
      const items = []
      if (filterOption.value.values.fromDate) {
        items.push({ label: `From: ${filterOption.value.values.fromDate}`, value: 'fromDate' })
      }
      if (filterOption.value.values.toDate) {
        items.push({ label: `To: ${filterOption.value.values.toDate}`, value: 'toDate' })
      }
      return items
    }

    const getHumanDate = (date?: string) => {
      return date
    }

    return {
      showFilterSelection,
      getHumanDate,
      dateChipCancelClick,
      chipCancelClick,
      singleSelectChipCancelClick,
      getFromToDates,
      filterOption
    }
  }
})
</script>
