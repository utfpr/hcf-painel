import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaListHeader from '@/features/taxonomia-shared/components/TaxonomiaListHeader'
import { useTaxonomiaPermissions } from '@/features/taxonomia-shared/hooks/useTaxonomiaPermissions'
import { StyleProvider } from '@ant-design/cssinjs'

import FamiliaModal from './components/FamiliaModal'
import FamiliaSearchPanel from './components/FamiliaSearchPanel'
import FamiliaTable from './components/FamiliaTable'
import { useFamiliaFormViewModel } from './view-models/useFamiliaFormViewModel'
import { useFamiliaListViewModel } from './view-models/useFamiliaListViewModel'

type TaxonomiaFamiliaLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaFamiliaLayout: React.FC<TaxonomiaFamiliaLayoutProps> = ({ history, location }) => {
  const listVM = useFamiliaListViewModel({ history, location })
  const formVM = useFamiliaFormViewModel({ onSuccess: listVM.refresh })
  const { canEdit } = useTaxonomiaPermissions()

  return (
    <StyleProvider hashPriority="high">
      <div>
        <FamiliaModal
          open={formVM.visibleModal}
          title={formVM.modalTitle}
          loading={formVM.loadingModal}
          editingId={formVM.editingId}
          control={formVM.form.control}
          reinos={formVM.reinos}
          fetchingReinos={formVM.fetchingReinos}
          onCancel={formVM.closeModal}
          onSubmit={formVM.submitModal}
          onSearchReinos={formVM.loadReinos}
        />

        <TaxonomiaListHeader title="Famílias" canEdit={canEdit} onAdd={formVM.openCreate} />

        <Divider dashed />

        <FamiliaSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
          total={listVM.metadata.total}
        />

        <Divider dashed />

        <FamiliaTable
          familias={listVM.familias}
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

export default TaxonomiaFamiliaLayout
