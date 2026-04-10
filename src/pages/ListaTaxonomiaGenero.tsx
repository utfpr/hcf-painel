import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaGeneroLayout from '@/features/taxonomia-genero/TaxonomiaGeneroLayout'

const ListaTaxonomiaGenero: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaGeneroLayout history={history} location={location} />
)

export default ListaTaxonomiaGenero
