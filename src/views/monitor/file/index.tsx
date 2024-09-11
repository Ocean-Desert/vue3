import { download, preview } from '@/api/common'
import { fileList, fileRemove, fileRename } from '@/api/monitor/file'
import type { FileAttrs, FileAttrsParams } from '@/api/monitor/file/type'
import GenericComment from '@/components/generic/index'
import style from './index.module.scss'
import PreviewComment from '@/components/preview/index'
import { useDisplay } from '@/hooks/options'
import { GenericInstance } from '@/types/generic'
import { downloadFile, getAssetsFile } from '@/utils'
import { sessionStorage } from '@/utils/storage'
import { InputInstance, Modal, TableColumnData, TableData } from '@arco-design/web-vue'
import { computed, defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Icon } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store'

export default defineComponent(() => {
  const { t } = useI18n()
  const appSotre = useAppStore()
  const size = computed(() => appSotre.size)
  const visible = ref(false)
  const previewShow = ref(false)
  const fileBuffer = ref<Blob>()
  const curPreviewFile = ref<string>()
  const genericRef = ref<GenericInstance>()
  const renameInputRef = ref<InputInstance>()
  const searchModel = ref<FileAttrsParams>({ path: sessionStorage.get<string>('file-path', '') })
  const IconFont = Icon.addFromIconFontCn({ src: getAssetsFile('/iconfont/iconfont.js') })
  const renameForm = reactive<FileAttrs>({ path: '', name: '' })
  const permission = {
    preview: ['monitor:file:preview'],
    del: ['monitor:file:del'],
    add: ['monitor:file:add'],
    rename: ['monitor:file:rename'],
    download: ['monitor:file:download']
  }
  const columns = computed<TableSpace.Columns[]>(() => ([
    {
      type: 'default',
      props: {
        title: t('file.index.818932-0'),
        dataIndex: 'name',
        align: 'center',
        fixed: 'left',
        render: (data: { record: FileAttrs; column: TableColumnData; rowIndex: number; }) => (
          data.record.isRename ?
          <a-input ref={renameInputRef} v-model={renameForm.name} onBlur={() => handleRename(data.record)} size={size.value} />
            :
          <div class={data.record.type ? '' : style.filename} onClick={(e: Event) => data.record.type ? e.preventDefault() : onOpen(data.record)}>
            <IconFont type={data.record.type ? 'icon-file' :'icon-folder'} size={14}></IconFont>{data.record.name}
          </div>
        )
      }
    }, {
      type: 'default',
      props: {
        title: t('file.index.818932-1'),
        dataIndex: 'size',
        align: 'center',
        render: (data: { record: FileAttrs; column: TableColumnData; rowIndex: number; }) => <span>{(data.record?.size as number) + (data.record?.sizeType as string)}</span>
      }
    }, {
      type: 'default',
      props: {
        title: t('file.index.818932-2'),
        dataIndex: 'typeName',
        align: 'center',
        ellipsis: true,
      }
    }, {
      type: 'default',
      props: {
        title: t('file.index.818932-3'),
        dataIndex: 'createTime',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('file.index.818932-4'),
        dataIndex: 'updateTime',
        align: 'center',
      }
    }, {
      type: 'default',
      props: {
        title: t('file.index.818932-5'),
        align: 'center',
        fixed: 'right',
        width: 300,
        render: (data: { record: FileAttrs; column: TableColumnData; rowIndex: number; }) => {
          if (data.record.type) {
            return (
              <a-space size={size.value}>
                <a-tooltip content={t('file.index.818932-6')}>
                  <a-button onClick={() => onPreview(data.record)} v-permission={permission.preview} type="text" size={size.value}>{t('file.index.818932-6')}</a-button>
                </a-tooltip>
                <a-tooltip content={t('file.index.818932-7')}>
                  <a-button onClick={() => onDownload(data.record)} v-permission={permission.download} type="text" size={size.value}>{t('file.index.818932-7')}</a-button>
                </a-tooltip>
                <a-tooltip content={t('file.index.818932-8')}>
                  <a-button onClick={() => onRename(data.record)} v-permission={permission.rename} type="text" size={size.value}>{t('file.index.818932-8')}</a-button>
                </a-tooltip>
                <a-tooltip content={t('file.index.818932-9')}>
                  <a-button onClick={() => onRemove(data.record)} v-permission={permission.del} type="text" size={size.value}>{t('file.index.818932-9')}</a-button>
                </a-tooltip>
              </a-space>
            )
          } else {
            return (
              <a-space size={size.value}>
                <a-tooltip content={t('file.index.818932-10')}>
                  <a-button onClick={() => onOpen(data.record)} type="text" size={size.value}>{t('file.index.818932-10')}</a-button>
                </a-tooltip>
                <a-tooltip content={t('file.index.818932-8')}>
                  <a-button onClick={() => onRename(data.record)} v-permission={permission.rename} type="text" size={size.value}>{t('file.index.818932-8')}</a-button>
                </a-tooltip>
                <a-tooltip content={t('file.index.818932-9')}>
                  <a-button onClick={() => onRemove(data.record)} v-permission={permission.del} type="text" size={size.value}>{t('file.index.818932-9')}</a-button>
                </a-tooltip>
              </a-space>
            )
          }
        }
      }
    }
  ]))
  const searchOptions = computed<FormSpace.Options>(() => ({
    form: { layout: 'horizontal', size: size.value },
    btns: { hide: false },
    columns: [{
      type: 'input',
      label: t('file.index.818932-0'),
      field: 'name'
    }]
  }))
  const formOptions = computed<FormSpace.Options>(() => ({
    form: { size: size.value },
    btns: { hide: true },
    columns: [{
      type: 'input',
      label: t('file.index.818932-0'),
      field: 'name',
      rules: [{ required: true, message: t('file.index.818932-11') }],
      props: { allowClear: true }
    }, {
      type: 'input',
      label: t('file.index.818932-1'),
      field: 'size',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('file.index.818932-2'),
      field: 'typeName',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('file.index.818932-3'),
      field: 'createTime',
      props: { readonly: true }
    }, {
      type: 'input',
      label: t('file.index.818932-4'),
      field: 'updateTime',
      props: { readonly: true }
    }]
  }))
  const onOpen = (record: FileAttrs) => {
    searchModel.value.path += '/' + record.name
    genericRef.value?.fetchData()
  }
  const onBack = () => {
    Reflect.deleteProperty(searchModel.value, 'name')
    const lastIndex = searchModel.value.path?.lastIndexOf('/')
    if (lastIndex !== -1) {
      searchModel.value.path = searchModel.value.path?.substring(0, lastIndex)
    } else {
      Reflect.set(searchModel.value, 'path', '')
    }
    genericRef.value?.fetchData()
  }
  const handleRename = async (record: FileAttrs) => {
    record.isRename = false
    await fileRename(renameForm)
    renameForm.name = ''
    renameForm.path = ''
    genericRef.value?.fetchData()
  }
  const onRename = (record: FileAttrs) => {
    record.isRename = true
    renameForm.path = record.path
    renameForm.name = record.name
    nextTick(() => {
      renameInputRef.value?.focus()
    })
  }
  const onRemove = async (record: FileAttrs) => {
    Modal.warning({
      title: t('file.index.818932-12'),
      content: t('file.index.818932-13'),
      hideCancel: false,
      maskClosable: false,
      onBeforeOk: async () => {
        await fileRemove(record.path as string)
        genericRef.value?.fetchData()
      }
    })
  }
  const onPreview = async (record: FileAttrs) => {
    const data = await preview({ file: record.path as string })
    fileBuffer.value = data
    curPreviewFile.value = record.name
    previewShow.value = true
    visible.value = true
  }
  const onDownload = async (record: FileAttrs) => {
    const data = await download({ file: record.path as string })
    downloadFile(data, record.name as string)
  }
  const onEnter = () => {
    genericRef.value?.fetchData()
  }
  watch(() => searchModel.value.path, (val) => {
    sessionStorage.set('file-path', val)
  })
  return () => (
    <>
      <GenericComment
        ref={genericRef}
        isPagination={false}
        v-model={[searchModel.value, 'searchModel']}
        columns={columns.value}
        searchOptions={searchOptions.value}
        formOptions={formOptions.value}
        list={async (data: FileAttrsParams) => await fileList(data)}
        display={useDisplay({ showBatchEdit: false }).value}
      >
        {{
          'operate-left': () => (
            <a-input
              style="width:320px;"
              modelValue={searchModel.value.path}
              onUpdate:modelValue={(value: string) => searchModel.value.path = value}
              onPressEnter={() => onEnter()}
              size={size.value}
            >
              {{
                prepend: () => (
                  <a-button onClick={onBack} disabled={!searchModel.value.path} size={size.value}>
                    {{ icon: () => <icon-arrow-left /> }}
                  </a-button>
                )
              }}
            </a-input>
          )
        }}
      </GenericComment>
      <a-modal v-model:visible={visible.value} onCancel={() => previewShow.value = false } title={curPreviewFile.value} footer={false} width={'auto'}>
        { previewShow.value && <PreviewComment buffer={fileBuffer.value} fileName={curPreviewFile.value}></PreviewComment> }
      </a-modal>
    </>
  )
})