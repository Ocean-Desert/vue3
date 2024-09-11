import { computed, defineComponent, ref } from 'vue'
import GenericComment from '@/components/generic/index'
import { useDictSelect, useTreeSelect } from '@/hooks/options'
import { dict } from '@/api/system/dict'
import type { SysRole, SysRoleParam } from '@/api/system/role/type'
import { roleOne, rolePage, roleUpdate, roleAdd, roleDelete, deptTree, dataScope } from '@/api/system/role'
import { roleMenuTreeselect, menTreeselect } from '@/api/system/menus'
import { TableData } from '@arco-design/web-vue'
import { convertTree, to } from '@/utils'
import { RoleMenuTreeSelect } from '@/api/system/menus/type'
import { TreeSelect } from '@/api/common/type'
import { GenericInstance } from '@/types/generic/index'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const genericRef = ref<GenericInstance>()
  const model = ref<SysRole>({})
  const treeData = ref<TreeSelect[]>([])
  const checkedKeys = ref<number[]>([])
  const enabledDict = useDictSelect(async () => await dict('sys_enabled'))
  const treeSelect = useTreeSelect(async () => await menTreeselect({}), { immediate: false })
  const searchOptions = ref<FormSpace.Options>({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('role.index.471764-0'),
      field: 'roleKey'
    }, {
      type: 'input',
      label: t('role.index.471764-1'),
      field: 'roleName'
    }, {
      type: 'select',
      label: t('role.index.471764-2'),
      field: 'enabled',
      options: enabledDict.options.value,
      props: { loading: enabledDict.loading.value },
    }]
  })
  const formOptions = ref<FormSpace.Options>({
    form: { size: size.value },
    btns: { hide: true },
    columns: []
  })
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('role.index.471764-3'),
      dataIndex: 'id',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('role.index.471764-0'),
      dataIndex: 'roleKey',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('role.index.471764-1'),
      dataIndex: 'roleName',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('role.index.471764-2'),
      dataIndex: 'enabled',
      align: 'center',
    },
    options: enabledDict.options.value
  }, {
    type: 'operate',
    props: {
      title: t('role.index.471764-4'),
      align: 'center',
    },
    onUpdate: changeFormByEdit
  }]))
  const update = ref<(data: SysRole) => Promise<ApiSpace.Result<boolean>>>(async (data: SysRole) => await roleUpdate(data))
  const changeFormByAdd = async () => {
    treeSelect.fetchData()
    formOptions.value.columns = [{
      type: 'input',
      label: t('role.index.471764-3'),
      field: 'id',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('role.index.471764-0'),
      field: 'roleKey',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-0') }) }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('role.index.471764-1'),
      field: 'roleName',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-1') }) }],
      props: { allowClear: true }
    }, {
      type: 'customize',
      label: t('role.index.471764-5'),
      fieldType: 'array',
      field: 'menuIds',
      render: () => (
        <a-tree
          checkable={true}
          data={treeSelect.data.value}
          showLine={true}
          v-model={[model.value.menuIds, 'checked-keys']}
          size={size.value}
        />
      )
    }, {
      type: 'switch',
      label: t('role.index.471764-2'),
      field: 'enabled'
    }]
  }
  const changeFormByEdit = async (record: TableData) => {
    await fetchRoleMenuTree(record.id)
    model.value.menuIds = checkedKeys.value
    formOptions.value.columns = [{
      type: 'input',
      label: t('role.index.471764-3'),
      field: 'id',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('role.index.471764-0'),
      field: 'roleKey',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-0') }) }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('role.index.471764-1'),
      field: 'roleName',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-1') }) }],
      props: { allowClear: true }
    }, {
      type: 'customize',
      label: t('role.index.471764-5'),
      fieldType: 'array',
      field: 'menuIds',
      render: () => (
        <a-tree
          checkable={true}
          data={treeData.value}
          showLine={true}
          v-model={[model.value.menuIds, 'checked-keys']}
          size={size.value}
        />
      )
    }, {
      type: 'switch',
      label: t('role.index.471764-2'),
      field: 'enabled'
    }]
    update.value = async (data: SysRole) => await roleUpdate(data)
  }
  const changeFormByDataScope = async (record: TableData) => {
    await fetchDeptTree(record.id)
    formOptions.value.columns = [{
      type: 'input',
      label: t('role.index.471764-3'),
      field: 'id',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('role.index.471764-0'),
      field: 'roleKey',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-0') }) }],
      props: { allowClear: true, disabled: true }
    }, {
      type: 'input',
      label: t('role.index.471764-1'),
      field: 'roleName',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-1') }) }],
      props: { allowClear: true, disabled: true }
    }, {
      type: 'select',
      label: t('role.index.471764-6'),
      field: 'dataScope',
      rules: [{ required: true, message: t('global.rules.message', { label: t('role.index.471764-6') }) }],
      props: { allowClear: true, onChange: (val: string) => changeHide(val !== '2') },
      options: [
        { label: t('role.index.471764-7'), value: '1' },
        { label: t('role.index.471764-8'), value: '2' },
        { label: t('role.index.471764-9'), value: '3' },
        { label: t('role.index.471764-10'), value: '4' },
        { label: t('role.index.471764-11'), value: '5' }
      ]
    }, {
      type: 'customize',
      label: t('role.index.471764-12'),
      fieldType: 'array',
      field: 'deptIds',
      render: () => (
        <a-tree
          checkable={true}
          data={treeData.value}
          showLine={true}
          v-model={[model.value.deptIds, 'checked-keys']}
          size={size.value}
        />
      )
    }, {
      type: 'switch',
      label: t('role.index.471764-2'),
      field: 'enabled'
    }]
    update.value = async (data: SysRole) => await dataScope(data)
    changeHide(model.value.dataScope !== '2')
    genericRef.value?.setFormTick('edit')
    genericRef.value?.setVisible(true)
  }
  const changeHide = (val: boolean) => {
    formOptions.value.columns[formOptions.value.columns.length - 2].hide = val
  }
  const fetchRoleMenuTree = async (id: number | undefined) => {
    if (!id) throw Error('The id is undefined')
    const [err, response] = await to<ApiSpace.Result<RoleMenuTreeSelect>>(roleMenuTreeselect(id))
    if (!err) {
      if (response.data) {
        const menus = response.data.menus
        checkedKeys.value = response.data.checkedKeys as number[]
        treeData.value = convertTree(menus as TreeSelect[], data => ({ key: data.id, title: data.label })) as TreeSelect[]
      }
    }
  }
  const fetchDeptTree = async (id: number | undefined) => {
    if (!id) throw Error('The id is undefined')
    const [roleData, deptData] = await Promise.all([roleOne(id), deptTree(id)])
    model.value = roleData.data as SysRole
    checkedKeys.value = deptData.data?.checkedKeys as number[]
    treeData.value = convertTree(deptData.data?.depts as TreeSelect[], data => ({ key: data.id, title: data.label })) as TreeSelect[]
    model.value.deptIds = checkedKeys.value
  }
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        v-model={[model.value, 'formModel']}
        immediate={true}
        isSelection={true}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        page={async (data: SysRoleParam) => await rolePage(data)}
        get={async (id: number | string) => await roleOne(id)}
        save={async (data: SysRole) => await roleAdd(data)}
        update={async (data: SysRole) => update.value(data)}
        remove={async (id: number | string) => await roleDelete(id)}
        onAdd={() => changeFormByAdd()}
        permission={{
          add: ['system:role:add'],
          del: ['system:role:del'],
          edit: ['system:role:edit'],
          query: ['system:role:query']
        }}
      >
        {{
          operate: (record: TableData) => (
            <a-tooltip content={t('role.index.471764-6')}>
              <a-button onClick={() => changeFormByDataScope(record)} type="primary" size={size.value}>
                {{ icon: () => <icon-user-group /> }}
              </a-button>
            </a-tooltip>
          )
        }}
      </GenericComment>
    </>
  )
})