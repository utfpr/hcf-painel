import {
  useEffect, useMemo, useState
} from 'react'

import { Spin } from 'antd6'
import debounce from 'lodash.debounce'

import { useQuery } from '@/hooks/query/useQuery'

import {
  Option, DefaultOption,
  Select
} from './Select'

export interface AsyncSelectProps<O extends Option = DefaultOption> {
  fetchKey: string
  fetcher: (search?: string) => Promise<O[]>
  debounceDelay?: number
  allowClear?: boolean
  className?: string
  style?: React.CSSProperties
}

function renderNotFoundContent(loading?: boolean, error?: Error) {
  if (loading) return <Spin size="small" />
  if (error) return <span>Erro ao buscar resultados</span>

  return <span>Nenhum resultado encontrado</span>
}

export function AsyncSelect<O extends Option>({
  fetchKey,
  fetcher,
  debounceDelay = 200,
  ...props
}: AsyncSelectProps<O>) {
  const [search, setSearch] = useState<string>()

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value)
    }, debounceDelay),
    [debounceDelay]
  )

  useEffect(() => () => {
    debouncedSearch.cancel()
  }, [debouncedSearch])

  const handleOpenChange = (visible: boolean) => {
    if (visible && search === undefined) {
      setSearch('')
    }
  }

  const {
    data,
    loading,
    error
  } = useQuery(
    () => fetcher(search),
    search === undefined ? null : [fetchKey, search]
  )

  return (
    <Select
      {...props}
      options={data ?? []}
      filterOption={false}
      onSearch={debouncedSearch}
      onOpenChange={handleOpenChange}
      notFoundContent={renderNotFoundContent(loading, error)}
    />
  )
}
