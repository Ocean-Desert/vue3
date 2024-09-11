import { ref, type Ref } from 'vue'

const useComponentMethods = (refTable: Ref, methods: string[]) => {
  const tableEmits: Record<string, (...args: any) => void> = {}
  for (const method of methods) {
    tableEmits[method] = (...args: any) => {
      if (refTable.value && refTable.value[method]) {
        refTable.value[method](...args)
      }
    }
  }
  return tableEmits
}

export default useComponentMethods 