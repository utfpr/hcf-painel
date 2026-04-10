import React from 'react'

import { Divider } from 'ant6'
import { RouteComponentProps } from 'react-router-dom'

import HeaderListComponent from '@/components/HeaderListComponent'
import { StyleProvider } from '@ant-design/cssinjs'

import TaxonomiaScreenSearchPanel from './components/TaxonomiaScreenSearchPanel'
import TaxonomiaScreenTable from './components/TaxonomiaScreenTable'
import { useTaxonomiaScreenListViewModel } from './view-models/useTaxonomiaScreenListViewModel'

type TaxonomiaScreenLayoutProps = Pick<RouteComponentProps, 'history' | 'location'>

const TaxonomiaScreenLayout: React.FC<TaxonomiaScreenLayoutProps> = ({ history, location }) => {
  const listVM = useTaxonomiaScreenListViewModel({ history, location })

  return (
    <StyleProvider hashPriority="high">
      <div>
        <HeaderListComponent title="Taxonomia" link="/taxonomias/novo" />
        <Divider dashed />
        <TaxonomiaScreenSearchPanel
          control={listVM.searchForm.control}
          handleSubmit={listVM.searchForm.handleSubmit}
          onSearch={listVM.handleSearch}
          onClear={listVM.handleClear}
        />
        <Divider dashed />
        <TaxonomiaScreenTable
          taxonomias={listVM.taxonomias}
          metadata={listVM.metadata}
          page={listVM.page}
          pageSize={listVM.pageSize}
          loading={listVM.loading}
          onChange={(pg, ps) => {
            void listVM.handleTableChange(pg, ps)
          }}
        />
        <Divider dashed />
      </div>
    </StyleProvider>
  )
}

export default TaxonomiaScreenLayout
