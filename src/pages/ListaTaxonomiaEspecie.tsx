import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaEspecieLayout from '@/features/taxonomia-especie/TaxonomiaEspecieLayout'

const ListaTaxonomiaEspecie: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaEspecieLayout history={history} location={location} />
)

export default ListaTaxonomiaEspecie
