/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CSSProperties, ReactNode } from 'react'

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
  value?: AntdSelectProps['value']
  defaultValue?: AntdSelectProps['defaultValue']
  onChange?: AntdSelectProps['onChange']
  placeholder?: string
  allowClear?: boolean
  disabled?: boolean
  id?: string
  className?: string
  style?: CSSProperties
  filterOption?: boolean | ((inputValue: string, option?: O) => boolean)
  onSearch?: (value: string) => void
  onOpenChange?: (visible: boolean) => void
  notFoundContent?: ReactNode
}

export function Select<O extends Option>({
  options,
  filterOption,
  onSearch,
  notFoundContent,
  ...props
}: SelectProps<O>) {
  const searchable = onSearch !== undefined || filterOption !== undefined

  return (
    <AntdSelect
      options={options}
      showSearch={searchable
        ? {
          filterOption: filterOption ?? (onSearch === undefined),
          onSearch
        }
        : false}
      notFoundContent={notFoundContent ?? <span>Nenhum resultado encontrado</span>}
      {...props}
    />
  )
}
