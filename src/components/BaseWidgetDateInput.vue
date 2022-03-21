<template>
  <q-input
    :model-value="localDate"
    v-bind="$props.fieldOptions"
    :label="$props.label"
    @update:model-value="updateDateFromLocale($event)"
  >
    <template #append>
      <q-icon
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          ref="qDateProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :id="$props.field"
            :value="$props.value"
            :model-value="$props.value"
            mask="YYYY-MM-DD"
            @update:model-value="updateDateFromInternalFormat($event)"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                label="Close"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import dayjs from 'dayjs'

export default defineComponent({
  name: 'BaseWidgetDateInput',
  props: {
    label: { type: String, required: true },
    field: { type: String, required: true },
    value: { type: String || null || undefined, required: false, default: null },
    fieldOptions: { type: Object, required: false, default: () => ({}) }
  },
  emits: ['update:model-value'],
  setup (props, context) {
    const localDate = ref<string | null>(null)

    const getHumanReadableDate = () => {
      if (props.value) {
        const date = dayjs(props.value)
        // YYYY-MM-DD -> DD.MM.YYYY
        localDate.value = date.format('DD.MM.YYYY')
      } else {
        localDate.value = null
      }
    }

    let updateTimer: ReturnType<typeof setTimeout> | null = null
    const updateDateFromLocale = (dateString: string | number | null) => {
      // Format: MM.DD.YYYY
      // DD.MM.YYYY -> YYYY-MM-DD
      if (updateTimer) {
        clearTimeout(updateTimer)
      }
      if (dateString) {
        updateTimer = setTimeout(() => {
          if (dateString && typeof dateString === 'string') {
            const dateItems = dateString.split('.')
            const date = dayjs(`${dateItems[2]}-${dateItems[1]}-${dateItems[0]}`)
            if (date.isValid()) {
              console.log('is Valid')
              updateDateFromInternalFormat(date.format('YYYY-MM-DD'))
            }
          } else if (dateString === null) {
            updateDateFromInternalFormat(null)
          }
        }, 1000)
      } else if (dateString === null || dateString === '') {
        updateDateFromInternalFormat(null)
      }
    }

    const updateDateFromInternalFormat = (date: string | number | null) => {
      // Format: YYYY-MM-DD
      context.emit('update:model-value', date)
    }

    watch(() => props.value, () => {
      getHumanReadableDate()
    }, {
      immediate: true
    })

    return {
      localDate,
      updateDateFromLocale,
      updateDateFromInternalFormat
    }
  }
})
</script>
