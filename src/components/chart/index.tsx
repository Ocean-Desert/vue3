import { EChartsOption } from 'echarts'
import { PropType, defineComponent, nextTick, ref } from 'vue'
import VCharts from 'vue-echarts'

interface ChartProps {
  option?: EChartsOption
  autoResize?: boolean
  width?: string
  height?: string
}

export default defineComponent((props: ChartProps) => {
  const renderChart = ref(false)
  nextTick(() => {
    renderChart.value = true
  })
  return () => (
    <>
      {
        renderChart.value &&
        (<VCharts
          option={props.option}
          autoresize={props.autoResize}
          style={{ width: props.width, height: props.height }}
        />)
      }
    </>
  )
}, {
  props: {
    option: {
      type: Object as PropType<EChartsOption>,
      default() {
        return {}
      },
      require: false,
    },
    autoResize: {
      type: Boolean,
      require: false,
      default: true,
    },
    width: {
      type: String,
      require: false,
      default: '100%',
    },
    height: {
      type: String,
      require: false,
      default: '100%',
    }
  }
})