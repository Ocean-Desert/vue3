/// <reference types="vite/client" />

declare module '*.tsx' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component;
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component;
}
declare interface ViteEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_CONTEXT_PATH: string
  readonly VITE_API_CONTEXT_FILE: string
  readonly VITE_API_SOCK_ENDPOINT: string
}
