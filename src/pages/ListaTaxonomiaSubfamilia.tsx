import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaSubfamiliaLayout from '@/features/taxonomia-subfamilia/TaxonomiaSubfamiliaLayout'

const ListaTaxonomiaSubfamilia: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaSubfamiliaLayout history={history} location={location} />
)

export default ListaTaxonomiaSubfamilia
