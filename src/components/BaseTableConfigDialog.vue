<template>
  <q-dialog
    v-model="$props.visible"
    persistent
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">
          Column Settings
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list
          bordered
          padding
        >
          <draggable
            v-model="allColumns"
            item-key="name"
            group="people"
            @start="drag=true"
            @end="drag=false"
          >
            <template #item="{element}">
              <q-item
                v-ripple
                tag="label"
                style="cursor: grab;"
              >
                <q-item-section
                  side
                  top
                >
                  <q-toggle v-model="element.enabled" />
                </q-item-section>

                <q-item-section style="cursor: grab;">
                  <q-item-label
                    style="cursor: grab;"
                  >
                    {{ element.label }}
                  </q-item-label>
                </q-item-section>
                <q-item-section
                  style="cursor: grab;"
                  avatar
                >
                  <q-icon
                    color="primary"
                    name="mdi-arrow-up-down"
                  />
                </q-item-section>
              </q-item>
            </template>
          </draggable>
        </q-list>
      </q-card-section>

      <q-card-actions
        align="right"
        class="text-primary"
      >
        <q-btn
          v-close-popup
          flat
          label="Cancel"
          @click="$emit('cancel')"
        />
        <q-btn
          flat
          label="Save"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import draggable from 'vuedraggable'

export type ColumnType = {
  name: string,
  label: string,
  enabled: boolean,
}

export default defineComponent({
  name: 'BaseTableConfigDialog',
  components: { draggable },
  props: {
    visible: { type: Boolean, required: true },
    columns: { type: Array as PropType<ColumnType[]>, required: true }
  },
  emits: ['confirm', 'cancel'],
  setup (props, context) {
    const allColumns = ref<ColumnType[]>([])
    // clone columns
    allColumns.value = JSON.parse(JSON.stringify(props.columns))
    const drag = false

    const confirm = () => {
      context.emit('confirm', [...allColumns.value])
    }

    return {
      drag,
      allColumns,

      confirm
    }
  }
})
</script>
