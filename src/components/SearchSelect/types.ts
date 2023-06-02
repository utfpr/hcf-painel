export type Option = {
  label: string
  value: unknown
}

export type RequestParam = {
  page: number
  limit: number
  text: string
  [property: string]: unknown
}

export type RequestFn = (params: RequestParam) => Promise<Option[]>
