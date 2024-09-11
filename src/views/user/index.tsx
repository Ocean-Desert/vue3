import { computed, defineComponent, onMounted, ref } from 'vue'
import style from './index.module.scss'
import { useAppStore } from '@/store'
import { decryptData, encryptData } from '@/utils/security'
import { userInfo, editPassword, editUser, upload } from '@/api/common'
import { User, UserInfo } from '@/store/modules/user/types'
import { DescData, FileItem, Message } from '@arco-design/web-vue'
import { dict } from '@/api/system/dict'
import { SysDictData } from '@/api/system/dict/type'
import BasicInformation from './components/basic-information'
import SecuritySettings from './components/security-settings'
import { useFileSystemAccess } from '@vueuse/core'
import { useUpload } from '@/hooks/options'
import { UploadOptions } from '@/api/common/type'
import { useI18n } from 'vue-i18n'
import useUser from '@/hooks/user'
import { uuid } from '@/utils'

export default defineComponent(() => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const { logout } = useUser()
  const size = computed(() => appStore.size)
  const userInfoData = ref<User>()
  const sexDict = ref<SysDictData[]>([])
  const descData = computed<DescData[]>(() => ([
    { label: t('user.index.776470-0'), value: userInfoData.value?.sysDept?.deptName as string },
    { label: t('user.index.776470-1'), value: sexDict.value.find(item => item.dictValue === (userInfoData.value?.sex as string))?.dictLabel || '' },
    { label: t('user.index.776470-2'), value: String(userInfoData.value?.id) },
    { label: t('user.index.776470-3'), value: userInfoData.value?.phone as string },
    { label: t('user.index.776470-4'), value: userInfoData.value?.createTime as string },
  ]))

  const fetchDictData = async () => {
    const { data } = await dict('sys_user_sex')
    sexDict.value = data as SysDictData[]
    console.log(data, 'dict');
  }
  const fetchData = async () => {
    const { data } = await userInfo()
    userInfoData.value = data?.userDetails
  }

  const onChangeAvatar = async () => {
    const { isSupported, open, file } = useFileSystemAccess({
      dataType: 'Blob',
      types: [{
        description: 'Images',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/gif': ['.gif'],
        },
      }],
      excludeAcceptAllOption: true
    })
    if (isSupported) {
      await open()
      const fileItem: FileItem = { uid: uuid(), file: file.value }
      const { imageRequest } = useUpload(async (form: FormData, options?: UploadOptions) => await upload(form, options))
      imageRequest({
        fileItem,
        onProgress: (percent) => {},
        onSuccess: (response) => {
          Message.success(response.msg)
          updateUserAvatar(response.data[0].path)
        },
        onError: (error) => {},
      })
    } else {
      Message.warning(t('user.index.776470-5'))
    }
  }

  const updateUserAvatar = async (avatar: string) => {
    const { success } = await editUser({ avatar })
    if (success) logout()
  }

  onMounted(() => {
    fetchDictData()
    fetchData()
  })

  return () => (
    <>
      <div>
        <div class={style.userInfoHeader}>
          <a-space size={size.value} direction="vertical" align="center">
            <a-avatar triggerType="mask" size={64} onClick={onChangeAvatar}>
              {{
                'default': () => <img alt="avatar" src={userInfoData.value?.avatar} />,
                'trigger-icon': () => <icon-edit />
              }}
            </a-avatar>
            <a-typography-title heading={6} style="margin: 0;">
              { userInfoData.value?.nickName }
            </a-typography-title>
            <a-descriptions data={descData.value} align={{ label: 'right' }} size={size.value} />
          </a-space>
        </div>
        <div class={style.userInfoPanel}>
          <a-tabs size={size.value} defaultActiveKey={'1'}>
            <a-tab-pane key="1" title={t('user.index.776470-6')}>
              <BasicInformation />
            </a-tab-pane>
            <a-tab-pane key="2" title={t('user.index.776470-7')}>
              <SecuritySettings />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </>
  )
})