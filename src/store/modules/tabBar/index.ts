import { defineStore } from 'pinia'
import type { TabBarState, TagProps } from './type'
import { RouteLocationNormalized } from 'vue-router'
import { isString } from '@/utils/is'
import { DEFAULT_ROUTE, LayoutName, LoadName, NotFoundName, REDIRECT_ROUTE_NAME } from '@/router/constant'
const formatTag = (route: RouteLocationNormalized): TagProps => {
  const { name, meta, fullPath, query, params } = route
  return {
    title: meta.title || '',
    name: name as string,
    fullPath,
    query,
    params,
    keepAlive: meta.keepAlive
  }
}

const BAN_LIST = [REDIRECT_ROUTE_NAME, LoadName, NotFoundName]

const findFirstDuplicateTagProps = (tagList: TagProps[]): number | undefined => {
  const nameTracker: { [key: string]: number } = {}
  for (let i = 0; i < tagList.length; i++) {
    const item = tagList[i]
    if (nameTracker[item.name]) {
      return nameTracker[item.name] - 1
    }
    nameTracker[item.name] = i + 1
  }
}

const useTabBarStore = defineStore('tabBar', {
  state: (): TabBarState => ({
    cacheTabList: new Set(['dashboard']),
    tagList: [DEFAULT_ROUTE]
  }),
  getters: {
    getCacheList(): string[] {
      return [...this.cacheTabList]
    },
    getTagList(): TagProps[] {
      return this.tagList
    }
  },
  actions: {
    updateTabList(route: RouteLocationNormalized) {
      if (BAN_LIST.includes(route.name as string)) {
        return
      }
      this.tagList.push(formatTag(route))
      if (route.meta.keepAlive) {
        this.cacheTabList.add(route.name as string)
      }
    },
    deleteTag(index: number, tag: TagProps) {
      this.tagList.splice(index, 1)
      this.cacheTabList.delete(tag.name)
    },
    addCache(name: string) {
      if (isString(name) && name !== '') {
        this.cacheTabList.add(name)
      }
    },
    deleteCache(tag: TagProps) {
      this.cacheTabList.delete(tag.name)
    },
    freshTabList(tags: TagProps[]) {
      this.tagList = tags
      this.cacheTabList.clear()
      this.tagList
        .filter(item => item.keepAlive)
        .map(item => item.name)
        .forEach(item => this.cacheTabList.add(item))
    },
    closeDuplicateTag(tagList: TagProps[]) {
      const index = findFirstDuplicateTagProps(tagList)
      if (index) this.deleteTag(index, tagList[index])
    },
    resetTabList() {
      this.tagList = [DEFAULT_ROUTE]
      this.cacheTabList.clear()
      this.cacheTabList.add('dashboard')
    }
  }
})

export default useTabBarStore