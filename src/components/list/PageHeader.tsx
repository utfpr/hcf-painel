import type { ReactNode } from 'react'

import { Flex, Typography } from 'antd6'

export interface PageHeaderProps {
  title: string
  description?: string
  extra?: ReactNode
}

export function PageHeader({
  title,
  description,
  extra
}: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="flex-start"
      gap={16}
      wrap="wrap"
      style={{ marginBottom: 24 }}
    >
      <div>
        <Typography.Title
          level={2}
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1.3
          }}
        >
          {title}
        </Typography.Title>
        {description && (
          <Typography.Text
            type="secondary"
            style={{
              display: 'block',
              marginTop: 4,
              fontSize: 13
            }}
          >
            {description}
          </Typography.Text>
        )}
      </div>
      {extra}
    </Flex>
  )
}
