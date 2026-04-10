import { useMemo } from 'react'

import { isCuradorOuOperador } from '@/helpers/usuarios'

export interface TaxonomiaPermissions {
  canEdit: boolean
}

export function useTaxonomiaPermissions(): TaxonomiaPermissions {
  return useMemo(
    () => ({
      canEdit: isCuradorOuOperador()
    }),
    []
  )
}
