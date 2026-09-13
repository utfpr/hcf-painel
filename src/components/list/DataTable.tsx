import type { ReactNode } from 'react'

import { Table, type TableProps } from 'antd6'
import type { SorterResult } from 'antd6/es/table/interface'

import { useTableLocale } from './tableLocale'

export interface DataTableColumn<T> {
  key: string
  title: ReactNode
  width?: number | string
  align?: 'left' | 'center' | 'right'
  hideable?: boolean
  sortable?: boolean
  render: (row: T) => ReactNode
}

export interface DataTableSort {
  key: string
  order: 'asc' | 'desc'
}

export interface DataTableView {
  page: number
  pageSize: number
  total: number
  sort: DataTableSort | null
  pageSizeOptions?: readonly number[]
}

export interface DataTableChange {
  page: number
  pageSize: number
  sort: DataTableSort | null
}

export interface DataTableProps<T> {
  rowKey: keyof T | ((row: T) => string | number)
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  view?: DataTableView | false
  onChange?: (next: DataTableChange) => void
  onRowClick?: (row: T) => void
  emptyText?: ReactNode
}

const DEFAULT_PAGE_SIZE_OPTIONS = [
  20,
  50,
  100
] as const

function isRowActionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('a, button, [data-list-row-action]'))
}

function nextSortFromSorter<T>(
  sorter: SorterResult<T> | SorterResult<T>[],
  current: DataTableSort | null
): DataTableSort | null {
  if (Array.isArray(sorter)) return current
  if (sorter.order === 'ascend' || sorter.order === 'descend') {
    const key = sorter.columnKey ?? sorter.field
    if (key === undefined) return current
    return {
      key: String(key),
      order: sorter.order === 'ascend' ? 'asc' : 'desc'
    }
  }
  return null
}

function sortsEqual(left: DataTableSort | null, right: DataTableSort | null): boolean {
  if (left === null && right === null) return true
  if (left === null || right === null) return false
  return left.key === right.key && left.order === right.order
}

export function DataTable<T extends object>({
  rowKey,
  columns,
  data,
  loading,
  view,
  onChange,
  onRowClick,
  emptyText
}: DataTableProps<T>) {
  const locale = useTableLocale(emptyText)
  const sort = view === false ? null : (view?.sort ?? null)
  const pageSize = view === false
    ? undefined
    : view?.pageSize ?? DEFAULT_PAGE_SIZE_OPTIONS[0]

  const antdColumns: TableProps<T>['columns'] = columns.map(column => ({
    key: column.key,
    title: column.title,
    width: column.width,
    align: column.align,
    sorter: column.sortable ? true : undefined,
    sortOrder: column.sortable && sort?.key === column.key
      ? (sort.order === 'asc' ? 'ascend' : 'descend')
      : null,
    render: (_value: unknown, row: T) => column.render(row)
  }))

  return (
    <Table<T>
      size="middle"
      rowKey={rowKey as string | ((row: T) => string | number)}
      columns={antdColumns}
      dataSource={data}
      loading={loading}
      pagination={view === false
        ? false
        : {
          total: view?.total ?? 0,
          current: view?.page ?? 1,
          pageSize,
          showSizeChanger: {
            showSearch: false
          },
          pageSizeOptions: (view?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS)
            .map(String),
          showTotal: locale.showTotal,
          locale: locale.pagination,
          style: {
            margin: 0,
            padding: '12px 16px'
          }
        }}
      locale={{
        triggerDesc: locale.triggerDesc,
        triggerAsc: locale.triggerAsc,
        cancelSort: locale.cancelSort,
        emptyText: locale.emptyText
      }}
      onChange={(pager, _filters, sorter) => {
        if (!onChange) return
        const nextSort = nextSortFromSorter(sorter, sort)
        const sortChanged = !sortsEqual(sort, nextSort)
        onChange({
          page: sortChanged ? 1 : (pager.current ?? 1),
          pageSize: pager.pageSize ?? pageSize ?? DEFAULT_PAGE_SIZE_OPTIONS[0],
          sort: nextSort
        })
      }}
      onRow={onRowClick
        ? row => ({
          style: {
            cursor: 'pointer',
            transition: 'background-color 120ms ease'
          },
          tabIndex: 0,
          onClick: event => {
            if (isRowActionTarget(event.target)) return
            onRowClick(row)
          },
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onRowClick(row)
            }
          }
        })
        : undefined}
    />
  )
}
