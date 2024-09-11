import { defineComponent, h, KeepAlive, Transition, ComponentOptions, VNode } from 'vue'
import { RouteLocationNormalizedLoaded, RouterView, useRoute } from 'vue-router'
export default defineComponent(() => {
  return () => (
    <>
      <RouterView>
        {{
          default: ({ Component, route }: { Component: VNode, route: RouteLocationNormalizedLoaded }) => {
            return <Transition name="fade" mode="in-out" appear>
              {
                route.meta?.keepAlive ?
                  <KeepAlive>
                    {h(Component, { key: route.fullPath })}
                  </KeepAlive> :
                  h(Component, { key: route.fullPath })
              }
            </Transition>
          }
        }}
      </RouterView>
    </>
  )
})