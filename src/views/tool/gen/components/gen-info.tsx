import { computed, defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import type { GenTable, GenTableColumn, JoinTables } from '@/api/tool/gen/type'
import { useAppStore } from '@/store'
import { FormInstance } from '@arco-design/web-vue'
import { useTreeSelect } from '@/hooks/options'
import { menuTreeselect } from '@/api/system/menus'
import icon from '@/components/icon'
import JoinTable from './join-table'
import style from '../index.module.scss'
import { getAssetsFile } from '@/utils'
import type { JoinTableInstance } from './types'

export interface GenInfoProps {
  modelValue: GenTable
  joinTables?: GenTable[]
}

export default defineComponent((props: GenInfoProps, { emit, expose }) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const formRef = ref<FormInstance>()
  const { data, loading } = useTreeSelect(async () => await menuTreeselect({}), { flatHandle: false })
  const rules = {
    packageName: [{ required: true, message: '请输入包路径' }, { match: /^[a-zA-Z_$][a-zA-Z\d_$]*(?:\.[a-zA-Z_$][a-zA-Z\d_$]*)*$/, message: '包路径格式不正确' }],
    moduleName: [{ required: true, message: '请输入模块名' }, { match: /^[a-zA-Z0-9]+$/, message: '模块名格式不正确' }],
    businessName: [{ required: true, message: '请输入业务名' }, { match: /^[a-zA-Z0-9]+$/, message: '业务名格式不正确' }],
    parentMenuId: [{ required: true, message: '请选择上级菜单' }]
  }
  const selectOptionData = computed<Record<string, GenTableColumn[]> | undefined>(() => (
    props.joinTables?.reduce((acc, item) => {
      acc[item.tableName as string] = item.columns || []
      return acc
    }, {})
  ))
  const valueChange = (field: keyof GenTable, value: any) => {
    emit('update:modelValue', {...props.modelValue, [field]: value })
  }
  const addJoinTable = () => {
    const joinTables = props.modelValue?.joinTables || []
    valueChange('joinTables', [...joinTables, {}])
  }
  const removeJoinTable = (index: number) => {
    const joinTables = [...(props.modelValue?.joinTables || [])]
    joinTables.splice(index, 1)
    valueChange('joinTables', joinTables)
  }
  const updateJoinTable = (index: number, value: JoinTables) => {
    const joinTables = [...(props.modelValue?.joinTables || [])]
    joinTables[index] = value
    valueChange('joinTables', joinTables)
  }

  const joinTableRefs = ref<JoinTableInstance[]>([])

  const validate: () => Promise<boolean> = async () => {
    try {
      // 先验证主表单
      const mainFormErrors = await formRef.value?.validate()
      if (mainFormErrors) return false

      // 验证所有关联表配置
      if (props.modelValue?.joinTables?.length) {
        const joinTableResults = await Promise.all(
          joinTableRefs.value.map(ref => ref?.validate())
        )
        if (joinTableResults.some(result => !result)) return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  expose({ validate })

  return () => (
    <>
      <a-form ref={formRef} rules={rules} model={props.modelValue}>
        <a-card class={style.configCard} title="基础配置" bordered={false}>
          <a-row gutter={24}>
            <a-col span={8}>
              <a-form-item field="packageName" label="包路径" labelColProps={{ span: 6 }} wrapperColProps={{ span: 18 }}>
                <a-input
                  modelValue={props.modelValue?.packageName}
                  onUpdate:modelValue={(value: string) => valueChange('packageName', value)}
                  placeholder="请输入包路径"
                  size={size.value}
                  allowClear={true}
                />
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-form-item field="moduleName" label="模块名" labelColProps={{ span: 6 }} wrapperColProps={{ span: 18 }}>
                <a-input
                  modelValue={props.modelValue?.moduleName}
                  onUpdate:modelValue={(value: string) => valueChange('moduleName', value)}
                  placeholder="请输入模块名"
                  size={size.value}
                  allowClear={true}
                />
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-form-item field="businessName" label="业务名" labelColProps={{ span: 6 }} wrapperColProps={{ span: 18 }}>
                <a-input
                  modelValue={props.modelValue?.businessName}
                  onUpdate:modelValue={(value: string) => valueChange('businessName', value)}
                  placeholder="请输入模块名"
                  size={size.value}
                  allowClear={true}
                />
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-form-item field="functionName" label="功能名" labelColProps={{ span: 6 }} wrapperColProps={{ span: 18 }}>
                <a-input
                  modelValue={props.modelValue?.functionName}
                  onUpdate:modelValue={(value: string) => valueChange('functionName', value)}
                  placeholder="请输入功能名"
                  size={size.value}
                  allowClear={true}
                />
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-form-item field="tablePrefix" label="表前缀" labelColProps={{ span: 6 }} wrapperColProps={{ span: 18 }}>
                <a-input
                  modelValue={props.modelValue?.tablePrefix}
                  onUpdate:modelValue={(value: string) => valueChange('tablePrefix', value)}
                  placeholder="请输入表前缀"
                  size={size.value}
                  allowClear={true}
                />
              </a-form-item>
            </a-col>
            <a-col span={8}>
              <a-form-item field="parentMenuId" label="上级菜单" labelColProps={{ span: 6 }} wrapperColProps={{ span: 18 }}>
                <a-tree-select
                  modelValue={props.modelValue?.parentMenuId}
                  onUpdate:modelValue={(value: string) => valueChange('parentMenuId', value)}
                  placeholder="请选择上级菜单"
                  size={size.value}
                  allowClear={true}
                  data={data.value}
                  loading={loading.value}
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <a-card class={style.configCard} title="接口配置" bordered={false}>
          <a-row class={style.apiConfig} gutter={24}>
            <a-col span={8}>
              <a-space direction="vertical" fill>
                <div class={style.apiItem}>
                  <span class={style.apiLabel}>分页查询</span>
                  <a-switch
                    modelValue={props.modelValue?.pageMethod}
                    onUpdate:modelValue={(value: string) => valueChange('pageMethod', value)}
                    size={size.value}
                  />
                </div>
                <div class={style.apiItem}>
                  <span class={style.apiLabel}>列表查询</span>
                  <a-switch
                    modelValue={props.modelValue?.listMethod}
                    onUpdate:modelValue={(value: string) => valueChange('listMethod', value)}
                    size={size.value}
                  />
                </div>
              </a-space>
            </a-col>
            <a-col span={8}>
              <a-space direction="vertical" fill>
                <div class={style.apiItem}>
                  <span class={style.apiLabel}>详情查询</span>
                  <a-switch
                    modelValue={props.modelValue?.detailsMethod}
                    onUpdate:modelValue={(value: string) => valueChange('detailsMethod', value)}
                    size={size.value}
                  />
                </div>
                <div class={style.apiItem}>
                  <span class={style.apiLabel}>新增接口</span>
                  <a-switch
                    modelValue={props.modelValue?.addMethod}
                    onUpdate:modelValue={(value: string) => valueChange('addMethod', value)}
                    size={size.value}
                  />
                </div>
              </a-space>
            </a-col>
            <a-col span={8}>
              <a-space direction="vertical" fill>
                <div class={style.apiItem}>
                  <span class={style.apiLabel}>更新接口</span>
                  <a-switch
                    modelValue={props.modelValue?.updateMethod}
                    onUpdate:modelValue={(value: string) => valueChange('updateMethod', value)}
                    size={size.value}
                  />
                </div>
                <div class={style.apiItem}>
                  <span class={style.apiLabel}>删除接口</span>
                  <a-switch
                    modelValue={props.modelValue?.deleteMethod}
                    onUpdate:modelValue={(value: string) => valueChange('deleteMethod', value)}
                    size={size.value}
                  />
                </div>
              </a-space>
            </a-col>
          </a-row>
        </a-card>

        <a-card class={style.configCard} title="集成依赖" bordered={false}>
          <div class={style.dependencyConfig}>
            <div class={style.dependencyItem}>
              <img src={getAssetsFile('swagger.svg')} class={style.dependencyIcon} />
              <span class={style.dependencyLabel}>Swagger</span>
              <a-switch
                modelValue={props.modelValue?.isSwagger}
                onUpdate:modelValue={(value: string) => valueChange('isSwagger', value)}
                size={size.value}
              />
            </div>
            <div class={style.dependencyItem}>
              <img src={getAssetsFile('lombok.svg')} class={style.dependencyIcon} />
              <span class={style.dependencyLabel}>Lombok</span>
              <a-switch
                modelValue={props.modelValue?.isLombok}
                onUpdate:modelValue={(value: string) => valueChange('isLombok', value)}
                size={size.value}
              />
            </div>
            <div class={style.dependencyItem}>
              <img src={getAssetsFile('validation.svg')} class={style.dependencyIcon} />
              <span class={style.dependencyLabel}>Validation</span>
              <a-switch
                modelValue={props.modelValue?.isValidation}
                onUpdate:modelValue={(value: string) => valueChange('isValidation', value)}
                size={size.value}
              />
            </div>
            <div class={style.dependencyItem}>
              <img src={getAssetsFile('security.svg')} class={style.dependencyIcon} />
              <span class={style.dependencyLabel}>Permission</span>
              <a-switch
                modelValue={props.modelValue?.isPermission}
                onUpdate:modelValue={(value: string) => valueChange('isPermission', value)}
                size={size.value}
              />
            </div>
          </div>
        </a-card>

        <a-card class={style.configCard} title="关联配置" bordered={false}>
          <div class={style.joinConfig}>
            <div class={style.joinHeader}>
              <a-button 
                type="outline"
                onClick={addJoinTable}
                size={size.value}
              >
                <icon name="plus" /> 添加关联
              </a-button>
            </div>
            <div class={style.joinList}>
              {(props.modelValue?.joinTables || []).map((joinTable, index) => (
                <div key={index} class={style.joinTableWrapper}>
                  <div class={style.joinTableHeader}>
                    <span>关联配置 {index + 1}</span>
                    <a-button
                      type="text"
                      status="danger"
                      onClick={() => removeJoinTable(index)}
                    >
                      <icon name="delete" /> 删除
                    </a-button>
                  </div>
                  <JoinTable
                    ref={(el: any) => {
                      if (el) joinTableRefs.value[index] = el as JoinTableInstance
                    }}
                    modelValue={joinTable}
                    onUpdate:modelValue={(value) => updateJoinTable(index, value)}
                    sourceColumns={props.modelValue?.columns}
                    targetTables={selectOptionData.value}
                  />
                </div>
              ))}
            </div>
          </div>
        </a-card>
      </a-form>
    </>
  )
}, {
  props: {
    modelValue: {
      type: Object as PropType<GenTable>,
      required: true,
      default: () => ({})
    },
    joinTables: {
      type: Array as PropType<GenTable[]>,
      default: () => []
    }
  },
  emits: ['update:modelValue']
})