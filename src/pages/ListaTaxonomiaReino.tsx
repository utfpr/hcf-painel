import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaReinoLayout from '@/features/taxonomia-reino/TaxonomiaReinoLayout'

const ListaTaxonomiaReino: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaReinoLayout history={history} location={location} />
)

export default ListaTaxonomiaReino
