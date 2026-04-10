import type { SorterResult } from 'antd/es/table/interface'

/** Normalizes Ant Design Table sorter into `{ field, order }` + whether sort changed vs last. */
export function normalizeTaxonomiaTableSorterChange<
  S extends { field?: string; order?: 'ascend' | 'descend' },
  Row = unknown
>(
  lastSorter: S | undefined,
  sorter: SorterResult<Row> | SorterResult<Row>[]
): { nextSorter: S; sortChanged: boolean } {
  const single = Array.isArray(sorter) ? sorter[0] : sorter
  const nextSorter = {
    field:
      single?.field !== undefined && single?.field !== null
        ? String(single.field)
        : undefined,
    order: single?.order ?? undefined
  } as S
  const sortChanged
    = (lastSorter?.field ?? undefined) !== (nextSorter.field ?? undefined)
        || (lastSorter?.order ?? undefined) !== (nextSorter.order ?? undefined)
  return { nextSorter, sortChanged }
}
