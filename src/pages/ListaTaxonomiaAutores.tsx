import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaAutoresLayout from '@/features/taxonomia-autores/TaxonomiaAutoresLayout'

const ListaTaxonomiaAutores: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaAutoresLayout history={history} location={location} />
)

export default ListaTaxonomiaAutores
