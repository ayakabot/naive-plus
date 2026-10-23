import type { FormGridItemProps, FormOption } from './interface'

/** 默认栅格列数，与 n-grid 默认值保持一致 */
const DEFAULT_GRID_COLS = 24

/**
 * 解析表单项的栅格占位
 *
 * 注意：`np-form`（决定 `n-grid` 计算出的 privateSpan）与 `np-form-item`
 * （决定 `n-form-item-gi` 的公开 span / offset）各调用一次，两处结果必须保持一致，
 * 修改默认值规则时需同步确认。
 * @param option 表单配置
 * @param formItemProps 表单项属性
 * @returns 栅格占位，未指定 `span` 时占满整行
 */
export const getGridItemProps = (
  option: FormOption<any> | undefined,
  formItemProps?: FormGridItemProps
) => ({
  span: formItemProps?.span ?? option?.grid?.cols ?? DEFAULT_GRID_COLS,
  offset: formItemProps?.offset,
})
