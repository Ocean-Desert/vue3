import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import style from './index.modules.scss'

export default defineComponent((props, { slots }) => {
  const days = ref('0')
  const hours = ref('00')
  const mins = ref('00')
  const seconds = ref('00')
  let timer: ReturnType<typeof setTimeout> | null = null
  let curTime = ref(Date.now())

  const duration = computed(() => {
    if (props.end) {
      let end = String(props.end).length >= 13 ? +props.end : +props.end * 1000
      end -= Date.now()
      return end
    }
    const time = props.isMiniSecond ? Math.round(+props.time / 1000) : Math.round(+props.time)
    return time
  })

  const durationFormatter = (time: number) => {
    if (!time) return { ss: 0 }
    let t = time
    const ss = t % 60
    t = (t - ss) / 60
    if (t < 1) return { ss }
    const mm = t % 60
    t = (t - mm) / 60
    if (t < 1) return { mm, ss }
    const hh = t % 24
    t = (t - hh) / 24
    if (t < 1) return { hh, mm, ss }
    const dd = t
    return { dd, hh, mm, ss }
  }

  const getTime = (time: number) => {
    if (timer) clearTimeout(timer)
    if (time < 0) return
    const { dd, hh, mm, ss } = durationFormatter(time)
    days.value = String(dd || 0)
    hours.value = `00${hh || 0}`.slice(-2)
    mins.value = `00${mm || 0}`.slice(-2)
    seconds.value = `00${ss || 0}`.slice(-2)
    timer = setTimeout(() => {
      const now = Date.now()
      const diffTime = Math.floor((now - curTime.value) / 1000)
      const step = diffTime > 1 ? diffTime : 1
      curTime.value = now
      getTime(time - step)
    }, 1000)
  }

  watch([duration, () => props.refreshCounter], () => {
    getTime(duration.value)
  })

  onMounted(() => {
    getTime(duration.value)
  })

  const slotProps = computed(() => ({
    d: days.value,
    h: hours.value,
    m: mins.value,
    s: seconds.value,
    hh: `00${hours.value}`.slice(-2),
    mm: `00${mins.value}`.slice(-2),
    ss: `00${seconds.value}`.slice(-2),
  }))

  return () => (
    <>
      <div class={style.baseCountDown}>
        <div class={style.content}>
          {
            slots.default && slots.default(slotProps.value)
          }
        </div>
      </div>
    </>
  )
}, {
  props: {
    time: {
      type: [Number, String],
      default: 0,
    },
    refreshCounter: {
      type: [Number, String],
      default: 0,
    },
    end: {
      type: [Number, String],
      default: 0,
    },
    isMiniSecond: {
      type: Boolean,
      default: false,
    }
  }
})