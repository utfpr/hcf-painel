import type { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

export function useTableLocale(emptyText?: ReactNode) {
  const { t } = useTranslation('simpleTableComponent')

  return {
    triggerDesc: t('ordenacaoDecrescente'),
    triggerAsc: t('ordenacaoCrescente'),
    cancelSort: t('cancelarOrdenacao'),
    emptyText,
    pagination: {
      items_per_page: `/ ${t('pagina')}`,
      jump_to: t('irPara'),
      jump_to_confirm: t('irParaConfirmar'),
      page: t('pagina'),
      prev_page: t('paginaAnterior'),
      next_page: t('proximaPagina'),
      prev_5: t('voltar5Paginas'),
      next_5: t('avancar5Paginas'),
      prev_3: t('voltar3Paginas'),
      next_3: t('avancar3Paginas')
    },
    showTotal: (total: number, range: [number, number]) => t('intervaloTotal', {
      from: range[0],
      to: range[1],
      total
    })
  }
}
