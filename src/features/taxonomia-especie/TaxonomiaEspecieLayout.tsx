import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import EspecieModal from './components/EspecieModal'
import EspecieSearchPanel from './components/EspecieSearchPanel'
import EspecieTable from './components/EspecieTable'
import { useEspecieFormViewModel } from './view-models/useEspecieFormViewModel'
import { useEspecieListViewModel } from './view-models/useEspecieListViewModel'

type TaxonomiaEspecieLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaEspecieLayout: React.FC<TaxonomiaEspecieLayoutProps> = ({ history, location }) => {
  const listVM = useEspecieListViewModel({ history, location })
  const formVM = useEspecieFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <EspecieModal
          open={formVM.visibleModal}
          title={formVM.modalTitle}
          loading={formVM.loadingModal}
          control={formVM.form.control}
          reinos={formVM.reinos}
          familias={formVM.familias}
          generos={formVM.generos}
          autores={formVM.autores}
          fetchingReinos={formVM.fetchingReinos}
          fetchingFamilias={formVM.fetchingFamilias}
          fetchingGeneros={formVM.fetchingGeneros}
          fetchingAutores={formVM.fetchingAutores}
          reinoSelecionado={formVM.reinoSelecionado}
          familiaSelecionada={formVM.familiaSelecionada}
          onCancel={formVM.closeModal}
          onSubmit={formVM.submitModal}
          onSearchReinos={text => {
            void formVM.loadReinos(text)
          }}
          onSearchFamilias={text => {
            void formVM.loadFamilias(text)
          }}
          onSearchGeneros={text => {
            void formVM.loadGeneros(text)
          }}
          onSearchAutores={text => {
            void formVM.loadAutores(text)
          }}
          onReinoChange={formVM.onReinoChange}
          onFamiliaChange={formVM.onFamiliaChange}
        />

        <TaxonomiaListHeader title="Espécies" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <EspecieSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <EspecieTable
          especies={listVM.especies}
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

export default TaxonomiaEspecieLayout
