import { computed, defineComponent, h, reactive, ref, resolveComponent, toRef, toRefs, watch } from 'vue'
import GenericComment from '@/components/generic/index'
import { menuOne, menuList, menuUpdate, menuAdd, menuDelete, menTreeselect } from '@/api/system/menus'
import { SysMenu, SysMenuParam } from '@/api/system/menus/type'
import { useDictSelectMultiple, useDisplay, useTreeSelect } from '@/hooks/options'
import { dict } from '@/api/system/dict'
import type { TableColumnData, TableData } from '@arco-design/web-vue'
import { GenericInstance } from '@/types/generic'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const genericRef = ref<GenericInstance>()
  const isRules = ref(true)
  const model = ref<SysMenu>({})
  const [enabledDict, menuTypeDict] = useDictSelectMultiple(async () => await dict('sys_enabled'), async () => await dict('sys_menu_type'))
  const treeSelect = useTreeSelect(async () => await menTreeselect({}), { immediate: false })
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('menu.index.641353-0'),
      field: 'title'
    }, {
      type: 'select',
      label: t('menu.index.641353-1'),
      field: 'type',
      options: menuTypeDict.options.value,
      props: { loading: menuTypeDict.loading.value },
    }, {
      type: 'select',
      label: t('menu.index.641353-2'),
      field: 'enabled',
      options: enabledDict.options.value,
      props: { loading: enabledDict.loading.value },
    }]
  }))
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('menu.index.641353-0'),
      dataIndex: 'title',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('menu.index.641353-3'),
      dataIndex: 'name',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('menu.index.641353-4'),
      dataIndex: 'path',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('menu.index.641353-5'),
      dataIndex: 'component',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('menu.index.641353-6'),
      dataIndex: 'icon',
      align: 'center',
      render: (data: { record: TableData; column: TableColumnData; rowIndex: number; }) => (
        data.record.icon && h(resolveComponent(data.record.icon))
      )
    }
  }, {
    type: 'default',
    props: {
      title: t('menu.index.641353-7'),
      dataIndex: 'permission',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('menu.index.641353-8'),
      dataIndex: 'type',
      align: 'center',
    },
    options: menuTypeDict.options.value,
  }, {
    type: 'default',
    props: {
      title: t('menu.index.641353-9'),
      dataIndex: 'sort',
      align: 'center',
    },
  }, {
    type: 'choose',
    props: {
      title: t('menu.index.641353-2'),
      dataIndex: 'enabled',
      align: 'center',
    },
    options: enabledDict.options.value
  }, {
    type: 'operate',
    props: {
      title: t('menu.index.641353-10'),
      align: 'center',
    },
    onUpdate: async (record: TableData) => {
      await treeSelect.fetchData()
      isRules.value = record.type !== 'F'
    }
  }]))
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { hide: true },
    columns: [{
      type: 'radio-group',
      label: t('menu.index.641353-1'),
      field: 'type',
      props: {
        onChange: (value: string | number | boolean) => isRules.value = value !== 'F'
      },
      rules: [{ required: true, message: t('menu.index.641353-11') }],
      options: menuTypeDict.options.value
    }, {
      type: 'tree-select',
      label: t('menu.index.641353-12'),
      field: 'parentId',
      defaultValue: 0,
      span: 12,
      data: [{ key: 0, title: t('menu.index.641353-13'), children: treeSelect.data.value }],
      rules: [{ required: true, message: t('menu.index.641353-14') }],
      props: { loading: treeSelect.loading.value }
    }, {
      type: 'input',
      label: t('menu.index.641353-15'),
      field: 'icon',
      span: 12,
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('menu.index.641353-0'),
      field: 'title',
      span: 12,
      rules: [{ required: true, message: t('menu.index.641353-16') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('menu.index.641353-3'),
      field: 'name',
      span: 12,
      rules: isRules.value ? [{ required: true, message: t('menu.index.641353-17') }] : [],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('menu.index.641353-4'),
      field: 'path',
      span: 12,
      rules: isRules.value ? [{ required: true, message: t('menu.index.641353-18') }] : [],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('menu.index.641353-5'),
      field: 'component',
      span: 12,
      rules: isRules.value ? [{ required: true, message: t('menu.index.641353-19') }] : [],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('menu.index.641353-20'),
      field: 'permission',
      rules: [{ required: true, message: t('menu.index.641353-21') }],
      span: 12,
      props: { allowClear: true }
    }, {
      type: 'input-number',
      label: t('menu.index.641353-22'),
      field: 'sort',
      span: 12,
      rules: [{ required: true, message: t('menu.index.641353-23') }],
      props: { allowClear: true }
    }, {
      type: 'switch',
      label: t('menu.index.641353-24'),
      field: 'keepAlive',
      span: 12
    }, {
      type: 'switch',
      label: t('menu.index.641353-2'),
      field: 'enabled',
      span: 12
    }]
  }))
  const onAppendChild = async (record: SysMenu) => {
    await treeSelect.fetchData()
    model.value = { parentId: record.id }
    genericRef.value?.setFormTick('add')
    genericRef.value?.setVisible(true)
  }
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        v-model={[model.value, 'formModel']}
        isPagination={false}
        isSelection={false}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        list={async (data: SysMenuParam) => await menuList(data)}
        get={async (id: number | string) => await menuOne(id)}
        save={async (data: SysMenu) => await menuAdd(data)}
        update={async (data: SysMenu) => menuUpdate(data)}
        remove={async (id: number | string) => await menuDelete(id)}
        permission={{
          add: ['system:menu:add'],
          del: ['system:menu:del'],
          edit: ['system:menu:edit'],
          query: ['system:menu:query']
        }}
        display={useDisplay({ showBatchDel: false, showBatchEdit: false }).value}
        props={{ showEmptyTree: true }}
        onAdd={async () => await treeSelect.fetchData()}
      >
        {{
          operate: (record: TableData) => {
            if (record.type === 'F') return
            return <a-tooltip content={t('menu.index.641353-25')} >
              <a-button onClick={() => onAppendChild(record)} type="primary" size={size.value}>
                {{ icon: () => <icon-folder-add /> }}
              </a-button>
            </a-tooltip>
          }
        }}
      </GenericComment >
    </>
  )
})