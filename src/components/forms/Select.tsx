/* eslint-disable @typescript-eslint/no-explicit-any */

import { Select as AntdSelect, type SelectProps as AntdSelectProps } from 'antd6'

export interface Option {
  [property: string]: any
}

export interface DefaultOption extends Option {
  label: string
  value: string
}

export interface SelectProps<O extends Option = DefaultOption> {
  options: O[]
  allowClear?: boolean
  filterOption?: boolean | ((inputValue: string, option?: O) => boolean)
  onSearch?: (value: string) => void
  onOpenChange?: (visible: boolean) => void
  notFoundContent?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Select<O extends Option>({
  options,
  filterOption,
  onSearch,
  notFoundContent,
  ...props
}: SelectProps<O>) {
  return (
    <AntdSelect
      options={options}
      showSearch={{
        filterOption: filterOption ?? false,
        onSearch: onSearch
      }}
      notFoundContent={notFoundContent ?? <span>Nenhum resultado encontrado</span>}
      {...props}
    />
  )
}
