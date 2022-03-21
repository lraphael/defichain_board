<template>
  <q-dialog
    v-model="$props.visible"
  >
    <filter-dialog-list
      v-if="$props.visible"
      :title="$props.title"
      :active="$props.visible"
      @reset="reset"
      @cancel="cancel"
      @confirm="confirm"
      @search="$emit('search', $event)"
    />
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import BaseFilterDialogList from './BaseFilterDialogList.vue'

type FilterDataSelect = {
  label: string
  field: string
  type: 'select'
  choices: {
    label: string
    value: string | number | boolean
  }[]
  values: {
    label: string
    value: string | number | boolean
    checked?: boolean
  }[]
}[]

type FilterDataSelectSingle = {
  label: string
  field: string
  type: 'select-single'
  choices: {
    label: string
    value: string | number | boolean
  }[]
  values: {
    label: string
    value: string | number | boolean
    checked?: boolean
  }
}[]

type FilterDataDate = {
  label: string
  field: string
  type: 'date'
  values: {
    fromDate?: string | null
    toDate?: string | null
  }
}[]

type FilterDataInput = {
  label: string
  field: string
  type: 'input'
  values: string
}[]

export type FilterData = FilterDataSelect | FilterDataDate | FilterDataSelectSingle | FilterDataInput

export default defineComponent({
  name: 'BaseFilterDialog',
  components: {
    'filter-dialog-list': BaseFilterDialogList
  },
  props: {
    visible: { type: Boolean, required: true },
    title: { type: String, required: true },
    maxWidth: { type: String, required: false, default: '600px' }
  },
  emits: ['reset', 'cancel', 'confirm', 'search'],
  setup (props, context) {
    const reset = () => {
      context.emit('reset')
    }
    const cancel = () => {
      context.emit('cancel')
    }
    const confirm = () => {
      context.emit('confirm')
    }
    return {
      reset,
      cancel,
      confirm
    }
  }
})
</script>
