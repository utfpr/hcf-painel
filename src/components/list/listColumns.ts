import type { DataTableColumn } from './DataTable'

const EXCLUDED_FROM_SETTINGS = new Set(['actions'])

export function resolveColumns<T>(
  columns: DataTableColumn<T>[] | ((ctx: { isMobile: boolean }) => DataTableColumn<T>[]),
  isMobile: boolean
): DataTableColumn<T>[] {
  return typeof columns === 'function'
    ? columns({ isMobile })
    : columns
}

export function columnCatalogConfig<T>(catalog: DataTableColumn<T>[]) {
  const settingsColumns = catalog.filter(column => !EXCLUDED_FROM_SETTINGS.has(column.key))
  return {
    settingsColumns,
    columnKeys: settingsColumns.map(column => column.key),
    mandatoryColumnKeys: settingsColumns
      .filter(column => column.hideable === false)
      .map(column => column.key),
    allowedSortKeys: catalog
      .filter(column => column.sortable)
      .map(column => column.key)
  }
}

export function visibleColumns<T>(
  columns: DataTableColumn<T>[],
  visibleKeys: readonly string[]
): DataTableColumn<T>[] {
  const visible = new Set(visibleKeys)
  return columns.filter(column => column.hideable === false || visible.has(column.key))
}
