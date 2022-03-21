<template>
  <q-card
    v-if="!filterSelectionVisible"
    :style="{
      'width': '100%',
      'display': 'flex',
      'flex': '1 1 100%',
      'flex-direction': 'column',
    }"
  >
    <q-toolbar
      class="bg-primary text-white"
    >
      <q-toolbar-title
        class="font-weight-medium"
      >
        Filter: {{ $props.title }}
      </q-toolbar-title>
    </q-toolbar>

    <q-card-section
      class="q-pt-none"
      :style="{
        'flex': '1 1 auto',
        'overflow-y': 'auto'
      }"
    >
      <q-list
        separator
      >
        <filter-dialog-list-item
          v-for="(filterOption, i) in filterData"
          :key="`${i}_${reRender}_${filterOption.field}`"
          :field="filterOption.field"
          @show-filter-selection="showFilterSelection"
        />
      </q-list>
    </q-card-section>
    <q-card-actions
      align="right"
      :style="{
        'flex': '0 0 auto'
      }"
    >
      <q-btn
        flat
        @click="reset"
      >
        Reset
      </q-btn>
      <q-space />
      <q-btn
        flat
        @click="cancel"
      >
        Cancel
      </q-btn>
      <q-btn
        flat
        @click="confirm"
      >
        Filter
      </q-btn>
    </q-card-actions>
  </q-card>
  <filter-selection-list
    v-else-if="filterSelectionVisible"
    :field="selectedFilterOption.field"
    @cancel="filterSelectionCancel"
    @confirm="filterSelectionConfirm"
    @apply-filter-and-close="applyFilterAndClose"
    @search="$emit('search', $event)"
  />
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue'
import BaseFilterDialogListItem from './BaseFilterDialogListItem.vue'
import BaseFilterSelectionList from './BaseFilterSelectionList.vue'

import type { FilterData } from './BaseFilterDialog.vue'

export default defineComponent({
  name: 'BaseFilterDialogList',
  components: {
    'filter-dialog-list-item': BaseFilterDialogListItem,
    'filter-selection-list': BaseFilterSelectionList
  },
  props: {
    title: { type: String, required: true },
    maxWidth: { type: String, required: false, default: '600px' }
  },
  emits: ['cancel', 'confirm', 'reset', 'search'],
  setup (props, context) {
    const filterSelectionVisible = ref(false)
    const filterData = inject('filterData') as FilterData
    const selectedFilterOption = ref<any>({})
    const reRender = ref(0)
    const filterFieldOptions = ref([])
    const isLoading = ref(false)

    const setFilter = () => {
      filterSelectionVisible.value = false
    }

    const showFilterSelection = (filterOption: FilterData[0]) => {
      selectedFilterOption.value = filterOption
      filterSelectionVisible.value = true
    }

    const reset = () => {
      context.emit('reset')
    }

    const confirm = () => {
      context.emit('confirm')
    }

    const cancel = () => {
      filterSelectionVisible.value = false
      context.emit('cancel')
    }

    const applyFilterAndClose = async () => {
      context.emit('confirm', filterData)
      filterSelectionVisible.value = false
    }

    const filterSelectionConfirm = () => {
      filterSelectionVisible.value = false
    }

    const filterSelectionCancel = () => {
      filterSelectionVisible.value = false
    }

    return {
      filterSelectionVisible,
      selectedFilterOption,
      reRender,
      filterFieldOptions,
      filterData,
      isLoading,
      setFilter,
      showFilterSelection,
      reset,
      cancel,
      confirm,
      applyFilterAndClose,
      filterSelectionConfirm,
      filterSelectionCancel
    }
  }
})
</script>
