import React from 'react'

import { RouteComponentProps } from 'react-router-dom'

import TaxonomiaScreenLayout from '@/features/taxonomia-screen/TaxonomiaScreenLayout'

const ListaTaxonomiaScreen: React.FC<RouteComponentProps> = ({ history, location }) => (
  <TaxonomiaScreenLayout history={history} location={location} />
)

export default ListaTaxonomiaScreen
