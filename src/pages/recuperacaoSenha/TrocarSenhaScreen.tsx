import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import InicioLayout from '../InicioScreen'
import TrocarSenhaForm from './components/TrocarSenhaForm'

export default function TrocarSenhaScreen({ location }: RouteComponentProps) {
  const query = new URLSearchParams(location.search)
  const token = query.get('token') || ''
  console.log('token:', token)

  const handleSuccess = () => {
    window.location.href = '/inicio'
  }

  return (
    <InicioLayout>
      <TrocarSenhaForm token={token} onSuccess={handleSuccess} />
    </InicioLayout>
  )
}
