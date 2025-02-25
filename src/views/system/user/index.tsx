import { computed, defineComponent, ref, watch } from 'vue'
import style from './index.module.scss'
import GenericComment from '@/components/generic/index'
import { userPage, userOne, userDelete, userAdd, userUpdate } from '@/api/system/user/index'
import type { SysUser, SysUserParam } from '@/api/system/user/type'
import { useSelect, useDisplay, useDictSelectMultiple, useTreeSelect, useCustomUpload } from '@/hooks/options'
import { dict } from '@/api/system/dict'
import { treeselect } from '@/api/system/dept'
import { UploadOptions } from '@/api/common/type'
import { roleList } from '@/api/system/role'
import { SysRole } from '@/api/system/role/type'
import { TableData } from '@arco-design/web-vue'
import { upload } from '@/api/common'
import { GenericInstance } from '@/types/generic'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const genericRef = ref<GenericInstance | null>(null)
  const [enabledDict, userSexDict] = useDictSelectMultiple(async () => await dict('sys_enabled'), async () => await dict('sys_user_sex'))
  const treeSelect = useTreeSelect(async () => await treeselect({}), { flatHandle: false })
  const roles = useSelect<SysRole>(async () => await roleList({}), (data: SysRole[]) => {
    return data.map(item => {
      return {
        label: item.roleName,
        value: item.id,
        disabled: item.enabled
      }
    })
  })
  const { imageRequest, file } = useCustomUpload(async (form: FormData, options?: UploadOptions) => await upload(form, options))
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('user.index.572260-0'),
      field: 'username'
    }, {
      type: 'input',
      label: t('user.index.572260-1'),
      field: 'phone'
    }, {
      type: 'input',
      label: t('user.index.572260-2'),
      field: 'nickName'
    }, {
      type: 'select',
      label: t('user.index.572260-3'),
      field: 'sex',
      options: userSexDict.options.value,
      props: { loading: userSexDict.loading.value },
    }, {
      type: 'select',
      label: t('user.index.572260-4'),
      field: 'enabled',
      options: enabledDict.options.value,
      props: { loading: enabledDict.loading.value },
    }, {
      type: 'tree-select',
      label: t('user.index.572260-5'),
      field: 'deptId',
      props: { loading: treeSelect.loading.value, data: treeSelect.data.value, }
    }]
  }))
  const formOptions = ref<FormSpace.Options>({
    form: { size: size.value },
    btns: { hide: true },
    columns: []
  })
  const columns = computed<TableSpace.Columns[]>(() => ([{
    type: 'default',
    props: {
      title: t('user.index.572260-0'),
      dataIndex: 'username',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: t('user.index.572260-2'),
      dataIndex: 'nickName',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('user.index.572260-3'),
      dataIndex: 'sex',
      align: 'center',
    },
    options: userSexDict.options.value
  }, {
    type: 'default',
    props: {
      title: t('user.index.572260-8'),
      dataIndex: 'phone',
      align: 'center',
    }
  }, {
    type: 'default',
    props: {
      title: '邮箱',
      dataIndex: 'email',
      align: 'center',
    }
  }, {
    type: 'image',
    props: {
      title: t('user.index.572260-11'),
      dataIndex: 'avatar',
      align: 'center',
    }
  }, {
    type: 'choose',
    props: {
      title: t('user.index.572260-4'),
      dataIndex: 'enabled',
      align: 'center',
    },
    options: enabledDict.options.value
  }, {
    type: 'operate',
    onUpdate(data: TableData) {
      changeFormByEdit()
      const avatar = data.avatar as string
      if (!avatar) {
        file.value = undefined
        return
      }
      const regex = /[\/\\]([^\/\\]*\.[^\/\\]*)$/
      const match = regex.exec(avatar)
      file.value = {
        status: 'done',
        uid: new Date().getTime().toString(),
        name: match ? match[1] : undefined,
        url: avatar,
        percent: 1,
      }
    },
    props: {
      title: t('user.index.572260-13'),
      align: 'center',
    }
    }]))
  const changeFormByAdd = async () => {
    file.value = undefined
    formOptions.value.columns = [{
      type: 'input',
      label: t('user.index.572260-0'),
      field: 'username',
      rules: [{ required: true, message: t('user.index.572260-7') }],
      props: { allowClear: true }
    }, {
      type: 'input-password',
      label: '密码',
      field: 'password',
      rules: [{ required: true, message: '请输入密码' }, { min: 4, message: '密码长度至少为4位' }, { match: /^[a-zA-Z0-9]*$/, message: '密码必须为字母或数字' }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('user.index.572260-2'),
      field: 'nickName',
      rules: [{ required: true, message: '请输入昵称' }],
      props: { allowClear: true }
    }, {
      type: 'select',
      label: t('user.index.572260-3'),
      field: 'sex',
      options: userSexDict.options.value,
      props: { allowClear: true, loading: userSexDict.loading.value }
    }, {
      type: 'input',
      label: t('user.index.572260-8'),
      field: 'phone',
      props: { allowClear: true, max: 11, min: 11 }
    }, {
      type: 'input',
      label: '邮箱',
      field: 'email',
      props: { allowClear: true }
    }, {
      type: 'select',
      label: t('user.index.572260-9'),
      field: 'roles',
      options: roles.options.value,
      fieldType: 'array',
      props: { allowClear: true, loading: roles.loading.value, multiple: true }
    }, {
      type: 'tree-select',
      label: t('user.index.572260-10'),
      field: 'deptId',
      props: { allowClear: true, loading: treeSelect.loading.value, data: treeSelect.data.value }
    }, {
      type: 'upload',
      label: t('user.index.572260-11'),
      field: 'avatar',
      props: {
        showFileList: false,
        fileList: file.value ? [file.value] : [],
        customRequest: imageRequest
      },
      slots: {
        'upload-button': () => (
          <div class={`arco-upload-list-item${file.value && file.value.status === 'error' ? ' arco-upload-list-item-error' : ''}`}>
            {
              (file.value && file.value.url ?
                <div class="arco-upload-list-picture custom-upload-avatar">
                  <img src={file.value.url} />
                  <div class="arco-upload-list-picture-mask">
                    <icon-edit />
                  </div>
                  {
                    file.value.status === 'uploading' && file.value.percent && file.value.percent < 1 &&
                    <a-progress percent={file.value.percent}
                      type="circle"
                      size="mini"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translateX(-50%) translateY(-50%)',
                      }}
                    />
                  }
                </div>
                :
                <div class="arco-upload-picture-card">
                  <div class="arco-upload-picture-card-text">
                    <icon-plus />
                    <div style="margin-top: 10px; font-weight: 600">{t('user.index.572260-12')}</div>
                  </div>
                </div>)
            }
          </div>
        )
      }
    }, {
      type: 'switch',
      label: t('user.index.572260-4'),
      field: 'enabled'
    }]
  }
  const changeFormByEdit = async () => {
    formOptions.value.columns = [{
      type: 'input',
      label: t('user.index.572260-6'),
      field: 'id',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('user.index.572260-0'),
      field: 'username',
      rules: [{ required: true, message: t('user.index.572260-7') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('user.index.572260-2'),
      field: 'nickName',
      props: { allowClear: true }
    }, {
      type: 'select',
      label: t('user.index.572260-3'),
      field: 'sex',
      options: userSexDict.options.value,
      props: { allowClear: true, loading: userSexDict.loading.value }
    }, {
      type: 'input',
      label: t('user.index.572260-8'),
      field: 'phone',
      props: { allowClear: true, max: 11, min: 11 }
    }, {
      type: 'input',
      label: '邮箱',
      field: 'email',
      props: { allowClear: true }
    }, {
      type: 'select',
      label: t('user.index.572260-9'),
      field: 'roles',
      options: roles.options.value,
      fieldType: 'array',
      props: { allowClear: true, loading: roles.loading.value, multiple: true }
    }, {
      type: 'tree-select',
      label: t('user.index.572260-10'),
      field: 'deptId',
      props: { allowClear: true, loading: treeSelect.loading.value, data: treeSelect.data.value }
    }, {
      type: 'upload',
      label: t('user.index.572260-11'),
      field: 'avatar',
      props: {
        showFileList: false,
        fileList: file.value ? [file.value] : [],
        customRequest: imageRequest
      },
      slots: {
        'upload-button': () => (
          <div class={`arco-upload-list-item${file.value && file.value.status === 'error' ? ' arco-upload-list-item-error' : ''}`}>
            {
              (file.value && file.value.url ?
                <div class="arco-upload-list-picture custom-upload-avatar">
                  <img src={file.value.url} />
                  <div class="arco-upload-list-picture-mask">
                    <icon-edit />
                  </div>
                  {
                    file.value.status === 'uploading' && file.value.percent && file.value.percent < 1 &&
                    <a-progress percent={file.value.percent}
                      type="circle"
                      size="mini"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translateX(-50%) translateY(-50%)',
                      }}
                    />
                  }
                </div>
                :
                <div class="arco-upload-picture-card">
                  <div class="arco-upload-picture-card-text">
                    <icon-plus />
                    <div style="margin-top: 10px; font-weight: 600">{t('user.index.572260-12')}</div>
                  </div>
                </div>)
            }
          </div>
        )
      }
    }, {
      type: 'switch',
      label: t('user.index.572260-4'),
      field: 'enabled'
    }]
  }
  watch(() => file.value, newVal => {
    genericRef.value?.setFormValue('avatar', newVal?.url)
  }, { deep: true })
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        immediate={true}
        isSelection={true}
        page={async (data: SysUserParam) => await userPage(data)}
        get={async (id: number | string) => await userOne(id)}
        save={async (data: SysUser) => await userAdd(data)}
        update={async (data: SysUser) => await userUpdate(data)}
        remove={async (id: number | string) => await userDelete(id)}
        rowKey={'id'}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        permission={{
          add: ['system:user:add'],
          del: ['system:user:del'],
          edit: ['system:user:edit'],
          query: ['system:user:query']
        }}
        onAdd={changeFormByAdd}
      >
      </GenericComment>
    </>
  )
})
