import { Button, Checkbox, Flex, Popover, Typography } from 'antd6'

import { SettingOutlined } from '@ant-design/icons'

export interface ColumnOption {
  key: string
  label: string
  mandatory?: boolean
}

export interface ColumnSettingsProps {
  columns: ColumnOption[]
  visibleKeys: string[]
  onChange: (keys: string[]) => void
  onReset: () => void
  title: string
  resetLabel: string
  triggerLabel: string
}

export function ColumnSettings({
  columns,
  visibleKeys,
  onChange,
  onReset,
  title,
  resetLabel,
  triggerLabel
}: ColumnSettingsProps) {
  const visible = new Set(visibleKeys)

  const content = (
    <Flex vertical gap={8} style={{ minWidth: 180 }}>
      <Typography.Text strong>{title}</Typography.Text>
      {columns.map(column => (
        <Checkbox
          key={column.key}
          checked={visible.has(column.key)}
          disabled={column.mandatory}
          onChange={event => {
            if (column.mandatory) return
            if (event.target.checked) {
              onChange([...visibleKeys, column.key])
              return
            }
            onChange(visibleKeys.filter(key => key !== column.key))
          }}
        >
          {column.label}
        </Checkbox>
      ))}
      <Button type="link" size="small" onClick={onReset} style={{ paddingInline: 0 }}>
        {resetLabel}
      </Button>
    </Flex>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button icon={<SettingOutlined />} aria-label={triggerLabel}>
        {triggerLabel}
      </Button>
    </Popover>
  )
}
