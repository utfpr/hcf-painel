import React from 'react'

import {
  Button, Space
} from 'ant6'

export interface TaxonomiaModalFooterProps {
  title: string
  loading: boolean
  onCancel: () => void
  onSubmit: () => void | Promise<void>
}

const TaxonomiaModalFooter: React.FC<TaxonomiaModalFooterProps> = ({
  title,
  loading,
  onCancel,
  onSubmit
}) => (
  <Space>
    <Button onClick={onCancel}>Cancelar</Button>
    <Button type="primary" loading={loading} onClick={() => void onSubmit()}>
      {title}
    </Button>
  </Space>
)

export default TaxonomiaModalFooter
