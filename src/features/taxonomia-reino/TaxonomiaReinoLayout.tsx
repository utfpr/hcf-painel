import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import ReinoModal from './components/ReinoModal'
import ReinoSearchPanel from './components/ReinoSearchPanel'
import ReinoTable from './components/ReinoTable'
import { useReinoFormViewModel } from './view-models/useReinoFormViewModel'
import { useReinoListViewModel } from './view-models/useReinoListViewModel'

type TaxonomiaReinoLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaReinoLayout: React.FC<TaxonomiaReinoLayoutProps> = ({ history, location }) => {
  const listVM = useReinoListViewModel({ history, location })
  const formVM = useReinoFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <ReinoModal
          open={formVM.visibleModal}
          title={formVM.modalTitle}
          loading={formVM.loadingModal}
          control={formVM.form.control}
          onCancel={formVM.closeModal}
          onSubmit={formVM.submitModal}
        />

        <TaxonomiaListHeader title="Reinos" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <ReinoSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <ReinoTable
          reinos={listVM.reinos}
          metadata={listVM.metadata}
          page={listVM.page}
          pageSize={listVM.pageSize}
          loading={listVM.loading}
          lastSorter={listVM.lastSorter}
          canEdit={canEdit}
          onEdit={formVM.openForEdit}
          onChange={(pg, ps, sorter, sortChanged) => {
            void listVM.handleTableChange(pg, ps, sorter, sortChanged)
          }}
        />

        <Divider dashed />
      </div>
    </StyleProvider>
  )
}

export default TaxonomiaReinoLayout
