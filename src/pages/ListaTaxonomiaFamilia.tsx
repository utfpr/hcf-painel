import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaFamiliaLayout from '@/features/taxonomia-familia/TaxonomiaFamiliaLayout'

const ListaTaxonomiaFamilia: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaFamiliaLayout history={history} location={location} />
)

export default ListaTaxonomiaFamilia
