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
            <q-checkbox
              :model-value="isChecked(item)"
              color="gray"
              @click="checkBoxCheck(item)"
            />
            <q-btn
              clickable
              flat
              unelevated
              @click="itemClickAndFilter()"
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
import { defineComponent, ref, computed, onMounted, Ref, inject, watch } from 'vue'

export type Item = {
  label: string
  value: string
  checked?: boolean
}

export default defineComponent({
  name: 'BaseFilterSelectionMultiSelect',
  props: {
    field: { type: String, required: true }
  },
  emits: ['applyFilterAndClose', 'checkedItems'],
  setup (props, context) {
    const filterData = inject('filterData') as Ref<any[]>
    const updateCheckedFilterDataValue = inject('updateCheckedFilterDataValue') as (field: string, currentItem: {label: string, value: string, checked?: boolean}) => void
    const setFilterDataValues = inject('setFilterDataValues') as (field: string, values: any[]) => void
    const currentFilterData = computed(() => {
      return filterData.value.find((item: { field: string }) => item.field === props.field)
    })
    const filterOption = computed(() => {
      if (filterData && filterData.value.length > 0 && props.field) {
        return filterData.value.find((item: { field: string }) => item.field === props.field)
      }
      return null
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
            value: String(item.value),
            checked: isChecked(item as any)
          }
        })
      }
    })

    watch(currentFilterData, (newValue: any) => {
      // Refresh on Search
      if (newValue) {
        localItems.value = newValue.choices.map((item: { label: any; value: any }) => {
          return {
            label: item.label,
            value: String(item.value),
            checked: isChecked(item as any)
          }
        })
      }
    }, {
      deep: true
    })

    const checkBoxCheck = (item: Item) => {
      if (filterOption.value?.type === 'select') {
        if (item.checked === true) {
          const values = filterOption.value.values.filter((option: { value: string }) => option.value !== item.value)
          setFilterDataValues(filterOption.value.field, values)
        } else {
          item.checked = true
          updateCheckedFilterDataValue(props.field, item)
        }
      }
    }

    const itemClickAndFilter = () => {
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
