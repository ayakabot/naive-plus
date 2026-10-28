import { computed, defineComponent, type PropType, type VNode } from 'vue'
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { buildOperationOptions } from './use-action-option'
import type {
  TableOperationDefaultOptions,
  TableOperationOptions,
} from './interface'
import IconMore from './icon/more.vue'

const bemClass = 'np-table__operation'

type OperationRender = (
  rowData: Record<string, any>,
  rowIndex: number
) => VNode | VNode[] | undefined

export default defineComponent({
  name: 'NpTableAction',
  props: {
    rowData: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
    options: {
      type: [Array, Function] as PropType<TableOperationOptions>,
    },
    defaultOptions: {
      type: Object as PropType<TableOperationDefaultOptions>,
    },
    prefixRender: {
      type: Function as PropType<OperationRender>,
    },
    suffixRender: {
      type: Function as PropType<OperationRender>,
    },
    onSelect: {
      type: Function as PropType<(key: string) => void | boolean>,
    },
  },
  setup(props) {
    const dropdownOptions = computed<DropdownOption[]>(() =>
      buildOperationOptions(
        props.options,
        props.rowData,
        props.rowIndex,
        props.defaultOptions
      )
    )

    return () => (
      <div class={bemClass}>
        {props.prefixRender?.(props.rowData, props.rowIndex)}
        <NDropdown
          trigger="click"
          placement="bottom-end"
          options={dropdownOptions.value}
          class={`${bemClass}-dropdown`}
          onSelect={(key: string | number) => props.onSelect?.(String(key))}
        >
          <NButton size="small" secondary class={`${bemClass}-button`}>
            {{ icon: () => <IconMore /> }}
          </NButton>
        </NDropdown>
        {props.suffixRender?.(props.rowData, props.rowIndex)}
      </div>
    )
  },
})
