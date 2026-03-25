import { Space } from 'antd6'

import { AsyncSelect } from './forms/AsyncSelect'
import { Select } from './forms/Select'

function fetcher(search?: string): Promise<{ value: string; label: string }[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const data = [
        { value: 'edvaldo', label: 'Edvaldo' },
        { value: 'elaine', label: 'Elaine' },
        { value: 'milady', label: 'Milady' },
        { value: 'cacau', label: 'Cacau' }
      ]
      const filteredData = search ? data.filter(item => item.label.toLowerCase().includes(search.toLowerCase())) : data
      resolve(filteredData)
    }, 2000)
  })
}

export function Edvaldo() {
  return (
    <Space>
      <Select
        style={{ width: 320 }}
        options={[]}
      />
      <AsyncSelect<{ value: string; label: string }>
        fetchKey="/api/users"
        fetcher={fetcher}
        style={{ width: 320 }}
      />
    </Space>
  )
}
