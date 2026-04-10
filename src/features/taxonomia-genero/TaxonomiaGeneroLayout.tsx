import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import GeneroModal from './components/GeneroModal'
import GeneroSearchPanel from './components/GeneroSearchPanel'
import GeneroTable from './components/GeneroTable'
import { useGeneroFormViewModel } from './view-models/useGeneroFormViewModel'
import { useGeneroListViewModel } from './view-models/useGeneroListViewModel'

type TaxonomiaGeneroLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaGeneroLayout: React.FC<TaxonomiaGeneroLayoutProps> = ({ history, location }) => {
  const listVM = useGeneroListViewModel({ history, location })
  const formVM = useGeneroFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <GeneroModal
          open={formVM.visibleModal}
          title={formVM.modalTitle}
          loading={formVM.loadingModal}
          control={formVM.form.control}
          reinos={formVM.reinos}
          familias={formVM.familias}
          fetchingReinos={formVM.fetchingReinos}
          fetchingFamilias={formVM.fetchingFamilias}
          reinoSelecionado={formVM.reinoSelecionado}
          onCancel={formVM.closeModal}
          onSubmit={formVM.submitModal}
          onSearchReinos={text => {
            void formVM.loadReinos(text)
          }}
          onSearchFamilias={text => {
            void formVM.loadFamilias(text)
          }}
          onReinoChange={formVM.onReinoChange}
        />

        <TaxonomiaListHeader title="Gêneros" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <GeneroSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <GeneroTable
          generos={listVM.generos}
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

export default TaxonomiaGeneroLayout
