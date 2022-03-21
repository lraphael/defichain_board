<template>
  <q-card>
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title class="font-weight-medium">
        {{ title }}
      </q-toolbar-title>
      <!-- Search -->
      <q-input
        v-if="currentFilterData?.type.includes('select')"
        v-model="search"
        class="GNL__toolbar-input"
        outlined
        dense
        label-color="white"
        color="white"
        dark
        bg-color="primary"
        placeholder="Search"
      >
        <template #prepend>
          <q-icon
            v-if="search === ''"
            color="white"
            name="search"
          />
          <q-icon
            v-else
            name="clear"
            class="cursor-pointer"
            @click="search = ''"
          />
        </template>
      </q-input>
    </q-toolbar>
    <q-card-section class="q-pt-none">
      <selection-type-date-range
        v-if="currentFilterData?.type === 'date'"
        :key="`${currentFilterData.field}_date`"
        :field="currentFilterData.field"
      />
      <selection-type-single-select
        v-else-if="currentFilterData?.type === 'select-single'"
        :key="`${currentFilterData?.field}_single`"
        :field="currentFilterData.field"
        @confirm="confirmFilterSelection"
        @apply-filter-and-close="applyFilterAndClose"
      />
      <selection-type-multi-select
        v-else-if="currentFilterData?.type === 'select'"
        :key="`${currentFilterData.field}_multi`"
        :field="currentFilterData.field"
        @apply-filter-and-close="applyFilterAndClose"
      />
      <selection-type-input
        v-else-if="currentFilterData?.type === 'input'"
        :key="`${currentFilterData.field}_input`"
        :field="currentFilterData.field"
        @apply-filter-and-close="applyFilterAndClose"
      />
    </q-card-section>
    <q-card-actions
      align="right"
    >
      <q-btn
        flat
        @click.stop="cancelFilterSelection()"
      >
        Cancel
      </q-btn>
      <q-btn
        v-if="currentFilterData?.type === 'select' || currentFilterData?.type === 'input' || currentFilterData?.type === 'date'"
        flat
        @click.stop="confirmFilterSelection()"
      >
        Confirm
      </q-btn>
      <q-btn
        v-if="currentFilterData?.type === 'select' || currentFilterData?.type === 'input' || currentFilterData?.type === 'date'"
        flat
        @click.stop="applyFilterAndClose()"
      >
        Filter
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, inject, computed, Ref, ref, watch } from 'vue'
import BaseFilterSelectionSingle from 'src/components/filter/BaseFilterSelectionSingle.vue'
import BaseFilterSelectionMultiSelect from 'src/components/filter/BaseFilterSelectionMultiSelect.vue'
import BaseFilterSelectionDateRange from 'src/components/filter/BaseFilterSelectionDateRange.vue'
import BaseFilterSelectionInput from 'src/components/filter/BaseFilterSelectionInput.vue'

export type FilterDataItem = {
  name: string
  value: string
  checked: boolean
}

export default defineComponent({
  name: 'BaseFilterSelectionList',
  components: {
    'selection-type-date-range': BaseFilterSelectionDateRange,
    'selection-type-multi-select': BaseFilterSelectionMultiSelect,
    'selection-type-single-select': BaseFilterSelectionSingle,
    'selection-type-input': BaseFilterSelectionInput
  },
  props: {
    field: { type: String, required: true }
  },
  emits: ['cancel', 'confirm', 'applyFilterAndClose', 'search'],
  setup (props, context) {
    const filterData = inject('filterData') as Ref<any[]>
    const currentFilterData = computed(() => {
      return filterData.value.find(item => item.field === props.field)
    })
    const title = computed(() => {
      if (currentFilterData.value) {
        return currentFilterData.value.label
      }
      return ''
    })
    const cancelFilterSelection = () => {
      // Reset Search
      context.emit('search', { field: props.field, value: null })
      context.emit('cancel')
    }
    const confirmFilterSelection = () => {
      // Reset Search
      context.emit('search', { field: props.field, value: null })
      context.emit('confirm')
    }
    const applyFilterAndClose = async () => {
      // Reset Search
      context.emit('search', { field: props.field, value: null })
      context.emit('applyFilterAndClose')
    }

    /**
     * Search
     */
    let searchTimer: ReturnType<typeof setTimeout> | null = null
    const search = ref('')
    watch(search, () => {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
      searchTimer = setTimeout(() => {
        context.emit('search', { field: props.field, value: search.value })
      }, 200)
    })

    return {
      title,
      currentFilterData,
      search,
      confirm,
      cancelFilterSelection,
      confirmFilterSelection,
      applyFilterAndClose
    }
  }
})
</script>
