import { Play } from '@icon-park/vue-next'
import { CreateAppFunction } from 'vue'

export function IconPark(app: CreateAppFunction<Element>): void {
  app.component('Play', Play)
}