import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import AutorModal from './components/AutorModal'
import AutorSearchPanel from './components/AutorSearchPanel'
import AutorTable from './components/AutorTable'
import { useAutorFormViewModel } from './view-models/useAutorFormViewModel'
import { useAutorListViewModel } from './view-models/useAutorListViewModel'

type TaxonomiaAutoresLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaAutoresLayout: React.FC<TaxonomiaAutoresLayoutProps> = ({ history, location }) => {
  const listVM = useAutorListViewModel({ history, location })
  const formVM = useAutorFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <AutorModal
          open={formVM.visibleModal}
          title={formVM.modalTitle}
          loading={formVM.loadingModal}
          control={formVM.form.control}
          onCancel={formVM.closeModal}
          onSubmit={formVM.submitModal}
        />

        <TaxonomiaListHeader title="Autores" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <AutorSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <AutorTable
          autores={listVM.autores}
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

export default TaxonomiaAutoresLayout
