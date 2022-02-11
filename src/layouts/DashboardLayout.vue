<template>
  <q-layout
    view="hHh LpR fFf"
    class="bg-grey-1"
  >
    <q-header
      elevated
      class="bg-primary text-white"
      height-hint="64"
    >
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title
          v-if="$q.screen.gt.xs"
          shrink
          class="row items-center no-wrap"
        >
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label
                  class="text-h6"
                >
                  {{ title }}
                </q-item-label>
                <q-item-label
                  class="text-subtitle1"
                >
                  {{ subTitle }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-toolbar-title>

        <q-space />

        <!-- Suche -->
        <q-input
          v-if="searchVisible"
          v-model="search"
          class="GNL__toolbar-input"
          outlined
          dense
          color="bg-grey-7 shadow-1"
          bg-color="white"
          placeholder="Suche"
        >
          <template #prepend>
            <q-icon
              v-if="search === ''"
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

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <template
            v-for="action in orderedActions"
            :key="action.name"
          >
            <q-btn
              round
              dense
              flat
              color="text-grey-7"
              :icon="action.icon"
              :disable="!action.active"
              @click="onButtonClick(action.name, $event)"
            >
              <q-tooltip>{{ action.hint }}</q-tooltip>
            </q-btn>
          </template>
          <q-btn
            v-if="mainSecondaryActions && mainSecondaryActions.length > 0"
            round
            dense
            flat
            color="text-grey-7"
            icon="mdi-dots-vertical"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="bg-white"
      show-if-above
    >
      <q-scroll-area class="fit">
        <q-list
          padding
          class="text-grey-8"
        >
          <template
            v-for="(item, index) in currentNavigation"
            :key="`${index}-${item.text}-${item.order}`"
          >
            <q-item
              v-if="item.type == 'link'"
              v-ripple
              class="GNL__drawer-item"
              clickable
              :to="item.to"
              @click="item.click"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.text }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator
              v-if="item.type == 'line'"
              inset
              class="q-my-sm"
            />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, provide, computed, Ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export type Action = {
  name: string
  label: string
  hint: string
  active: boolean
  icon: string | null
  order: number
}

export type ActionCalled = Ref<{
  action: string
  event: MouseEvent
}>

export default defineComponent({
  name: 'DashboardLayout',
  setup () {
    const router = useRouter()
    const route = useRoute()

    const actionCalled = ref({}) as any
    provide('actionCalled', actionCalled)

    const mainActions = ref<Action[] | null>(null)
    const setMainActions = (actions: Action[]) => {
      mainActions.value = actions
    }
    provide('setMainActions', setMainActions)

    const addMainActions = (action: Action) => {
      mainActions.value?.push(action)
    }
    provide('addMainActions', addMainActions)

    const enableMainAction = (name: string) => {
      if (mainActions.value) {
        mainActions.value = mainActions.value.map(action => {
          if (action.name === name) {
            action.active = true
          }
          return action
        })
      }
    }
    provide('enableMainAction', enableMainAction)

    const disableMainAction = (name: string) => {
      if (mainActions.value) {
        mainActions.value = mainActions.value.map(action => {
          if (action.name === name) {
            action.active = false
          }
          return action
        })
      }
    }
    provide('disableMainAction', disableMainAction)

    const mainSecondaryActions = ref<Action[] | null>(null)
    const setMainSecondaryActions = (actions: Action[]) => {
      mainSecondaryActions.value = actions
    }
    provide('setMainSecondaryActions', setMainSecondaryActions)

    const onButtonClick = (action: string, event: MouseEvent) => {
      actionCalled.value = {
        action: action,
        event: event
      }
    }

    /**
     * Titel
     */
    const title = ref('Dashboard')
    const subTitle = ref<string | undefined>('')
    const setMainTitle = (primary: string, secondary: string | undefined) => {
      title.value = primary
      subTitle.value = secondary
    }
    provide('setMainTitle', setMainTitle)

    const leftDrawerOpen = ref(false)
    const search = ref('')

    /** Suche */
    const searchVisible = ref(false)
    const setSearchVisible = (visible: boolean) => {
      searchVisible.value = visible
    }
    provide('setSearchVisible', setSearchVisible)
    provide('search', search)

    const setSearch = (value: string) => {
      search.value = value
    }
    provide('setSearch', setSearch)
    /** Ende Suche */

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    watch(() => route.fullPath, () => {
      mainActions.value = []
      mainSecondaryActions.value = []
      searchVisible.value = false
    })

    /** Normale Navigation */
    type typeNavigationItem = {
      icon?: string
      text?: string
      to?: string
      click?: () => void
      type: 'link' | 'line'
      order?: number
      permissionName?: string
    }
    const navigation = ref<typeNavigationItem[]>([])
    navigation.value = [
      // { icon: 'mdi-home-outline', text: 'Dashboard', to: '/dashboard/', type: 'link' },
      { icon: 'mdi-file-eye-outline', text: 'DFI Pools', to: '/dfipools/', type: 'link' },
      { icon: 'mdi-file-edit-outline', text: 'DEX Currency Matrix', to: '/dexmatrix/', type: 'link' },
      { icon: 'mdi-calendar-clock-outline', text: 'DUSD Pools', to: '/dusdpools/', type: 'link' },
      // { icon: 'mdi-domain', text: 'dToken Charts', to: '/dtokencharts/', type: 'link' },
      { icon: 'mdi-currency-eur', text: 'Credits', to: '/credits/', type: 'link' }
    ]

    /**
     * Form Navigation
     */
    const formNavigation = ref<typeNavigationItem[]>([])
    const backClick = () => {
      router.go(-1)
    }
    const topClick = () => {
      window.scrollTo(0, 0)
    }
    const baseFormNavigation = ref<typeNavigationItem[]>([])
    baseFormNavigation.value = [
      { icon: 'mdi-arrow-left', text: 'Zurück', type: 'link', click: backClick },
      { type: 'line' },
      { icon: 'mdi-arrow-up', text: 'Top', type: 'link', click: topClick }
    ]
    const formNavigationVisible = ref(false)
    const showFormNavigation = (showFormNavigation: boolean) => {
      formNavigationVisible.value = showFormNavigation
    }

    provide('showFormNavigation', showFormNavigation)

    const addFormNavigation = (item: typeNavigationItem) => {
      const index = formNavigation.value.findIndex(
        function (el) {
          return el.text === item.text
        })
      if (index === -1) {
        if (item.order) {
          formNavigation.value.splice(item.order, 0, item)
        } else {
          formNavigation.value.push(item)
        }
      } else {
        formNavigation.value[index] = item
      }
    }
    provide('addFormNavigation', addFormNavigation)

    const clearFormNavigation = () => {
      formNavigation.value = []
    }
    provide('clearFormNavigation', clearFormNavigation)

    const currentNavigation = computed(() => {
      if (formNavigationVisible.value === true) {
        return [...baseFormNavigation.value, ...formNavigation.value]
      }
      return navigation.value
    })

    const orderedActions = computed(() => {
      const actions = mainActions.value
      if (actions) {
        return actions.sort((a, b) => {
          if (a.order && b.order) {
            return a.order - b.order
          }
          if (a.order) {
            return -1
          }
          if (b.order) {
            return 1
          }
          return 0
        })
      }
      return []
    })

    return {
      leftDrawerOpen,
      title,
      subTitle,
      search,
      currentNavigation,
      orderedActions,
      mainSecondaryActions,
      toggleLeftDrawer,
      searchVisible,
      onButtonClick
    }
  }
})
</script>

<style lang="sass">
.GNL
  &__toolbar
    height: 64px
  &__toolbar-input
    width: 55%
  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px
    .q-item__section--avatar
      .q-icon
        color: #5f6368
    .q-item__label
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem
  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem
    &:hover
      color: #000
</style>
