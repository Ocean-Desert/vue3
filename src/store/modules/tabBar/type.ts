export interface TagProps {
  title: string
  name: string
  fullPath: string
  query?: any
  params?: any
  keepAlive?: boolean
}

export interface TabBarState {
  tagList: TagProps[]
  cacheTabList: Set<string>
}
