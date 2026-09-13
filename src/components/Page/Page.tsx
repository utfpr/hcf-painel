import { useEffect, type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Header } from './Header'

export interface PageProps {
  title: string
  description?: string
  extra?: ReactNode
  children?: ReactNode
}

export function Page({
  title,
  description,
  extra,
  children
}: PageProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const previousTitle = document.title
    document.title = t('page.title', { title })
    return () => {
      document.title = previousTitle
    }
  }, [t, title])

  return (
    <div>
      <Header
        title={title}
        description={description}
        extra={extra}
      />
      {children}
    </div>
  )
}
