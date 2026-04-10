import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaSubespecieLayout from '@/features/taxonomia-subespecie/TaxonomiaSubespecieLayout'

const ListaTaxonomiaSubespecie: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaSubespecieLayout history={history} location={location} />
)

export default ListaTaxonomiaSubespecie
