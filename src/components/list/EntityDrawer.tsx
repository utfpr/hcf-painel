import type { ReactNode } from 'react'

import { Button, Drawer, Flex, Grid } from 'antd6'

export interface EntityDrawerProps {
  title: string
  open: boolean
  onClose: () => void
  onSubmit: () => void
  submitLabel: string
  cancelLabel: string
  submitting?: boolean
  children: ReactNode
}

export function EntityDrawer({
  title,
  open,
  onClose,
  onSubmit,
  submitLabel,
  cancelLabel,
  submitting = false,
  children
}: EntityDrawerProps) {
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={isMobile ? '100%' : 520}
      destroyOnHidden={false}
      footer={(
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="primary" onClick={onSubmit} loading={submitting}>
            {submitLabel}
          </Button>
        </Flex>
      )}
    >
      {children}
    </Drawer>
  )
}
