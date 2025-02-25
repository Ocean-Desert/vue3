import { genTableInfo, genTableUpdate } from '@/api/tool/gen'
import type { GenTable, GenTableColumn, GenTableInfo } from '@/api/tool/gen/type'
import { useAppStore, useTabBarStore } from '@/store'
import { to } from '@/utils'
import { isNumber, isString } from '@/utils/is'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ColumnsInfo from './components/columns-info'
import style from './index.module.scss'
import BasicInfo from './components/basic-info'
import GenInfo from './components/gen-info'
import { Message } from '@arco-design/web-vue'
import { BasicInfoInstance, ColumnsInfoInstance, GenInfoInstance } from './components/types'

export default defineComponent(() => {
  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const tabBarStore = useTabBarStore()
  const tagList = computed(() => (tabBarStore.getTagList))
  const tableInfo = ref<GenTableInfo>({
    tableInfo: {},
    columns: [],
    tables: []
  })
  const fetchData = async (tableId: number) => {
    const [err, response] = await to<ApiSpace.Result<GenTableInfo>>(genTableInfo(tableId))
    if (!err) {
      tableInfo.value = response.data as GenTableInfo
    }
  }
  const closeOtherDuplicateTag = () => {
    tabBarStore.closeDuplicateTag(tagList.value)
  }
  onMounted(() => {
    closeOtherDuplicateTag()
    if (route.params.tableId && !isNaN(Number(route.params.tableId))) {
      fetchData(Number(route.params.tableId)) 
    } 
  })
  const updateTableInfo = (type: 'tableInfo' | 'columns' | 'tables', data: any) => {
    tableInfo.value = {
      ...tableInfo.value,
      [type]: data
    }
  }
  const basicInfoRef = ref<BasicInfoInstance>()
  const columnsInfoRef = ref<ColumnsInfoInstance>()
  const genInfoRef = ref<GenInfoInstance>()
  const validateForms = async () => {
    try {
      const results = await Promise.all([
        basicInfoRef.value?.validate(),
        genInfoRef.value?.validate()
      ])
      return results.every(result => result === true)
    } catch (error) {
      Message.error('表单验证失败，请检查填写内容')
      return false
    }
  }
  const handleSave = async () => {
    if (await validateForms()) {
      console.log('验证通过，最终数据:', tableInfo.value)
      tableInfo.value.tableInfo.columns = tableInfo.value.columns
      const [err, response] = await to<ApiSpace.Result<boolean>>(genTableUpdate(tableInfo.value.tableInfo))
      if (!err) {
        Message.success('保存成功')
      }
    }
  }
  const handleCancel = () => {
    const currentTag = tagList.value.find(tag => tag.fullPath === route.fullPath)
    if (currentTag) {
      const index = tagList.value.findIndex(tag => tag.fullPath === route.fullPath)
      tabBarStore.deleteTag(index, currentTag)
    }
    router.back()
  }
  return () => (
    <>
      <a-card size={size.value}>
        <a-tabs default-active-key="2">
          <a-tab-pane key="1" title="基本信息">
            <BasicInfo 
              ref={basicInfoRef}
              modelValue={tableInfo.value.tableInfo as GenTable} 
              onUpdate:modelValue={(data) => updateTableInfo('tableInfo', data)} 
            />
          </a-tab-pane>
          <a-tab-pane key="2" title="字段信息">
            <ColumnsInfo 
              ref={columnsInfoRef}
              modelValue={tableInfo.value} 
              onUpdate:modelValue={(data) => updateTableInfo('columns', data.columns)} 
            />
          </a-tab-pane>
          <a-tab-pane key="3" title="生成信息">
            <GenInfo 
              ref={genInfoRef}
              modelValue={tableInfo.value.tableInfo as GenTable}
              onUpdate:modelValue={(data) => updateTableInfo('tableInfo', data)}
              joinTables={tableInfo.value.tables}
            />
          </a-tab-pane>
        </a-tabs>
        <a-space>
          <a-button type="primary" onClick={handleSave}>确定</a-button>
          <a-button onClick={handleCancel}>取消</a-button>
        </a-space>
      </a-card>
    </>
  )
})