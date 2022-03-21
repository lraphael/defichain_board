<template>
  <span>
    <q-list
      ref="itemList"
    >
      <q-virtual-scroll
        style="max-height: 300px;"
        :items="localItems"
      >
        <template #default="{ item, index }">
          <q-item
            :key="index"
            clickable
            dense
            @click="checkBoxCheck(item)"
          >
            <q-btn
              clickable
              flat
              unelevated
              @click="itemClickAndFilter(item)"
            >
              <q-icon name="mdi-filter-variant" />
            </q-btn>
            <q-btn
              flat
              no-wrap
              unelevated
              class="full-width"
              align="left"
            >
              {{ item.label }}
            </q-btn>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-list>
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, Ref, inject } from 'vue'

export type Item = {
  label: string
  value: string
}

export default defineComponent({
  name: 'BaseFilterSelectionSingle',
  props: {
    field: { type: String, required: true }
  },
  emits: ['applyFilterAndClose', 'confirm'],
  setup (props, context) {
    const filterData = inject('filterData') as Ref<any[]>
    const currentFilterData = computed(() => {
      return filterData.value.find((item: { field: string }) => item.field === props.field)
    })
    const localItems = ref<Item[]>([])

    const isChecked = (item: Item) => {
      if (currentFilterData.value && currentFilterData.value.values.find((value: { value: string; checked: boolean }) => (value.value === item.value && value.checked === true))) {
        return true
      }
      return false
    }

    onMounted(() => {
      if (currentFilterData.value) {
        localItems.value = currentFilterData.value.choices.map((item: { label: any; value: any }) => {
          return {
            label: item.label,
            value: item.value
          }
        })
      }
    })

    const checkBoxCheck = (item: Item) => {
      currentFilterData.value.values = item
      context.emit('confirm')
    }

    const itemClickAndFilter = (item: Item) => {
      checkBoxCheck(item)
      context.emit('applyFilterAndClose')
    }

    return {
      localItems,
      isChecked,
      checkBoxCheck,
      itemClickAndFilter
    }
  }
})
</script>

<style scoped>
.line-break {
  white-space: normal;
}
</style>
