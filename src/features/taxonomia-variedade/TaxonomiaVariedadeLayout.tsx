import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import VariedadeModal from './components/VariedadeModal'
import VariedadeSearchPanel from './components/VariedadeSearchPanel'
import VariedadeTable from './components/VariedadeTable'
import { useVariedadeFormViewModel } from './view-models/useVariedadeFormViewModel'
import { useVariedadeListViewModel } from './view-models/useVariedadeListViewModel'

type TaxonomiaVariedadeLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaVariedadeLayout: React.FC<TaxonomiaVariedadeLayoutProps> = ({ history, location }) => {
  const listVM = useVariedadeListViewModel({ history, location })
  const formVM = useVariedadeFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <VariedadeModal
          open={formVM.visibleModal}
          title={formVM.modalTitle}
          loading={formVM.loadingModal}
          control={formVM.form.control}
          reinos={formVM.reinos}
          familias={formVM.familias}
          generos={formVM.generos}
          especies={formVM.especies}
          autores={formVM.autores}
          fetchingReinos={formVM.fetchingReinos}
          fetchingFamilias={formVM.fetchingFamilias}
          fetchingGeneros={formVM.fetchingGeneros}
          fetchingEspecies={formVM.fetchingEspecies}
          fetchingAutores={formVM.fetchingAutores}
          reinoSelecionado={formVM.reinoSelecionado}
          familiaSelecionada={formVM.familiaSelecionada}
          generoSelecionado={formVM.generoSelecionado}
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
          onSearchEspecies={text => {
            void formVM.loadEspecies(text)
          }}
          onSearchAutores={text => {
            void formVM.loadAutores(text)
          }}
          onReinoChange={formVM.onReinoChange}
          onFamiliaChange={formVM.onFamiliaChange}
          onGeneroChange={formVM.onGeneroChange}
        />

        <TaxonomiaListHeader title="Variedades" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <VariedadeSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <VariedadeTable
          variedades={listVM.variedades}
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

export default TaxonomiaVariedadeLayout
