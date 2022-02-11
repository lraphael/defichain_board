<template>
  <q-table
    v-model:selected="selected"
    v-model:pagination="pagination"
    binary-state-sort
    :rows-per-page-options="rowsPerPageOptions"
    :loading="$props.loading"
    :title="props.title"
    :visible-columns="$props.visibleColumns"
    :rows="visibleRows"
    :columns="props.columns"
    :row-key="props.rowKey"
    :grid="props.showAsGrid"
    :separator="'cell'"
    :style="getStyle"
    :virtual-scroll="$props.virtualScroll"
    class="my-sticky-header-column-table"
    @virtual-scroll="onVirtualScroll"
    @request="onRequest"
  >
    <template
      v-for="(_, slot) of $slots"
      #[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </q-table>
</template>

<script lang="ts">
import { ref, defineComponent, watch, computed, PropType } from 'vue'

export type requestData = {
  pagination: {
    page: number
    rowsPerPage: number
    rowsNumber: number
    sortBy: string | null
    descending: boolean
    }
  }

export type scrollData = {
  direction: 'increase' | 'decrease'
  field: string
  from: number
  index: number
  ref: any
  to: number
}

export type TableColumn = {
  name: string
  label: string
  align: string
  sortable: boolean
  sort: string
  width: string
  minWidth: string
  maxWidth: string
  fixed: boolean
  hide: boolean
  field: (row: any) => any
  formatter: (value: any, row: any, index: number) => any
  }

export default defineComponent({
  props: {
    title: { type: String, required: false, default: '' },
    loading: { type: Boolean, required: false, default: false },
    rows: { type: Array, required: true },
    columns: { type: Array as PropType<TableColumn[]>, required: true },
    rowKey: { type: [String, Function], required: false, default: 'name' },
    showAsGrid: { type: Boolean, required: false, default: false },
    totalCount: { type: Number, required: false, default: 0 },
    rowsPerPage: { type: Number, required: false, default: 100 },
    fullHeigth: { type: Boolean, required: false, default: true },
    page: { type: Number, required: false, default: 1 },
    descending: { type: Boolean, required: false, default: false },
    sortBy: { type: String, required: false, default: null },
    virtualScroll: { type: Boolean, required: false, default: false },
    visibleColumns: { type: Array, required: false, default: () => undefined }
  },
  emits: { onEditClick: null, requestData: null, virtualScroll: null },
  setup (props, context) {
    const selected = ref([])
    const visibleRows = ref<any>([])
    const loading = ref(false)
    const onEditClick = (item: any, event: MouseEvent) => {
      context.emit('onEditClick', { item, event })
    }

    const pagination = ref({
      page: props.page,
      rowsPerPage: props.rowsPerPage,
      rowsNumber: props.totalCount,
      descending: props.descending,
      sortBy: props.sortBy
    })

    function onRequest (tableProps: requestData) {
      /**
       * Emitte Request an den Server um die Daten zu laden
       */
      loading.value = true
      context.emit('requestData', tableProps)
    }

    watch(() => props.rows, () => {
      visibleRows.value = props.rows
      pagination.value = {
        page: props.page,
        rowsPerPage: props.rowsPerPage,
        rowsNumber: props.totalCount,
        descending: props.descending,
        sortBy: props.sortBy
      }
      loading.value = false
    },
    {
      immediate: true
    })

    const getStyle = computed(() => {
      if (props.fullHeigth === true) {
        return `height: ${window.innerHeight - 100}px`
      }
      return ''
    })

    const rowsPerPageOptions = computed(() => {
      if (props.virtualScroll) {
        return [0]
      }
      return [50, 100, 200, 300, 400, 500]
    })

    const onVirtualScroll = (data: scrollData) => {
      if (data.index === data.to && !loading.value && loading.value === false) {
        loading.value = true
        const pagination = {
          scrollData: data,
          pagination: {
            descending: false,
            page: props.page + 1,
            rowsNumber: props.rowsPerPage * props.page,
            rowsPerPage: props.rowsPerPage,
            sortBy: null
          }
        }
        context.emit('virtualScroll', pagination)
      }
    }

    return {
      selected,
      props,
      pagination,
      visibleRows,
      rowsPerPageOptions,

      onEditClick,
      onRequest,
      getStyle,

      onVirtualScroll
    }
  }
})
</script>

<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 100%

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 100%

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #fff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    /* 48 bei einer Zeile und 24 bei 2 Zeilen dense */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1
    background: #fff

  td:first-child, th:first-child
    position: sticky
    left: 0
</style>
