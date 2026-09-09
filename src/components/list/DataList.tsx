import { useEffect, type ReactNode } from 'react'

import {
  Flex, Grid, theme
} from 'antd6'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { ColumnSettings } from '@/components/list/ColumnSettings'
import { useDataListParams } from '@/hooks/list/useDataListParams'
import { useQuery } from '@/hooks/query/useQuery'

import {
  DataTable,
  type DataTableColumn,
  type DataTableSort
} from './DataTable'
import {
  columnCatalogConfig, resolveColumns, visibleColumns
} from './listColumns'

export interface DataListFetchArgs<Q extends Record<string, string>> {
  query: Q
  page: number
  pageSize: number
  sort: DataTableSort | null
}

export interface DataListFetchResult<R> {
  rows: R[]
  total: number
}

export interface DataListFiltersContext<Q extends Record<string, string>> {
  query: Q
  setQuery: (patch: Partial<Q>) => void
  clearQuery: (keys?: (keyof Q)[]) => void
  hasActiveFilters: boolean
}

export interface DataListEmptyContext<Q extends Record<string, string>> {
  query: Q
  clearQuery: (keys?: (keyof Q)[]) => void
  hasActiveFilters: boolean
}

export interface DataListErrorContext {
  error: Error
  refresh: () => void
}

export interface DataListProps<Q extends Record<string, string>, R extends object> {
  storageKey: string
  defaults: Q
  fetch: (args: DataListFetchArgs<Q>) => Promise<DataListFetchResult<R>>
  rowKey: keyof R | ((row: R) => string | number)
  columns: DataTableColumn<R>[] | ((ctx: { isMobile: boolean }) => DataTableColumn<R>[])
  filters?: ReactNode | ((ctx: DataListFiltersContext<Q>) => ReactNode)
  emptyText?: ReactNode | ((ctx: DataListEmptyContext<Q>) => ReactNode)
  error?: (ctx: DataListErrorContext) => ReactNode
  onRowClick?: (row: R) => void
  pageSizeOptions?: readonly number[]
  defaultPageSize?: number
  names?: Partial<{ [K in keyof Q]: string }>
}

export function DataList<Q extends Record<string, string>, R extends object>({
  storageKey,
  defaults,
  fetch,
  rowKey,
  columns,
  filters,
  emptyText,
  error: renderError,
  onRowClick,
  pageSizeOptions,
  defaultPageSize,
  names
}: DataListProps<Q, R>) {
  const { token } = theme.useToken()
  const { t } = useTranslation('simpleTableComponent')
  const { pathname } = useLocation()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  const catalog = resolveColumns(columns, false)
  const {
    settingsColumns, columnKeys, mandatoryColumnKeys, allowedSortKeys
  } = columnCatalogConfig(catalog)

  const list = useDataListParams<Q>({
    storageKey,
    defaults,
    names,
    allowedSortKeys,
    pageSizeOptions,
    defaultPageSize,
    columnKeys,
    mandatoryColumnKeys
  })

  const {
    data, loading, error, refresh
  } = useQuery(
    () => fetch({
      query: list.query,
      page: list.page,
      pageSize: list.pageSize,
      sort: list.sort
    }),
    [
      pathname,
      list.query,
      list.page,
      list.pageSize,
      list.sort
    ],
    { keepPreviousData: true }
  )

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const showError = Boolean(error) && rows.length === 0 && !loading

  useEffect(() => {
    if (total <= 0) return
    const lastPage = Math.max(1, Math.ceil(total / list.pageSize))
    if (list.page > lastPage) {
      list.applyTableChange({
        page: lastPage,
        pageSize: list.pageSize,
        sort: list.sort
      })
    }
  }, [
    list.applyTableChange,
    list.page,
    list.pageSize,
    list.sort,
    total
  ])

  if (showError && renderError && error) {
    return renderError({
      error,
      refresh: () => {
        void refresh()
      }
    })
  }

  const filterCtx: DataListFiltersContext<Q> = {
    query: list.query,
    setQuery: list.setQuery,
    clearQuery: list.clearQuery,
    hasActiveFilters: list.hasActiveFilters
  }
  const emptyCtx: DataListEmptyContext<Q> = {
    query: list.query,
    clearQuery: list.clearQuery,
    hasActiveFilters: list.hasActiveFilters
  }

  const tableColumns = visibleColumns(
    resolveColumns(columns, isMobile),
    list.visibleKeys
  )

  return (
    <Flex vertical gap={16}>
      <Flex
        gap={8}
        wrap="wrap"
        align="flex-start"
        justify="space-between"
      >
        <div style={{
          flex: 1,
          minWidth: 0
        }}
        >
          {typeof filters === 'function' ? filters(filterCtx) : filters}
        </div>
        <ColumnSettings
          columns={settingsColumns.map(column => ({
            key: column.key,
            label: typeof column.title === 'string' ? column.title : column.key,
            mandatory: column.hideable === false
          }))}
          visibleKeys={list.visibleKeys}
          onChange={list.setVisibleKeys}
          onReset={list.resetColumns}
          title={t('colunas')}
          resetLabel={t('restaurarColunas')}
          triggerLabel={t('colunas')}
        />
      </Flex>

      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        <DataTable<R>
          rowKey={rowKey}
          columns={tableColumns}
          data={rows}
          loading={loading}
          view={{
            page: list.page,
            pageSize: list.pageSize,
            total,
            sort: list.sort,
            pageSizeOptions
          }}
          onChange={list.applyTableChange}
          onRowClick={onRowClick}
          emptyText={typeof emptyText === 'function' ? emptyText(emptyCtx) : emptyText}
        />
      </div>
    </Flex>
  )
}
