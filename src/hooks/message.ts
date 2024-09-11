import { Message } from '@arco-design/web-vue'
import { RenderFunction } from 'vue'

const showMessage = Symbol('showMessage')

interface MessageConfig {
    id: string,
    duration: number,
    closable: boolean,
    showIcon: boolean,
    icon: RenderFunction,
}

type CallBack = (id: number | string) => void

class MessageBox {
    normal(content: string, params: MessageConfig, callBack: CallBack): void {
        this[showMessage]('normal', content, params, callBack)
    }
    success(content: string, params: MessageConfig, callBack: CallBack): void {
        this[showMessage]('success', content, params, callBack)
    }
    error(content: string, params: MessageConfig, callBack: CallBack): void {
        this[showMessage]('error', content, params, callBack)
    }
    warning(content: string, params: MessageConfig, callBack: CallBack): void {
        this[showMessage]('warning', content, params, callBack)
    }
    info(content: string, params: MessageConfig, callBack: CallBack): void {
        this[showMessage]('info', content, params, callBack)
    }
    loading(content: string, params: MessageConfig, callBack: CallBack): void {
        this[showMessage]('loading', content, params, callBack)
    }

    [showMessage](type: string, content: string, params: MessageConfig, callBack: CallBack) {
        Message[type]({ 
            content, 
            id: params.id, 
            duration: params.duration, 
            closable: params.closable, 
            showIcon: params.showIcon, 
            icon: params.icon,
            onClose: callBack ? (id: number | string) => callBack(id) : null
        })
    }
}

export default new MessageBox()
