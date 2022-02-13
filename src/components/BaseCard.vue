<template>
  <q-card
    :id="$props.uniqName"
  >
    <q-card-section>
      <div class="row items-center no-wrap">
        <div class="col">
          <div
            class="text-h6"
            @click="expanded=!expanded"
          >
            {{ $props.title }}
          </div>
          <slot name="subTitle" />
        </div>

        <div class="col-auto">
          <q-btn
            v-for="primaryAction in $props.primaryActions"
            :key="primaryAction.name"
            :icon="primaryAction.icon"
            :loading="primaryAction.loading"
            :disable="primaryAction.active === false"
            color="grey-7"
            round
            flat
            @click="actionClicked(primaryAction, $event)"
          >
            <span
              v-if="primaryAction.text"
            >
              {{ primaryAction.text }}
            </span>
            <q-tooltip>{{ primaryAction.hint }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="$props.secondaryActions && $props.secondaryActions.length > 0"
            color="grey-7"
            round
            flat
            icon="more_vert"
          >
            <q-menu
              auto-close
            >
              <q-list>
                <q-item
                  v-for="secondaryAction in $props.secondaryActions"
                  :key="secondaryAction.name"
                  clickable
                  @click="actionClicked(secondaryAction, $event)"
                >
                  <q-item-section>{{ secondaryAction.text }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            color="grey-7"
            round
            flat
            :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="expanded=!expanded"
          />
        </div>
      </div>
    </q-card-section>

    <q-slide-transition>
      <div v-show="expanded">
        <q-card-section class="q-pt-none">
          <slot name="content" />
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue'

export type TypeAction = {
  name: string
  icon?: string
  text?: string
  hint?: string
  loading?: boolean
  active?: boolean
}

export default defineComponent({
  name: 'BaseCard',
  props: {
    uniqName: { type: String, required: true },
    title: { type: String, required: false, default: '' },
    primaryActions: { type: Array as PropType<TypeAction[]>, required: false, default: () => [] },
    secondaryActions: { type: Array as PropType<TypeAction[]>, required: false, default: () => [] },
    expand: { type: Boolean, required: false, default: false }
  },
  emits: ['actionClick'],
  setup (props, context) {
    const expanded = ref(false)

    const actionClicked = (action: TypeAction, event: MouseEvent) => {
      context.emit('actionClick', { action, event })
    }

    watch(() => props.expand, () => {
      /**
       * Wenn expand true, dann expandiere die Karte -> ScrollToCard
       */
      if (props.expand) {
        expanded.value = true
      }
    })

    return {
      expanded,

      actionClicked
    }
  }
})
</script>

<style lang="sass" scoped>

</style>
