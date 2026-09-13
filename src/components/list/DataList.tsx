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

export interface DataListFetchArgs<F extends Record<string, string>> {
  filter: F
  page: number
  pageSize: number
  sort: DataTableSort | null
}

export interface DataListFetchResult<R> {
  rows: R[]
  total: number
}

export interface DataListFiltersContext<F extends Record<string, string>> {
  filter: F
  setFilter: (patch: Partial<F>) => void
  clearFilter: (keys?: (keyof F)[]) => void
  hasActiveFilters: boolean
}

export interface DataListEmptyContext<F extends Record<string, string>> {
  filter: F
  clearFilter: (keys?: (keyof F)[]) => void
  hasActiveFilters: boolean
}

export interface DataListErrorContext {
  error: Error
  refresh: () => void
}

export interface DataListProps<F extends Record<string, string>, R extends object> {
  storageKey: string
  defaults: F
  fetcher: (args: DataListFetchArgs<F>) => Promise<DataListFetchResult<R>>
  rowKey: keyof R | ((row: R) => string | number)
  columns: DataTableColumn<R>[] | ((ctx: { isMobile: boolean }) => DataTableColumn<R>[])
  filterContent?: ReactNode | ((ctx: DataListFiltersContext<F>) => ReactNode)
  emptyContent?: ReactNode | ((ctx: DataListEmptyContext<F>) => ReactNode)
  errorContent?: (ctx: DataListErrorContext) => ReactNode
  onRowClick?: (row: R) => void
  pageSizeOptions?: readonly number[]
  defaultPageSize?: number
}

export function DataList<F extends Record<string, string>, R extends object>({
  storageKey,
  defaults,
  fetcher,
  rowKey,
  columns,
  filterContent,
  emptyContent,
  errorContent,
  onRowClick,
  pageSizeOptions,
  defaultPageSize
}: DataListProps<F, R>) {
  const { token } = theme.useToken()
  const { t } = useTranslation('simpleTableComponent')
  const { pathname } = useLocation()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  const catalog = resolveColumns(columns, false)
  const {
    settingsColumns, columnKeys, mandatoryColumnKeys, allowedSortKeys
  } = columnCatalogConfig(catalog)

  const list = useDataListParams<F>({
    storageKey,
    defaults,
    allowedSortKeys,
    pageSizeOptions,
    defaultPageSize,
    columnKeys,
    mandatoryColumnKeys
  })

  const {
    data, loading, error, refresh
  } = useQuery(
    () => fetcher({
      filter: list.filter,
      page: list.page,
      pageSize: list.pageSize,
      sort: list.sort
    }),
    [
      pathname,
      list.filter,
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

  if (showError && errorContent && error) {
    return errorContent({
      error,
      refresh: () => {
        void refresh()
      }
    })
  }

  const filterCtx: DataListFiltersContext<F> = {
    filter: list.filter,
    setFilter: list.setFilter,
    clearFilter: list.clearFilter,
    hasActiveFilters: list.hasActiveFilters
  }
  const emptyCtx: DataListEmptyContext<F> = {
    filter: list.filter,
    clearFilter: list.clearFilter,
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
          {typeof filterContent === 'function' ? filterContent(filterCtx) : filterContent}
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
          emptyText={typeof emptyContent === 'function' ? emptyContent(emptyCtx) : emptyContent}
        />
      </div>
    </Flex>
  )
}
