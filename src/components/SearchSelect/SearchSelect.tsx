import React, { useCallback, useMemo, useState } from 'react'

import { Form, Select, SelectProps } from 'antd'
import debounce from 'lodash.debounce'
import { useFormContext } from 'react-hook-form'

import useAsync from '../../hooks/use-async'
import styles from './SearchSelect.module.scss'
import { Option, RequestFn, RequestParam } from './types'

export type SearchSelectProps<ValueType> = SelectProps<ValueType, Option> & {
  request: RequestFn
  requestParams?: Record<string, unknown>
  onChange?: (value?: Option | Option[]) => void
}

const SearchSelect = React.memo(<ValueType, >({
  request,
  requestParams,
  onChange,
  ...props
}: SearchSelectProps<ValueType>) => {
  const [options, setOptions] = useState<Option[]>([])

  const [isRequestingOptions, requestOptions] = useAsync(async (params: RequestParam) => {
    const response = await request({ ...params, ...requestParams })
    setOptions(response)
  })

  const handleSearch = useMemo<(text: string) => void>(() => {
    const onSearchCallback = (text: string) => {
      requestOptions({ limit: 10, page: 1, text })
        .catch(console.warn)
    }
    return debounce(onSearchCallback, 500)
  }, [requestOptions])

  const handleChange = useCallback<(_: unknown, option: Option | Option[]) => void>((_, option) => {
    onChange?.(option)
  }, [onChange])

  return (
    <Select
      {...props}
      showSearch
      showArrow
      allowClear
      filterOption={false}
      options={options}
      loading={isRequestingOptions}
      onSearch={handleSearch}
      onChange={handleChange}
      className={styles.select}
    />
  )
})

export type SearchSelectFieldProps<ValueType> = SearchSelectProps<ValueType> & {
  name: string
  label: string
}

export const SearchSelectField = React.memo(<ValueType, >({
  name,
  label,
  ...props
}: SearchSelectFieldProps<ValueType>) => {
  const { register, setValue, formState } = useFormContext<{ [property: string]: unknown }>()
  const { errors } = formState

  const { onBlur: handleBlur } = register(name, {

  })

  const handleChange = useCallback<(value: Option) => void>(value => {
    setValue(name, value)
  }, [name, setValue])

  const fieldError = errors && errors[name]
  const validateStatus = fieldError ? 'error' : ''
  const helpText = fieldError // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ? fieldError.message as string
    : undefined

  return (
    <Form.Item
      label={label}
      validateStatus={validateStatus}
      help={helpText}
    >
      <SearchSelect
        {...props}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange={handleChange}
        onFocus={handleBlur}
      />
    </Form.Item>
  )
})

export default SearchSelect
