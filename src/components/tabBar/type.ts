import { TagProps } from '@/store/modules/tabBar/type'

export enum Eaction {
  reload = 'reload',
  current = 'current',
  left = 'left',
  right = 'right',
  others = 'others',
  all = 'all'
}

export interface TabItemProps {
  index: number,
  data: TagProps
}