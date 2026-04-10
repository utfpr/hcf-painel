import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaVariedadeLayout from '@/features/taxonomia-variedade/TaxonomiaVariedadeLayout'

const ListaTaxonomiaVariedade: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaVariedadeLayout history={history} location={location} />
)

export default ListaTaxonomiaVariedade
