import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import SubfamiliaModal from './components/SubfamiliaModal'
import SubfamiliaSearchPanel from './components/SubfamiliaSearchPanel'
import SubfamiliaTable from './components/SubfamiliaTable'
import { useSubfamiliaFormViewModel } from './view-models/useSubfamiliaFormViewModel'
import { useSubfamiliaListViewModel } from './view-models/useSubfamiliaListViewModel'

type TaxonomiaSubfamiliaLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaSubfamiliaLayout: React.FC<TaxonomiaSubfamiliaLayoutProps> = ({ history, location }) => {
  const listVM = useSubfamiliaListViewModel({ history, location })
  const formVM = useSubfamiliaFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <SubfamiliaModal
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

        <TaxonomiaListHeader title="Subfamílias" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <SubfamiliaSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <SubfamiliaTable
          subfamilias={listVM.subfamilias}
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

export default TaxonomiaSubfamiliaLayout
