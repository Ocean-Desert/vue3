import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import type { PropType } from 'vue'
import { cloneDeep } from 'lodash-es'
import { isNumber } from '@/utils/is'
import style from './index.module.scss'
import { useAppStore } from '@/store'
import { useEventListener } from '@vueuse/core'
import { isIE } from '@/utils'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { parse as jsoncParse, ParseError } from 'jsonc-parser'

export interface JsonEditorProps {
  modelValue: string
  width?: string | number
  height?: string | number
  showFullScreen?: boolean
  showLineNumber?: boolean
  showConsole?: boolean
  showToolbar?: boolean
  validateOnChange?: boolean
}

export default defineComponent((props: JsonEditorProps, { emit }) => {
  const appStore = useAppStore()
  const size = computed(() => appStore.size)
  const { t } = useI18n()
  
  const viewJsonStr = ref(props.modelValue ?? '')
  const editorWidth = ref(isNumber(props.width) ? `${props.width}px` : props.width)
  const editorHeight = ref(isNumber(props.height) ? `${props.height}px` : props.height)

  const isPass = ref(true)
  const calculaterNumber = ref('')
  const center = ref<HTMLDivElement>()
  const isFullScreen = ref(false)
  const codeCalculater = ref<HTMLTextAreaElement>()
  const editorRef = ref<HTMLTextAreaElement>()
  const consoleRef = ref<HTMLDivElement>()

  /**
   * 输入事件
   * @param event 
   */
  const handleTextareaInput = (event: Event) => {
    const editor = event.target as HTMLTextAreaElement
    const newValue = editor.value
    viewJsonStr.value = newValue
  }

  /**
   * 计算行数
   * @param value 
   */
  const calculateNumber = (value: string) => {
    const calculater = codeCalculater.value
    if (!calculater) return
    calculaterNumber.value = ''
    let editorValue: string | string[] = value
    editorValue = editorValue ?? ''
    editorValue = editorValue.replace(/\r/gi, '').split('\n')
    const valueLenght = editorValue.length
    if (valueLenght.toString().length > 3) {
      calculater.style.width = valueLenght.toString().length * 10 + 'px'
    } else {
      calculater.style.width = '100%'
    }
    for (let i = 1; i <= valueLenght; i++) {
      if (isIE()) {
        calculaterNumber.value += i + '\r\n'
      } else {
        calculaterNumber.value += i + '\n'
      }
    }
    calculater.value = calculaterNumber.value
  }

  // 预览对象
  watch(() => viewJsonStr.value, (newValue) => {
    if (props.showLineNumber) {
      calculateNumber(newValue)
    }
    const validate = validateJSON(newValue)
    if (!props.showConsole) {
      !validate && (isPass.value = false)
    }
    if (props.validateOnChange) {
      validate && emit('update:modelValue', newValue)
    } else {
      emit('update:modelValue', newValue)
    }
  })

  /**
   * 计算错误信息所在行列
   */
  const getLineAndColumn = (value: string, index: number) => {
    let line = 1
    let column = 1
    for (let i = 0; i < index; i++) {
      if (value[i] === '\n') {
        line++
        column = 1
      } else {
        column++
      }
    }
    return { line, column }
  }

  // json 格式美化
  const prettyFormat = (value: string) => {
    try {
      const parsed = jsoncParse(value)
      viewJsonStr.value = JSON.stringify(parsed, null, 4)
    } catch (e) {
      console.error(e)
    }
  }

  // 添加或删除全屏属性
  const fullScreen = () => {
    if (center.value) {
      if (center.value.className.includes('fullScreen')) {
        editorWidth.value = isNumber(props.width) ? `${props.width}px` : props.width
        editorHeight.value = isNumber(props.height) ? `${props.height}px` : props.height
        center.value.className = center.value.className.replace(' fullScreen', '')
        isFullScreen.value = false
      } else {
        editorHeight.value = '100vh'
        editorWidth.value = '100vw'
        center.value.className += ' fullScreen'
        isFullScreen.value = true
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (editorRef.value) {
      if (event.key === 'Backspace') {
        // 删除键
        handleBackspace(event)
      } else if (event.key === 'Enter') {
        // 回车键
        handleClickEnter(event)
      } else if (event.key === 'Tab') {
        // tab键
        handleTabKey(event)
      } else if (event.key === 'Escape') {
        // 退出全屏
        if (isFullScreen.value) {
          fullScreen()
        }
      }
    }
  }

  //
  /**
   * 括号补全事件
   * @param event 
   */
  const getMouseCheck = (event: KeyboardEvent) => {
    setAutoKey(event)
  }

  /**
   * 括号补全
   * @param event 
   */
  const setAutoKey = (event: KeyboardEvent) => {
    const editor = editorRef.value as HTMLTextAreaElement
    if (event.key === `'` || event.key === `"`) {
      event.preventDefault() // 阻止默认行为
      const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
      const newText = `${event.key}` + selectedText + `${event.key}`
      const cursorPosition = editor.selectionStart + 1
      editor.value =
        editor.value.substring(0, editor.selectionStart) +
        newText +
        editor.value.substring(editor.selectionEnd)
      editor.setSelectionRange(cursorPosition, cursorPosition)
    } else if (event.key === '(') {
      event.preventDefault() // 阻止默认行为
      const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
      const newText = '(' + selectedText + ')'
      const cursorPosition = editor.selectionStart + 1
      editor.value =
        editor.value.substring(0, editor.selectionStart) +
        newText +
        editor.value.substring(editor.selectionEnd)
      editor.setSelectionRange(cursorPosition, cursorPosition)
    } else if (event.key === '[') {
      event.preventDefault() // 阻止默认行为
      const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
      const newText = '[' + selectedText + ']'
      const cursorPosition = editor.selectionStart + 1
      editor.value =
        editor.value.substring(0, editor.selectionStart) +
        newText +
        editor.value.substring(editor.selectionEnd)
      editor.setSelectionRange(cursorPosition, cursorPosition)
    } else if (event.key === '{') {
      event.preventDefault() // 阻止默认行为
      const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
      const newText = '{' + selectedText + '}'
      const cursorPosition = editor.selectionStart + 1
      editor.value =
        editor.value.substring(0, editor.selectionStart) +
        newText +
        editor.value.substring(editor.selectionEnd)
      editor.setSelectionRange(cursorPosition, cursorPosition)
    }
    viewJsonStr.value = editor.value
  }
  /*------------------------------------------------括号高亮------------------------------------------------------------*/
  const findOpeningBracketIndex = (text: string, startIndex: number, char: string) => {
    const openingBrackets = {
      ']': '[',
      '}': '{',
      ')': '(',
    }
    let count = 0
    for (let i = startIndex; i >= 0; i--) {
      if (text.charAt(i) === char) {
        count++
      } else if (text.charAt(i) === openingBrackets[char]) {
        count--
        if (count === 0) {
          return i
        }
      }
    }
    return -1
  }

  const findClosingBracketIndex = (text, startIndex, char) => {
    const closingBrackets = {
      '[': ']',
      '{': '}',
      '(': ')',
    }
    let count = 0
    for (let i = startIndex; i < text.length; i++) {
      if (text.charAt(i) === char) {
        count++
      } else if (text.charAt(i) === closingBrackets[char]) {
        count--
        if (count === 0) {
          return i
        }
      }
    }
    return -1
  }
  const isBracket = (char: string) => {
    return ['[', ']', '{', '}', '(', ')'].includes(char)
  }

  const validateJSON = (value: string) => {
    const onlyNumber = /^\d+$/.test(value)
    if (onlyNumber) {
      isPass.value = false
      return false
    }

    const errors: ParseError[] = []
    jsoncParse(value, errors, { allowTrailingComma: false })
    
    if (errors.length > 0) {
      isPass.value = false
      return false
    }

    isPass.value = true
    return true
  }

  const jsonObj = computed(() => {
    const value = cloneDeep(viewJsonStr.value)
    // 如果输入的全是数字，JSON.parse(str)不会报错，需要手动处理一下
    // const onlyNumber = /^\d+$/.test(value)
    const dom = consoleRef.value
    const setColor = (color: string) => {
      if (dom) {
        dom.style.color = color
      }
    }
    if (value) {
      try {
        if (!validateJSON(value)) {
          setColor(`rgb(var(--red-6))`)
          isPass.value = false
          return `"${value}" is not valid JSON`
        } else {
          // setColor('black')
          setColor(`rgb(var(--success-6))`)
          return `校验通过`
        }
      } catch (e: SyntaxError | unknown) {
        let err = e as SyntaxError
        isPass.value = false
        setColor(`rgb(var(--red-6))`)
        if (err.message?.match(/position\s+(\d+)/)) {
          const location = (err.message?.match(/position\s+(\d+)/) as string[])[1]
          const str1 = value.substring(0, location).trim()
          const str2 = str1.split('\n')
          const message = err.message.substring(0, err.message.indexOf('position'))
          // 如果当前行或者前一行有'['
          if (str2[str2.length - 1]?.includes('[')) {
            const { line, column } = getLineAndColumn(str1, str1.length - 1)
            return `${message} at line ${line},column ${column}`
          }
          const { line, column } = getLineAndColumn(value, Number(location))
          return `${message} at line ${line},column ${column}`
        } else {
          return value + ' is not valid JSON'
        }
      }
    } else {
      return null
    }
  })
  
  /**
   * 点击括号寻找对应另一半高亮
   * @param event 
   */
  const handleClick = (event: Event) => {
    const editor = editorRef.value as HTMLTextAreaElement
    const { selectionStart, selectionEnd, value } = editor
    const clickedChar = value.charAt(selectionStart)
    if (isBracket(clickedChar)) {
      const openingBracketIndex = findOpeningBracketIndex(value, selectionStart, clickedChar)
      const closingBracketIndex = findClosingBracketIndex(value, selectionStart, clickedChar)
      if (openingBracketIndex !== -1) {
        editor.setSelectionRange(openingBracketIndex, openingBracketIndex + 1)
      } else if (closingBracketIndex !== -1) {
        editor.setSelectionRange(closingBracketIndex, closingBracketIndex + 1)
      }
    }
  }
  /**
   * 回车事件
   * @param event 
   */
  const handleClickEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      const textarea = event.target as HTMLTextAreaElement
      const cursorPosition = textarea.selectionStart
      const value = textarea.value

      // 到光标前一行的起始位置
      const lastLineStart = value.lastIndexOf('\n', cursorPosition - 1) + 1
      // 获取前一行的缩进
      const previousLineIndentation = value.slice(lastLineStart, cursorPosition).match(/^\s*/)?.[0] || ''

      if (
        (value[cursorPosition - 1] === '{' && value[cursorPosition] === '}') ||
        (value[cursorPosition - 1] === '[' && value[cursorPosition] === ']') ||
        (value[cursorPosition - 1] === '(' && value[cursorPosition] === ')')
      ) {
        // 插入缩进和换行
        textarea.value =
          value.slice(0, cursorPosition) +
          '\n' +
          previousLineIndentation + // 继承上一行的缩进
          '    ' + // 自动加上 4 个空格的缩进
          '\n' +
          previousLineIndentation + // 闭合括号对齐
          value.slice(cursorPosition)

        // 设置光标位置到缩进后的新行
        textarea.setSelectionRange(cursorPosition + previousLineIndentation.length + 5, cursorPosition + previousLineIndentation.length + 5)
        viewJsonStr.value = textarea.value
        event.preventDefault()
      } else {
        // 如果不是匹配的符号对，则仅在新行插入相同的缩进
        textarea.value =
          value.slice(0, cursorPosition) +
          '\n' +
          previousLineIndentation + // 继承上一行的缩进
          value.slice(cursorPosition)

        // 设置光标位置到缩进后的新行
        textarea.setSelectionRange(cursorPosition + previousLineIndentation.length + 1, cursorPosition + previousLineIndentation.length + 1)
        viewJsonStr.value = textarea.value
        event.preventDefault()
      }
    }
  }
  /**
   * tab事件
   * @param event 
   */
  const handleTabKey = (event: KeyboardEvent) => {
    const textarea = editorRef.value as HTMLTextAreaElement
    const { selectionStart, selectionEnd } = textarea
    const tabSpaces = '    ' // 4 spaces
    event.preventDefault()

    if (selectionStart === selectionEnd) {
      // 单行缩进：在光标位置插入 4 个空格
      textarea.value =
        textarea.value.substring(0, selectionStart) +
        tabSpaces +
        textarea.value.substring(selectionEnd)
      
      // 将光标移动到插入的空格后
      textarea.selectionStart = selectionStart + tabSpaces.length
      textarea.selectionEnd = selectionStart + tabSpaces.length
    } else {
      // 多行缩进：在每行前添加 4 个空格
      const selectedText = textarea.value.substring(selectionStart, selectionEnd)
      const indentedText = selectedText
        .split('\n')
        .map(line => tabSpaces + line)
        .join('\n')

      textarea.value =
        textarea.value.substring(0, selectionStart) +
        indentedText +
        textarea.value.substring(selectionEnd)

      // 更新选择范围，保持多行选中
      textarea.selectionStart = selectionStart
      textarea.selectionEnd = selectionStart + indentedText.length
    }
  }

  /**
   * 删除键处理事件
   * @param event 
   */
  const handleBackspace = (event: KeyboardEvent) => {
    const editor = event.target as HTMLTextAreaElement
    const cursorPosition = editor.selectionStart
    const textBeforeCursor = viewJsonStr.value.slice(0, cursorPosition)
    const textAfterCursor = viewJsonStr.value.slice(cursorPosition)
    if (
      (textBeforeCursor.endsWith('"') && textAfterCursor.startsWith('"')) ||
      (textBeforeCursor.endsWith(`'`) && textAfterCursor.startsWith(`'`)) ||
      (textBeforeCursor.endsWith('[') && textAfterCursor.startsWith(']')) ||
      (textBeforeCursor.endsWith('{') && textAfterCursor.startsWith('}')) ||
      (textBeforeCursor.endsWith('(') && textAfterCursor.startsWith(')'))
    ) {
      event.preventDefault()
      viewJsonStr.value = textBeforeCursor.slice(0, -1) + textAfterCursor.slice(1)
      nextTick(() => {
        editor.selectionStart = cursorPosition - 1
        editor.selectionEnd = cursorPosition - 1
      }).then((r) => {
        console.log(r, 'nextTick')
      })
    }
  }
  const handleScroll = (e: Event) => {
    const editor = e.target as HTMLTextAreaElement
    const codeCounter = codeCalculater.value as HTMLTextAreaElement
    codeCounter.scrollTop = editor.scrollTop
  }

  onMounted(() => {
    useEventListener(window, 'keydown', handleKeyDown)
    useEventListener(document, 'keydown', getMouseCheck)
    if (props.showLineNumber) {
      calculateNumber(props.modelValue)
    }
  })

  return () => (
    <div ref={center} id={style.editorBody} style={{ width: editorWidth.value, height: editorHeight.value }}>
      <div style={{ height: `${props.showConsole ? '80%' : '100%'}`, display: 'flex', flexDirection: 'column' }}>
        {props.showToolbar &&
          <div class={style.toolSlider}>
            <a-space size={size.value}>
              {{
                split: () => <div class={style.toolSplitLine}></div>,
                default: () => (
                  <>
                    <a-tooltip content="格式化" mini={true}>
                      <icon-code-block size={16} class={style.iconHover} onClick={() => prettyFormat(viewJsonStr.value)} />
                    </a-tooltip>
                    <a-tooltip content="去除空格" mini={true}>
                      <icon-filter size={16} class={style.iconHover} onClick={() => viewJsonStr.value = viewJsonStr.value.replace(/\s+/g, '')} />
                    </a-tooltip>
                    {props.showFullScreen &&
                      <a-tooltip content={ isFullScreen.value ? t('global.setting.quitFullScreen') : t('global.setting.selectFullScreen') } mini={true}>
                        { isFullScreen.value ?
                          <icon-shrink size={16} class={style.iconHover} onClick={fullScreen} title="退出" />
                          : <icon-expand size={16} class={style.iconHover} onClick={fullScreen} title="全屏" />
                        }
                      </a-tooltip>
                    }
                  </>
                )
              }}
            </a-space>
            <div style="display: flex; align-items: center">
              { isPass.value ? <icon-check-circle-fill class={style.iconSuccessHover} size={16} /> : <icon-close-circle-fill class={style.iconDangerHover} size={16} /> }
            </div>
          </div>
        }
        <div class={style.editContainer} style={{ height: `calc(100%${props.showConsole && ' - 25px'})` }}>
          {
            props.showLineNumber ??
            <div class={style.leftBox}>
              <textarea ref={codeCalculater} wrap="off" cols={10} id={style.leftNum} disabled={true} />
            </div>
          }
          <textarea
            ref={editorRef}
            id={style.rightNum}
            placeholder="请输入JSON字符串"
            onScroll={(e: Event) => props.showLineNumber && handleScroll(e)}
            value={viewJsonStr.value}
            onClick={handleClick}
            onInput={handleTextareaInput}
          />
        </div>
      </div>
      { props.showConsole &&
        <div id={style.console} ref={consoleRef}>{jsonObj.value}</div>
      }
    </div>
  )
},
  {
    props: {
      modelValue: {
        type: String as PropType<string>,
        required: true,
      },
      width: {
        type: [String, Number] as PropType<string | number>,
        required: false,
        default: '600px',
      },
      height: {
        type: [String, Number] as PropType<string | number>,
        required: false,
        default: '300px',
      },
      showFullScreen: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: true
      },
      showLineNumber: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: true
      },
      showConsole: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: true
      },
      showToolbar: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: true
      },
      validateOnChange: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: false
      }
    },
    emits: ['update:modelValue'],
  }
)